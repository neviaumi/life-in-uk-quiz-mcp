import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import mockTest from "./mock-tests/mock-test.json" with { type: "json" };
import * as z from "zod";

const server = new McpServer({
  name: "life-in-uk-quiz",
  version: "1.0.0",
  description:
    "A comprehensive question pool for the Life in the UK citizenship test",
});

server.registerPrompt(
  "generateQuizPrompt",
  {
    title: "Generate a balanced 24-question quiz",
    description:
      "Generates a 24-question quiz with a balanced distribution of questions across syllabus chapters.",
  },
  () => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Generate a 24-question Life in the UK quiz and save it to quiz.json,
  ensuring the questions are evenly distributed across the 5 syllabus
  chapters.

  To do this, first get the full list of available questions using the
  \`getQuizQuestions\` tool. Note that each question comes with a unique
  ID. Analyze the content of each question to categorize them by chapter.
  From your categorized lists, create a balanced selection of 24 question
  IDs (4-5 per chapter). Finally, generate the quiz by passing the
  selected IDs to the \`generateQuiz\` tool in a single call, and write the
  result to \`quiz.json\`.`,
        },
      },
    ],
  }),
);

server.registerPrompt(
  "interactiveQuizPrompt",
  {
    title: "Interactive Life in the UK Quiz from File",
    description:
      "Creates an interactive canvas-based quiz from an uploaded markdown file of questions.",
  },
  () => ({
    messages: [
      {
        role: "user",
        content: {
          type: `text`,
          text: `**Role:** You are a friendly and helpful tutor for the Life in the UK test.

**Goal:** Your primary task is to create an interactive quiz from the attached file containing 24 questions and help me practice.

**Instructions for the interactive quiz:**
1.  **Directly embed the content of the attached JSON file into a JavaScript variable within the application code, without using any remote fetching mechanisms (e.g., \`fetch\` API).**
2.  Read the questions from this in-memory variable.
3.  Create an interactive Canvas (Web App) to present the quiz.
4.  Display one question at a time with its multiple-choice options. **Allow me to select one or more answers as indicated by the question's remark (e.g., 'Mark one answer' or 'Mark two answers').**
5.  After I submit my answer for a question, immediately show me if it was correct or incorrect. If incorrect, please tell me the right answer.
6.  Keep track of my score as I go through the quiz.

**After the quiz:**
1.  Once all 24 questions are answered, display my final score (e.g., 18/24).
2.  Based on my incorrect answers, analyze and identify the topics or themes where I need more study from the "Life in the UK" handbook.
3.  Present a summary of these areas for improvement to help me prepare for the real test.
`,
        },
      },
    ],
  }),
);

// Add an addition tool
server.registerTool(
  "generateQuiz",
  {
    title: "Generate Quiz",
    description:
      "Creates a customized mock test from a selection of provided question IDs",
    inputSchema: {
      questionIds: z.array(z.number()).max(24),
    },
    outputSchema: {
      questions: z.array(
        z.object({
          question: z.string(),
          remark: z.string(),
          options: z.array(
            z.object({
              value: z.string(),
              isAnswer: z.boolean(),
            }),
          ),
        }),
      ),
    },
  },
  async ({ questionIds }) => {
    function shuffleArray(source) {
      for (let i = source.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [source[i], source[j]] = [source[j], source[i]];
      }
      return source;
    }
    const matchQuestions = shuffleArray(
      questionIds.map((id) => mockTest[id]).filter(Boolean),
    ).map((question) => {
      return {
        ...question,
        options: shuffleArray(question.options),
      };
    });
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ questions: matchQuestions }),
        },
      ],
      structuredContent: {
        questions: matchQuestions,
      },
    };
  },
);

function getAllQuestions() {
  const genericQuestions = [
    "Which of the following statements is correct?",
    "Which of these statements is correct?",
  ];
  const allQuestions = mockTest.map((q, index) => ({
    id: index,
    question: q.question.trim(),
    options: q.options.map((option) => option.value),
  }));
  const questionIds = Object.values(
    Object.fromEntries(
      allQuestions
        .filter((question) => !genericQuestions.includes(question.question))
        .map((question) => [question.question, question.id]),
    ),
  );
  return allQuestions
    .filter(
      (question) =>
        genericQuestions.includes(question.question) ||
        questionIds.includes(question.id),
    )
    .map((question) => {
      if (genericQuestions.includes(question.question)) {
        return question;
      }
      return {
        id: question.id,
        question: question.question,
      };
    });
}

server.registerTool(
  "getQuizQuestions",
  {
    title: "Quiz Questions", // Display name for UI
    description:
      "Retrieves all available questions from the Life in the UK mock test question pool, each with a unique ID.",
    outputSchema: {
      questions: z.array(
        z.object({
          id: z.number(),
          question: z.string(),
          options: z.array(z.string()).optional(),
        }),
      ),
    },
  },
  async () => {
    const questions = getAllQuestions();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ questions }),
        },
      ],
      structuredContent: {
        questions,
      },
    };
  },
);

server.registerResource(
  "quizQuestions",
  "quiz://",
  {
    title: "Quiz Questions", // Display name for UI
    description:
      "Collection of all available questions from the Life in the UK mock test question pool",
  },
  async (uri) => ({
    contents: getAllQuestions().map(({ id: index, question: question }) => ({
      uri: `${uri.href}${index}`,
      text: question,
    })),
  }),
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
