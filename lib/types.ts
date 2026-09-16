import { z } from 'zod';

const nonNegativeNumber = z.coerce.number().finite().min(0);
const positiveNumber = z.coerce.number().finite().min(0.01);
const trimmedText = z.string().trim();
const requiredText = trimmedText.min(1, 'Обязательное поле');
const optionalNullableNumber = z.preprocess((value) => {
  if (value === '' || value === undefined || value === null) {
    return null;
  }

  return value;
}, z.coerce.number().finite().min(0).nullable());

export const farmApplicationSchema = z.object({
  companyName: requiredText,
  bin: trimmedText.regex(/^\d{12}$/, 'БИН должен состоять из 12 цифр'),
  registrationDate: requiredText,
  direction: requiredText,
  subsidyType: requiredText,
  region: requiredText,
  district: requiredText,

  permanentWorkers: nonNegativeNumber,
  seasonalWorkers: nonNegativeNumber,

  breedingFemales: nonNegativeNumber,
  bulls: nonNegativeNumber,
  youngUnder12m: nonNegativeNumber,
  young12to18m: nonNegativeNumber,
  totalCattle: nonNegativeNumber,

  purchaseHeifers: nonNegativeNumber,
  purchaseBulls: nonNegativeNumber,
  totalPurchaseCost: nonNegativeNumber,
  cofinancingAmount: nonNegativeNumber,

  totalLandHa: nonNegativeNumber,
  pastureHa: nonNegativeNumber,
  hayfieldHa: nonNegativeNumber,
  feedFieldHa: nonNegativeNumber,
  hayTons: nonNegativeNumber,
  silageTons: nonNegativeNumber,
  strawTons: nonNegativeNumber,
  feedTons: nonNegativeNumber,

  calfOutputPer100: nonNegativeNumber,
  adultMortalityPercent: nonNegativeNumber.max(100),
  youngMortalityPercent: nonNegativeNumber.max(100),
  avgDailyGainKg: nonNegativeNumber,
  avgSaleWeightKg: nonNegativeNumber,

  revenue2023: nonNegativeNumber,
  revenue2024: nonNegativeNumber,
  revenue2025: nonNegativeNumber,
  netProfit2023: z.coerce.number().finite(),
  netProfit2024: z.coerce.number().finite(),
  netProfit2025: z.coerce.number().finite(),
  totalDebt: nonNegativeNumber,
  overdueDebt: z.boolean(),

  pastSubsidy2023: nonNegativeNumber,
  pastSubsidy2024: nonNegativeNumber,
  subsidyReturns: z.boolean(),
  returnAmount: nonNegativeNumber,
  misuseOfFunds: z.boolean(),

  buildingsCount: nonNegativeNumber,
  hasQuarantineZone: z.boolean(),
  hasIsolator: z.boolean(),
  hasVetPoint: z.boolean(),
  hasScale: z.boolean(),
  hasFeedStorage: z.boolean(),
  hasManureStorage: z.boolean(),
  pastureFencingPercent: nonNegativeNumber.max(100),
  indoorAreaSqm: optionalNullableNumber,

  plannedBreedingFemales: nonNegativeNumber,
  plannedCalfOutput: nonNegativeNumber,
  plannedRevenueIn2Years: nonNegativeNumber,
  newJobsPlanned: nonNegativeNumber,

  energySource: requiredText,
  hasRenewables: z.boolean(),
  wasteProcessing: requiredText,
  manureManagementNotes: requiredText,
  hasHerdManagementSoftware: z.boolean(),
  hasGpsTracking: z.boolean(),
  hasIoT: z.boolean(),
  digitalAccountingNotes: requiredText
}).superRefine((value, ctx) => {
  if (value.cofinancingAmount > value.totalPurchaseCost) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Сумма софинансирования не может превышать стоимость закупки',
      path: ['cofinancingAmount']
    });
  }

  if (value.returnAmount > value.pastSubsidy2023 + value.pastSubsidy2024) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Возвраты не могут превышать объем полученных субсидий',
      path: ['returnAmount']
    });
  }

  if (value.totalCattle < value.breedingFemales + value.bulls) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Общее поголовье не может быть меньше маточного стада и быков',
      path: ['totalCattle']
    });
  }
});

export const createApplicationRequestSchema = z.object({
  input: farmApplicationSchema
});

export const applicationIdRequestSchema = z.object({
  applicationId: z.string().uuid('Некорректный id заявки')
});

export type FarmApplicationInput = z.output<typeof farmApplicationSchema>;
export type FarmApplicationPayload = z.input<typeof farmApplicationSchema>;

export const applicationStatuses = [
  'draft',
  'block_1_done',
  'block_2_done',
  'block_3_done',
  'completed'
] as const;

export type ApplicationStatus = (typeof applicationStatuses)[number];

export const scoringModuleKeys = [
  'history',
  'farmReality',
  'climate',
  'deficit',
  'scalability',
  'productionEfficiency',
  'risks',
  'ecology',
  'socialEffect',
  'digitalization',
  'selfFinancing',
  'pastSubsidyUse'
] as const;

export type ScoringModuleKey = (typeof scoringModuleKeys)[number];

export interface ModuleScore {
  key: ScoringModuleKey;
  name: string;
  score: number;
  max_score: number;
  reasoning: string;
  key_factors: string[];
}

export interface BatchResult {
  block: 1 | 2 | 3 | 4;
  modules: ModuleScore[];
  block_total: number;
}

export interface FinalScoreResult {
  final_score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  risk_flags: string[];
}

export interface ApplicationRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: ApplicationStatus;
  input: FarmApplicationInput;
  currentBlock: 0 | 1 | 2 | 3 | 4;
  completedBlocks: Array<1 | 2 | 3 | 4>;
  batchResults: BatchResult[];
  finalResult: FinalScoreResult | null;
  mode: 'mock' | 'llm';
}

export const llmBatchModuleSchema = z.object({
  name: requiredText,
  score: z.coerce.number().finite(),
  max_score: positiveNumber,
  reasoning: requiredText,
  key_factors: z.array(requiredText).min(1)
});

export const llmBatchResponseSchema = z.object({
  block: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  modules: z.array(llmBatchModuleSchema).min(1),
  block_total: z.coerce.number().finite().min(0)
});

export const finalScoreResultSchema = z.object({
  final_score: z.coerce.number().finite().min(0).max(100),
  summary: requiredText,
  strengths: z.array(requiredText).min(1),
  weaknesses: z.array(requiredText).min(1),
  risk_flags: z.array(requiredText)
});

export interface ApiErrorPayload {
  error: string;
  details?: string[];
}