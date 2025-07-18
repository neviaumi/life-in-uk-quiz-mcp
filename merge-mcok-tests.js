#!/usr/bin/env node

/**
 * merge-mcok-tests.js
 * 
 * This script merges all "Mock Test X.json" files in the mock-tests directory
 * into a single JSON array and writes the result to mock-test.json in the project root.
 * 
 * Note: There's a typo in the filename (mcok instead of mock), but we're keeping it
 * as is to match the existing file.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules (equivalent to __dirname in CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory containing the mock test files
const mockTestsDir = path.join(__dirname, 'mock-tests');
// Output file path
const outputFilePath = path.join(__dirname, "mock-tests" ,'mock-test.json');

/**
 * Reads a JSON file and parses its contents
 * @param {string} filePath - Path to the JSON file
 * @returns {Promise<Object>} - Parsed JSON object
 */
async function readJsonFile(filePath) {
  try {
    const data = await fs.promises.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    throw error;
  }
}

/**
 * Main function to merge all mock test files
 */
async function mergeMockTests() {
  try {
    console.log('Starting to merge mock test files...');
    
    // Read all files in the mock-tests directory
    const files = await fs.promises.readdir(mockTestsDir);
    
    // Filter for files matching the pattern "Mock Test X.json"
    const mockTestFiles = files.filter(file => /^Mock Test \d+\.json$/.test(file));
    
    if (mockTestFiles.length === 0) {
      console.error('No mock test files found!');
      process.exit(1);
    }
    
    console.log(`Found ${mockTestFiles.length} mock test files to merge.`);
    
    // Sort the files numerically (Mock Test 1.json, Mock Test 2.json, etc.)
    mockTestFiles.sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)[0]);
      const numB = parseInt(b.match(/\d+/)[0]);
      return -(numA - numB);
    });
    
    // Array to hold all questions from all files
    let allQuestions = [];
    
    // Read and merge each file
    for (const file of mockTestFiles) {
      const filePath = path.join(mockTestsDir, file);
      console.log(`Processing ${file}...`);
      
      try {
        const questions = await readJsonFile(filePath);
        
        // Ensure the file contains an array
        if (!Array.isArray(questions)) {
          console.warn(`Warning: ${file} does not contain a JSON array. Skipping.`);
          continue;
        }
        
        // Add questions from this file to the combined array
        allQuestions = allQuestions.concat(questions);
        console.log(`Added ${questions.length} questions from ${file}`);
      } catch (error) {
        console.error(`Error processing ${file}. Skipping this file.`);
        // Continue with other files even if one fails
      }
    }
    
    console.log(`Total questions merged: ${allQuestions.length}`);
    
    // Write the combined array to the output file
    await fs.promises.writeFile(outputFilePath, JSON.stringify(allQuestions, null, 2));
    console.log(`Successfully wrote merged questions to ${outputFilePath}`);
    
  } catch (error) {
    console.error('An error occurred during the merge process:', error.message);
    process.exit(1);
  }
}

// Execute the main function
mergeMockTests();