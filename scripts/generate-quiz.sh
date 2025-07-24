#!/usr/bin/env bash

op run --env-file="./.env" -- npx gemini -y -s -p "Generate a 24-question Life in the UK quiz and save it to quiz.json,
ensuring the questions are evenly distributed across the 5 syllabus
chapters.

To do this, first get the full list of available questions using the
\`getQuizQuestions\` tool. Note that each question comes with a unique
ID. Analyze the content of each question to categorize them by chapter.
From your categorized lists, create a balanced selection of 24 question
IDs (4-5 per chapter). Finally, generate the quiz by passing the
selected IDs to the \`generateQuiz\` tool in a single call, and write the
result to \`quiz.json\`."
