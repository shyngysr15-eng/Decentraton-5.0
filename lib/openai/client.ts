import OpenAI from 'openai';

import { BatchResult, FinalScoreResult, finalScoreResultSchema, llmBatchResponseSchema } from '@/lib/types';

const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

let cachedClient: OpenAI | null = null;

function getClient() {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  if (!cachedClient) {
    cachedClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  return cachedClient;
}

function cleanModelJson(raw: string) {
  const trimmed = raw.trim().replace(/^```json\s*/i, '').replace(/^```/, '').replace(/```$/, '').trim();
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
    throw new Error('Модель не вернула JSON-объект');
  }

  return trimmed.slice(firstBrace, lastBrace + 1);
}

function parseJsonSafely<T>(content: string, validator: { parse: (value: unknown) => T }) {
  let parsed: unknown;

  try {
    parsed = JSON.parse(cleanModelJson(content));
  } catch {
    throw new Error('Не удалось распарсить JSON от модели');
  }

  return validator.parse(parsed);
}

async function completeJson(systemPrompt: string, userPrompt: string) {
  const client = getClient();

  if (!client) {
    throw new Error('OPENAI_API_KEY не задан');
  }

  const response = await client.chat.completions.create({
    model: OPENAI_MODEL,
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error('Модель вернула пустой ответ');
  }

  return content;
}

export function getScoringMode() {
  return process.env.OPENAI_API_KEY ? ('llm' as const) : ('mock' as const);
}

export async function requestBatchScoring(systemPrompt: string, userPrompt: string): Promise<Omit<BatchResult, 'modules'> & { modules: Array<Omit<BatchResult['modules'][number], 'key'>> }> {
  const content = await completeJson(systemPrompt, userPrompt);
  return parseJsonSafely(content, llmBatchResponseSchema);
}

export async function requestFinalAggregation(systemPrompt: string, userPrompt: string): Promise<FinalScoreResult> {
  const content = await completeJson(systemPrompt, userPrompt);
  return parseJsonSafely(content, finalScoreResultSchema);
}