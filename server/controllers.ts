import { ITransaction, IRule } from './models';
import { evaluateRule } from './ruleEvaluator';
import { inMemoryTransactions, inMemoryRules } from './db';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import { Buffer } from 'node:buffer';

// Initialize OpenAI Client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
});

// Helper to generate unique IDs for in-memory items
const generateUniqueId = () => Date.now().toString() + Math.random().toString(36).substring(2, 9);

// Transaction Controllers
export const getTransactions = async (): Promise<ITransaction[]> => {
  return inMemoryTransactions;
};

export const addTransaction = async (transactionData: Omit<ITransaction, 'id'>): Promise<ITransaction> => {
  const newTransaction: ITransaction = {
    id: generateUniqueId(),
    ...transactionData,
    date: new Date(transactionData.date), // Convert date string to Date object
  };
  inMemoryTransactions.push(newTransaction);
  return newTransaction;
};

// Rule Controllers
export const getRules = async (): Promise<IRule[]> => {
  return inMemoryRules;
};

export const addRule = async (ruleData: Omit<IRule, 'id'>): Promise<IRule> => {
  const newRule: IRule = {
    id: generateUniqueId(),
    ruleDefinition: ruleData.ruleDefinition,
  };
  inMemoryRules.push(newRule);
  return newRule;
};

// Reapply Rules Controller
export const reapplyRules = async () => {
  let updatedCount = 0;

  for (const transaction of inMemoryTransactions) {
    for (const rule of inMemoryRules) {
      // Extract newCategory from rule.ruleDefinition
      const parts = rule.ruleDefinition.split('->');
      if (parts.length !== 2) {
        console.error('Invalid ruleDefinition format in stored rule:', rule.ruleDefinition);
        continue; // Skip this rule if format is invalid
      }
      const newCategoryFromRule = parts[1].trim().replace(/^"|"$/g, ''); // Remove quotes

      if (evaluateRule(transaction, rule)) {
        if (transaction.category !== newCategoryFromRule) {
          transaction.category = newCategoryFromRule;
          updatedCount++;
        }
        // Apply the first matching rule and break
        break;
      }
    }
  }
  return { message: `Re-categorized ${updatedCount} transactions.` };
};

// Transcription Controller using OpenAI Whisper
export const transcribeAudio = async (audioBuffer: ArrayBuffer): Promise<{ transcript: string }> => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set in environment variables.');
  }

  const tempFilePath = path.join(__dirname, `temp-audio-${Date.now()}.webm`);

  try {
    console.log('Received audioBuffer size:', audioBuffer.byteLength);
    if (audioBuffer.byteLength === 0) {
      throw new Error('Received empty audio buffer.');
    }
    // Write the audio buffer to a temporary file
    fs.writeFileSync(tempFilePath, Buffer.from(audioBuffer));
    console.log('Temporary audio file written to:', tempFilePath);

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: "whisper-1",
      language: "en", // Explicitly set language to English
    });

    return { transcript: transcription.text };
  } catch (error) {
    console.error('Error transcribing audio with OpenAI Whisper:', error);
    throw new Error(`Failed to transcribe audio: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    // Clean up the temporary file
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  }
};

