
import { config } from 'dotenv';
config(); // Load .env file for local development

import '@/ai/flows/generate-style-recommendations.ts';
// This file is primarily for local Genkit development/testing
// Ensure GOOGLE_API_KEY is in your .env for this to work locally
console.log("Genkit development server starting with flows loaded...");
console.log("Ensure GOOGLE_API_KEY is set in your .env file for local testing.");
