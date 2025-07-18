#!/usr/bin/env bash

id=$1
op run --env-file="./.env" -- npx gemini -y -p "As a quality assurance expert, your task is to validate the Life in the UK mock test file: @mock-tests/Mock Test $id.json.

The file must adhere to the following rules:
1.  **File Structure:** It must be a JSON array containing exactly 24 question objects.
2.  **Answer Count:** For each question, the number of options with \"isAnswer\": true must correspond to the instruction in the 'remark' field (e.g., 'Mark one answer' for one, 'Mark two answers' for two).
3.  **Answer Correctness:** The 'value' of the option(s) where \"isAnswer\": true must be the factually correct answer to the 'question'.

Please perform the validation and report the results.
- If the file is valid, respond with 'OK'.
- If you find any issues, provide a list of the problems. For each problem, please specify the question's index (starting from 0), the question itself, and a clear description of the issue."