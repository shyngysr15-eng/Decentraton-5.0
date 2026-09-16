import { ApplicationRecord, ApplicationStatus, BatchResult, FarmApplicationInput, FinalScoreResult } from '@/lib/types';

type ApplicationStore = Map<string, ApplicationRecord>;

declare global {
  var __applicationStore__: ApplicationStore | undefined;
}

const store = globalThis.__applicationStore__ ?? new Map<string, ApplicationRecord>();

if (!globalThis.__applicationStore__) {
  globalThis.__applicationStore__ = store;
}

export function createApplication(input: FarmApplicationInput, mode: 'mock' | 'llm'): ApplicationRecord {
  const now = new Date().toISOString();
  const record: ApplicationRecord = {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    status: 'draft',
    input,
    currentBlock: 0,
    completedBlocks: [],
    batchResults: [],
    finalResult: null,
    mode
  };

  store.set(record.id, record);

  return record;
}

export function getApplication(id: string) {
  return store.get(id) ?? null;
}

export function updateApplication(id: string, updater: (current: ApplicationRecord) => ApplicationRecord) {
  const current = getApplication(id);

  if (!current) {
    return null;
  }

  const updated = updater(current);
  updated.updatedAt = new Date().toISOString();
  store.set(id, updated);

  return updated;
}

export function saveBatchResult(id: string, batchResult: BatchResult, status: ApplicationStatus) {
  return updateApplication(id, (current) => ({
    ...current,
    status,
    currentBlock: batchResult.block,
    completedBlocks: [...new Set([...current.completedBlocks, batchResult.block])].sort() as Array<1 | 2 | 3 | 4>,
    batchResults: [...current.batchResults.filter((item) => item.block !== batchResult.block), batchResult].sort(
      (left, right) => left.block - right.block
    )
  }));
}

export function finalizeApplication(id: string, finalResult: FinalScoreResult) {
  return updateApplication(id, (current) => ({
    ...current,
    status: 'completed',
    currentBlock: 4,
    finalResult
  }));
}

export function listApplications() {
  return Array.from(store.values());
}