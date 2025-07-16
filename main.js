import {
  McpServer,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import mockTest from './mock-tests/mock-test.json' with {type: 'json'};
import * as z from 'zod';

const server = new McpServer({
  name: 'life-in-uk-quiz',
  version: '1.0.0',
  description: 'A comprehensive question pool for the Life in the UK citizenship test',
});

// Add an addition tool
server.registerTool('generateQuiz',
    {
      title: 'Generate Quiz',
      description: 'Creates a customized mock test from a selection of provided question IDs',
      inputSchema: {
        questionIds: z.array(z.number()).max(24),
      },
      outputSchema: {
        questions: z.array(z.object({
              question: z.string(),
              remark: z.string(),
              options: z.array(z.object({
                    value: z.string(),
                    isAnswer: z.boolean(),
                  }),
              ),
            }),
        ),
      },
    },
    async ({questionIds}) => {
      const matchQuestions = questionIds.map(id => mockTest[id]).filter(Boolean);
      return ({
        content: [
          {
            type: 'text',
            text: JSON.stringify(matchQuestions),
          }],
        structuredContent: {
          questions: matchQuestions,
        },
      });
    },
);

server.registerTool(
    'getQuizQuestions',
    {
      title: 'Quiz Questions',      // Display name for UI
      description: 'Retrieves all available questions from the Life in the UK mock test question pool, each with a unique ID.',
      outputSchema: {
        questions: z.array(z.object({
          id: z.number(),
          question: z.string()
        })),
      },
    },
    async () => {
      const questions = mockTest.map((q, index) => ({ id: index, question: q.question.trim() }));
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(questions),
          }],
        structuredContent: {
          questions,
        },
      };
    },
);

server.registerResource(
    'quizQuestions',
    'quizs://',
    {
      title: 'Quiz Questions',      // Display name for UI
      description: 'Collection of all available questions from the Life in the UK mock test question pool',
    },
    async (uri) => ({
      contents: mockTest.map((q, index) => ({uri: `${uri.href}${index}`, text: q.question.trim()})),
    }),
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);