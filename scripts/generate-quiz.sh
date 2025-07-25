#!/usr/bin/env bash

op run --env-file="./.env" -- npx gemini -y -s -p "Generate a 24-question Life in the UK quiz and save it to quiz.json,
ensuring the questions are evenly distributed across the 5 syllabus
chapters.

Here are the definitions of the 5 chapters:
- **The values and principles of the UK**: This section covers the responsibilities and privileges of being a British citizen or permanent resident of the UK.
- **What is the UK**: In this section you will learn about the countries which mark up the UK.
- **A long and illustrious history**: In this section you will learn about the historical events and people that have helped to shape the UK.
- **A modern, thriving society**: This section will tell you about aspects of life in the UK today.
- **The UK government, the law and your role**: This section will tell you about the UK's democratic system of government and will help you understand your role in the wider community.

To do this, first get the full list of available questions using the
\`getQuizQuestions\` tool. Note that each question comes with a unique
ID. Analyze the content of each question to categorize them by chapter
based on the definitions above.
From your categorized lists, create a balanced selection of 24 question
IDs (4-5 per chapter). Finally, generate the quiz by passing the
selected IDs to the \`generateQuiz\` tool in a single call, and write the
result to \`quiz.json\`."