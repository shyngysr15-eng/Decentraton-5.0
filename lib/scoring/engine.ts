import { ZodError } from 'zod';

import { getScoringMode, requestBatchScoring, requestFinalAggregation } from '@/lib/openai/client';
import { getModuleDefinitionsByName, generateMockBatchResult, generateMockFinalResult } from '@/lib/mock/mockScoring';
import { getBlockDefinition, getNextBlockNumber, getStatusForBlock } from '@/lib/scoring/blocks';
import { buildBatchPrompt, buildFinalAggregationPrompt, buildSystemPrompt } from '@/lib/scoring/prompts';
import { finalizeApplication, getApplication, saveBatchResult } from '@/lib/store';
import { BatchResult, FinalScoreResult, ModuleScore } from '@/lib/types';

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function mapModulesToDefinitions(blockNumber: 1 | 2 | 3 | 4, modules: Array<Omit<ModuleScore, 'key'>>) {
  const block = getBlockDefinition(blockNumber);

  if (!block) {
    throw new Error(`Неизвестный блок ${blockNumber}`);
  }

  const normalizedModules: ModuleScore[] = block.modules.map((expectedModule) => {
    const modelModule = modules.find(
      (item) => item.name.trim().toLowerCase() === expectedModule.name.trim().toLowerCase()
    );

    if (!modelModule) {
      throw new Error(`Модель не вернула модуль «${expectedModule.name}» для блока ${blockNumber}`);
    }

    const maxScore = Math.max(modelModule.max_score, 0.1);

    return {
      key: expectedModule.key,
      name: expectedModule.name,
      score: round(clamp(modelModule.score, 0, maxScore)),
      max_score: round(maxScore),
      reasoning: modelModule.reasoning,
      key_factors: modelModule.key_factors
    };
  });

  return normalizedModules;
}

function computeBatchTotal(modules: ModuleScore[]) {
  return round(modules.reduce((total, module) => total + module.score, 0));
}

function computeFinalScore(allBatchResults: BatchResult[]) {
  const modules = allBatchResults.flatMap((batch) => batch.modules);
  const total = modules.reduce((sum, module) => sum + module.score, 0);
  const max = modules.reduce((sum, module) => sum + module.max_score, 0);

  return round((total / Math.max(max, 1)) * 100);
}

function withSafeScoringError(error: unknown) {
  if (error instanceof ZodError) {
    return new Error(error.issues.map((issue) => issue.message).join('; '));
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error('Неизвестная ошибка скоринга');
}

async function scoreBlock(recordId: string, blockNumber: 1 | 2 | 3 | 4) {
  const application = getApplication(recordId);

  if (!application) {
    throw new Error('Заявка не найдена');
  }

  const mode = getScoringMode();

  try {
    let batchResult: BatchResult;

    if (mode === 'mock') {
      batchResult = generateMockBatchResult(application.input, blockNumber);
    } else {
      const rawBatch = await requestBatchScoring(
        buildSystemPrompt(),
        buildBatchPrompt(application.input, blockNumber)
      );
      const normalizedModules = mapModulesToDefinitions(blockNumber, rawBatch.modules);
      batchResult = {
        block: blockNumber,
        modules: normalizedModules,
        block_total: computeBatchTotal(normalizedModules)
      };
    }

    const status = getStatusForBlock(blockNumber);
    const updated = saveBatchResult(recordId, { ...batchResult, block_total: computeBatchTotal(batchResult.modules) }, status);

    if (!updated) {
      throw new Error('Не удалось сохранить результат блока');
    }

    return updated;
  } catch (error) {
    throw withSafeScoringError(error);
  }
}

async function runFinalAggregation(recordId: string) {
  const application = getApplication(recordId);

  if (!application) {
    throw new Error('Заявка не найдена');
  }

  if (application.batchResults.length !== 4) {
    throw new Error('Финальная агрегация возможна только после 4 блоков');
  }

  const serverComputedScore = computeFinalScore(application.batchResults);
  const mode = getScoringMode();

  try {
    let finalResult: FinalScoreResult;

    if (mode === 'mock') {
      finalResult = generateMockFinalResult(application.batchResults);
    } else {
      const llmResult = await requestFinalAggregation(
        [
          'Ты финальный агрегационный модуль для скоринга агросубсидий.',
          'Используй только уже готовые batch results и не пересчитывай блоки.',
          'Верни только JSON без Markdown.'
        ].join(' '),
        buildFinalAggregationPrompt(application.batchResults)
      );

      finalResult = {
        ...llmResult,
        final_score: serverComputedScore
      };
    }

    finalResult.final_score = serverComputedScore;
    const finalized = finalizeApplication(recordId, finalResult);

    if (!finalized) {
      throw new Error('Не удалось сохранить финальный результат');
    }

    return finalized;
  } catch (error) {
    throw withSafeScoringError(error);
  }
}

export async function startScoring(recordId: string) {
  const application = getApplication(recordId);

  if (!application) {
    throw new Error('Заявка не найдена');
  }

  if (application.batchResults.length > 0 || application.currentBlock !== 0) {
    throw new Error('Расчет уже был запущен для этой заявки');
  }

  return scoreBlock(recordId, 1);
}

export async function continueScoring(recordId: string) {
  const application = getApplication(recordId);

  if (!application) {
    throw new Error('Заявка не найдена');
  }

  if (application.status === 'completed') {
    return application;
  }

  const nextBlock = getNextBlockNumber(application.currentBlock);

  if (!nextBlock) {
    throw new Error('Следующий блок для расчета отсутствует');
  }

  const updated = await scoreBlock(recordId, nextBlock);

  if (nextBlock === 4) {
    return runFinalAggregation(recordId);
  }

  return updated;
}

export function getModuleLabel(moduleKey: string) {
  return getModuleDefinitionsByName(moduleKey)?.name ?? moduleKey;
}