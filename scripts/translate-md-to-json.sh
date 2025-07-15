#!/usr/bin/env bash
set -ex

op run --env-file="./.env" -- npx gemini << EOF
Read though @mock-tests-source/*.md , it contain couple of mock test for LifeInUK in MD format
Translate the md into JSON and follow the json schema below
```jsonschema
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "items": {
    "type": "object",
    "properties": {
      "question": {
        "type": "string"
      },
      "remark": {
        "type": "string"
      },
      "options": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "value": {
              "type": "string"
            },
            "isAnswer": {
              "type": "boolean"
            }
          },
          "required": [
            "value",
            "isAnswer"
          ]
        },
        "minItems": 1,
        "maxItems": 4
      }
    },
    "required": [
      "question",
      "remark",
      "options"
    ],
    "additionalProperties": false
  },
  "minItems": 24,
  "maxItems": 24,
  "type": "array"
}
```
You should generate the json file into @mock-tests in one to one
For example, given "@mock-tests-source/Mock Test 1 1f346f1119ae802ebb79d5918e4a71b4.md" you should generate @mock-tests/Mock Test 1.json accordingly.

Each question may or may not have separated by
```md
---
```

If any file you feel cannot parse into JSON, print the file path into console.
I will have a look.

EOF