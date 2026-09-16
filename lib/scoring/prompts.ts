import { FarmApplicationInput, BatchResult } from '@/lib/types';
import { getBlockDefinition } from '@/lib/scoring/blocks';

export function buildSystemPrompt() {
  return [
    'Ты аналитический модуль для скоринга заявок на агросубсидии Казахстана.',
    'Считай только текущий блок из 3 модулей и никогда не переходи к другим блокам.',
    'Нельзя анализировать все 12 модулей сразу.',
    'Не давай итоговый вывод по заявке до финальной агрегации.',
    'Верни только валидный JSON без Markdown, пояснений и лишнего текста.',
    'Для каждого модуля верни name, score, max_score, reasoning, key_factors.',
    'Оценивай каждый модуль по шкале от 0 до 5.',
    'Опирайся только на входные данные заявки и делай сдержанные, профессиональные выводы.'
  ].join(' ');
}

export function buildBatchPrompt(application: FarmApplicationInput, blockNumber: 1 | 2 | 3 | 4) {
  const block = getBlockDefinition(blockNumber);

  if (!block) {
    throw new Error(`Неизвестный блок ${blockNumber}`);
  }

  return [
    `Рассчитай только блок ${block.block}: ${block.title}.`,
    'Не считай другие блоки и не упоминай их.',
    'Нужно вернуть JSON строго в формате:',
    '{"block":1,"modules":[{"name":"История","score":4.3,"max_score":5,"reasoning":"...","key_factors":["...","..."]}],"block_total":12.4}',
    'Модули текущего блока:',
    ...block.modules.map((module, index) => `${index + 1}. ${module.name}: ${module.focus}`),
    'Входные данные заявки:',
    JSON.stringify(application, null, 2)
  ].join('\n');
}

export function buildFinalAggregationPrompt(allBatchResults: BatchResult[]) {
  return [
    'Сформируй финальную агрегацию уже готовых результатов по всем 4 блокам.',
    'Не пересчитывай модули заново и не добавляй новые данные.',
    'Верни только JSON без Markdown в формате:',
    '{"final_score":58.5,"summary":"...","strengths":["..."],"weaknesses":["..."],"risk_flags":["..."]}',
    'Используй сдержанный язык кредитного/аналитического отчета.',
    'Данные по блокам:',
    JSON.stringify(allBatchResults, null, 2)
  ].join('\n');
}