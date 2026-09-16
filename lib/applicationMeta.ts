import { FarmApplicationInput } from '@/lib/types';

export type FieldValueType = 'text' | 'number' | 'currency' | 'percent' | 'boolean' | 'date';
export type FieldKind = 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox';

export interface FieldOption {
  label: string;
  value: string;
}

export interface FormFieldConfig {
  name: keyof FarmApplicationInput;
  label: string;
  kind: FieldKind;
  valueType: FieldValueType;
  placeholder?: string;
  step?: string;
  options?: FieldOption[];
  hint?: string;
}

export interface FormSectionConfig {
  id: string;
  title: string;
  description: string;
  fields: FormFieldConfig[];
}

export type ApplicationFormState = {
  [Key in keyof FarmApplicationInput]: FarmApplicationInput[Key] extends boolean ? boolean : string;
};

const regionOptions: FieldOption[] = [
  { label: 'Акмолинская область', value: 'Акмолинская область' },
  { label: 'Костанайская область', value: 'Костанайская область' },
  { label: 'Северо-Казахстанская область', value: 'Северо-Казахстанская область' },
  { label: 'Туркестанская область', value: 'Туркестанская область' },
  { label: 'Алматинская область', value: 'Алматинская область' },
  { label: 'Жамбылская область', value: 'Жамбылская область' },
  { label: 'Павлодарская область', value: 'Павлодарская область' }
];

const directionOptions: FieldOption[] = [
  { label: 'Мясное скотоводство', value: 'Мясное скотоводство' },
  { label: 'Молочное скотоводство', value: 'Молочное скотоводство' },
  { label: 'Смешанное направление', value: 'Смешанное направление' }
];

const subsidyOptions: FieldOption[] = [
  { label: 'Закуп племенного маточного поголовья', value: 'Закуп племенного маточного поголовья' },
  { label: 'Развитие откормочной площадки', value: 'Развитие откормочной площадки' },
  { label: 'Компенсация инвестзатрат', value: 'Компенсация инвестзатрат' }
];

const energySourceOptions: FieldOption[] = [
  { label: 'Сеть', value: 'Сеть' },
  { label: 'Смешанная модель', value: 'Смешанная модель' },
  { label: 'Дизель + сеть', value: 'Дизель + сеть' }
];

const wasteProcessingOptions: FieldOption[] = [
  { label: 'Базовое складирование', value: 'Базовое складирование' },
  { label: 'Компостирование', value: 'Компостирование' },
  { label: 'Переработка и повторное использование', value: 'Переработка и повторное использование' }
];

export const APPLICATION_FORM_SECTIONS: FormSectionConfig[] = [
  {
    id: 'general',
    title: '1. Общая информация',
    description: 'Базовые реквизиты и профиль проекта.',
    fields: [
      { name: 'companyName', label: 'Название компании', kind: 'text', valueType: 'text', placeholder: 'ТОО Agro Dana' },
      { name: 'bin', label: 'БИН', kind: 'text', valueType: 'text', placeholder: '12 цифр' },
      { name: 'registrationDate', label: 'Дата регистрации', kind: 'date', valueType: 'date' },
      { name: 'direction', label: 'Направление', kind: 'select', valueType: 'text', options: directionOptions },
      { name: 'subsidyType', label: 'Тип субсидии', kind: 'select', valueType: 'text', options: subsidyOptions },
      { name: 'region', label: 'Область', kind: 'select', valueType: 'text', options: regionOptions },
      { name: 'district', label: 'Район', kind: 'text', valueType: 'text', placeholder: 'Есильский район' }
    ]
  },
  {
    id: 'workforce',
    title: '2. Трудовые ресурсы',
    description: 'Постоянная и сезонная занятость.',
    fields: [
      { name: 'permanentWorkers', label: 'Постоянные сотрудники', kind: 'number', valueType: 'number', placeholder: '18' },
      { name: 'seasonalWorkers', label: 'Сезонные сотрудники', kind: 'number', valueType: 'number', placeholder: '12' }
    ]
  },
  {
    id: 'livestock',
    title: '3. Поголовье',
    description: 'Текущее состояние стада по основным категориям.',
    fields: [
      { name: 'breedingFemales', label: 'Маточное поголовье', kind: 'number', valueType: 'number' },
      { name: 'bulls', label: 'Быки', kind: 'number', valueType: 'number' },
      { name: 'youngUnder12m', label: 'Молодняк до 12 мес.', kind: 'number', valueType: 'number' },
      { name: 'young12to18m', label: 'Молодняк 12-18 мес.', kind: 'number', valueType: 'number' },
      { name: 'totalCattle', label: 'Общее поголовье', kind: 'number', valueType: 'number' }
    ]
  },
  {
    id: 'purchase',
    title: '4. Параметры закупки',
    description: 'Объем закупки и структура финансирования проекта.',
    fields: [
      { name: 'purchaseHeifers', label: 'Закупаемые телки', kind: 'number', valueType: 'number' },
      { name: 'purchaseBulls', label: 'Закупаемые быки', kind: 'number', valueType: 'number' },
      { name: 'totalPurchaseCost', label: 'Стоимость закупки', kind: 'number', valueType: 'currency' },
      { name: 'cofinancingAmount', label: 'Софинансирование', kind: 'number', valueType: 'currency' }
    ]
  },
  {
    id: 'land',
    title: '5. Земля и корма',
    description: 'Площади, кормовая база и сезонный резерв.',
    fields: [
      { name: 'totalLandHa', label: 'Общая площадь, га', kind: 'number', valueType: 'number' },
      { name: 'pastureHa', label: 'Пастбища, га', kind: 'number', valueType: 'number' },
      { name: 'hayfieldHa', label: 'Сенокосы, га', kind: 'number', valueType: 'number' },
      { name: 'feedFieldHa', label: 'Кормовые поля, га', kind: 'number', valueType: 'number' },
      { name: 'hayTons', label: 'Сено, тонн', kind: 'number', valueType: 'number' },
      { name: 'silageTons', label: 'Силос, тонн', kind: 'number', valueType: 'number' },
      { name: 'strawTons', label: 'Солома, тонн', kind: 'number', valueType: 'number' },
      { name: 'feedTons', label: 'Комбикорм, тонн', kind: 'number', valueType: 'number' }
    ]
  },
  {
    id: 'production',
    title: '6. Производственные показатели',
    description: 'Ключевые KPI биологической и коммерческой эффективности.',
    fields: [
      { name: 'calfOutputPer100', label: 'Выход телят на 100 маток', kind: 'number', valueType: 'number' },
      { name: 'adultMortalityPercent', label: 'Падеж взрослого поголовья, %', kind: 'number', valueType: 'percent', step: '0.1' },
      { name: 'youngMortalityPercent', label: 'Падеж молодняка, %', kind: 'number', valueType: 'percent', step: '0.1' },
      { name: 'avgDailyGainKg', label: 'Среднесуточный привес, кг', kind: 'number', valueType: 'number', step: '0.01' },
      { name: 'avgSaleWeightKg', label: 'Средний вес реализации, кг', kind: 'number', valueType: 'number', step: '0.1' }
    ]
  },
  {
    id: 'finance',
    title: '7. Финансы',
    description: 'Выручка, прибыль и долговая нагрузка.',
    fields: [
      { name: 'revenue2023', label: 'Выручка 2023', kind: 'number', valueType: 'currency' },
      { name: 'revenue2024', label: 'Выручка 2024', kind: 'number', valueType: 'currency' },
      { name: 'revenue2025', label: 'Выручка 2025', kind: 'number', valueType: 'currency' },
      { name: 'netProfit2023', label: 'Чистая прибыль 2023', kind: 'number', valueType: 'currency' },
      { name: 'netProfit2024', label: 'Чистая прибыль 2024', kind: 'number', valueType: 'currency' },
      { name: 'netProfit2025', label: 'Чистая прибыль 2025', kind: 'number', valueType: 'currency' },
      { name: 'totalDebt', label: 'Общий долг', kind: 'number', valueType: 'currency' },
      { name: 'overdueDebt', label: 'Есть просроченная задолженность', kind: 'checkbox', valueType: 'boolean' }
    ]
  },
  {
    id: 'subsidy-history',
    title: '8. История субсидий',
    description: 'Опыт работы с господдержкой и качество исполнения обязательств.',
    fields: [
      { name: 'pastSubsidy2023', label: 'Субсидии 2023', kind: 'number', valueType: 'currency' },
      { name: 'pastSubsidy2024', label: 'Субсидии 2024', kind: 'number', valueType: 'currency' },
      { name: 'subsidyReturns', label: 'Были возвраты субсидий', kind: 'checkbox', valueType: 'boolean' },
      { name: 'returnAmount', label: 'Сумма возвратов', kind: 'number', valueType: 'currency' },
      { name: 'misuseOfFunds', label: 'Было нецелевое использование', kind: 'checkbox', valueType: 'boolean' }
    ]
  },
  {
    id: 'infrastructure',
    title: '9. Инфраструктура',
    description: 'Готовность площадки и обязательная операционная база.',
    fields: [
      { name: 'buildingsCount', label: 'Количество зданий/объектов', kind: 'number', valueType: 'number' },
      { name: 'hasQuarantineZone', label: 'Есть карантинная зона', kind: 'checkbox', valueType: 'boolean' },
      { name: 'hasIsolator', label: 'Есть изолятор', kind: 'checkbox', valueType: 'boolean' },
      { name: 'hasVetPoint', label: 'Есть ветпункт', kind: 'checkbox', valueType: 'boolean' },
      { name: 'hasScale', label: 'Есть весовая', kind: 'checkbox', valueType: 'boolean' },
      { name: 'hasFeedStorage', label: 'Есть склад кормов', kind: 'checkbox', valueType: 'boolean' },
      { name: 'hasManureStorage', label: 'Есть навозохранилище', kind: 'checkbox', valueType: 'boolean' },
      { name: 'pastureFencingPercent', label: 'Ограждение пастбищ, %', kind: 'number', valueType: 'percent', step: '1' },
      { name: 'indoorAreaSqm', label: 'Площадь помещений, кв. м', kind: 'number', valueType: 'number', hint: 'Необязательное поле' }
    ]
  },
  {
    id: 'project-plan',
    title: '10. План после проекта',
    description: 'Показатели, к которым заявитель планирует прийти после инвестиций.',
    fields: [
      { name: 'plannedBreedingFemales', label: 'План маточного поголовья', kind: 'number', valueType: 'number' },
      { name: 'plannedCalfOutput', label: 'План выхода телят', kind: 'number', valueType: 'number' },
      { name: 'plannedRevenueIn2Years', label: 'План выручки через 2 года', kind: 'number', valueType: 'currency' },
      { name: 'newJobsPlanned', label: 'Новые рабочие места', kind: 'number', valueType: 'number' }
    ]
  },
  {
    id: 'ecology-digital',
    title: '11. Экология и цифровизация',
    description: 'Показатели устойчивости, учета и цифровой зрелости.',
    fields: [
      { name: 'energySource', label: 'Источник энергии', kind: 'select', valueType: 'text', options: energySourceOptions },
      { name: 'hasRenewables', label: 'Используются ВИЭ', kind: 'checkbox', valueType: 'boolean' },
      { name: 'wasteProcessing', label: 'Обращение с отходами', kind: 'select', valueType: 'text', options: wasteProcessingOptions },
      { name: 'manureManagementNotes', label: 'Примечания по навозу', kind: 'textarea', valueType: 'text', placeholder: 'Как организованы хранение, вывоз и использование.' },
      { name: 'hasHerdManagementSoftware', label: 'Есть ПО для управления стадом', kind: 'checkbox', valueType: 'boolean' },
      { name: 'hasGpsTracking', label: 'Есть GPS-трекинг', kind: 'checkbox', valueType: 'boolean' },
      { name: 'hasIoT', label: 'Есть IoT-устройства', kind: 'checkbox', valueType: 'boolean' },
      { name: 'digitalAccountingNotes', label: 'Примечания по цифровому учету', kind: 'textarea', valueType: 'text', placeholder: 'Опишите, какие процессы ведутся в цифре.' }
    ]
  }
];

export function createEmptyFormState(): ApplicationFormState {
  return {
    companyName: '',
    bin: '',
    registrationDate: '',
    direction: '',
    subsidyType: '',
    region: '',
    district: '',
    permanentWorkers: '',
    seasonalWorkers: '',
    breedingFemales: '',
    bulls: '',
    youngUnder12m: '',
    young12to18m: '',
    totalCattle: '',
    purchaseHeifers: '',
    purchaseBulls: '',
    totalPurchaseCost: '',
    cofinancingAmount: '',
    totalLandHa: '',
    pastureHa: '',
    hayfieldHa: '',
    feedFieldHa: '',
    hayTons: '',
    silageTons: '',
    strawTons: '',
    feedTons: '',
    calfOutputPer100: '',
    adultMortalityPercent: '',
    youngMortalityPercent: '',
    avgDailyGainKg: '',
    avgSaleWeightKg: '',
    revenue2023: '',
    revenue2024: '',
    revenue2025: '',
    netProfit2023: '',
    netProfit2024: '',
    netProfit2025: '',
    totalDebt: '',
    overdueDebt: false,
    pastSubsidy2023: '',
    pastSubsidy2024: '',
    subsidyReturns: false,
    returnAmount: '',
    misuseOfFunds: false,
    buildingsCount: '',
    hasQuarantineZone: false,
    hasIsolator: false,
    hasVetPoint: false,
    hasScale: false,
    hasFeedStorage: false,
    hasManureStorage: false,
    pastureFencingPercent: '',
    indoorAreaSqm: '',
    plannedBreedingFemales: '',
    plannedCalfOutput: '',
    plannedRevenueIn2Years: '',
    newJobsPlanned: '',
    energySource: '',
    hasRenewables: false,
    wasteProcessing: '',
    manureManagementNotes: '',
    hasHerdManagementSoftware: false,
    hasGpsTracking: false,
    hasIoT: false,
    digitalAccountingNotes: ''
  };
}

function toStringValue(value: FarmApplicationInput[keyof FarmApplicationInput]) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (value === null) {
    return '';
  }

  return String(value);
}

export function createFormStateFromInput(input: FarmApplicationInput): ApplicationFormState {
  const state = createEmptyFormState() as Record<string, string | boolean>;

  for (const key of Object.keys(input) as Array<keyof FarmApplicationInput>) {
    state[key] = toStringValue(input[key]) as string | boolean;
  }

  return state as ApplicationFormState;
}

export const DEMO_APPLICATION_INPUT: FarmApplicationInput = {
  companyName: 'ТОО Qazaq Et Reserve',
  bin: '201240015678',
  registrationDate: '2019-03-15',
  direction: 'Мясное скотоводство',
  subsidyType: 'Закуп племенного маточного поголовья',
  region: 'Акмолинская область',
  district: 'Есильский район',
  permanentWorkers: 18,
  seasonalWorkers: 11,
  breedingFemales: 260,
  bulls: 18,
  youngUnder12m: 115,
  young12to18m: 74,
  totalCattle: 467,
  purchaseHeifers: 80,
  purchaseBulls: 6,
  totalPurchaseCost: 214000000,
  cofinancingAmount: 76000000,
  totalLandHa: 6400,
  pastureHa: 4100,
  hayfieldHa: 980,
  feedFieldHa: 760,
  hayTons: 1320,
  silageTons: 540,
  strawTons: 320,
  feedTons: 460,
  calfOutputPer100: 84,
  adultMortalityPercent: 1.9,
  youngMortalityPercent: 3.2,
  avgDailyGainKg: 0.92,
  avgSaleWeightKg: 432,
  revenue2023: 298000000,
  revenue2024: 346000000,
  revenue2025: 382000000,
  netProfit2023: 24500000,
  netProfit2024: 32100000,
  netProfit2025: 39800000,
  totalDebt: 108000000,
  overdueDebt: false,
  pastSubsidy2023: 18000000,
  pastSubsidy2024: 12000000,
  subsidyReturns: false,
  returnAmount: 0,
  misuseOfFunds: false,
  buildingsCount: 7,
  hasQuarantineZone: true,
  hasIsolator: true,
  hasVetPoint: true,
  hasScale: true,
  hasFeedStorage: true,
  hasManureStorage: true,
  pastureFencingPercent: 64,
  indoorAreaSqm: 1820,
  plannedBreedingFemales: 340,
  plannedCalfOutput: 88,
  plannedRevenueIn2Years: 482000000,
  newJobsPlanned: 6,
  energySource: 'Смешанная модель',
  hasRenewables: true,
  wasteProcessing: 'Переработка и повторное использование',
  manureManagementNotes: 'Навоз хранится на выделенной площадке, часть используется как органическое удобрение на кормовых полях.',
  hasHerdManagementSoftware: true,
  hasGpsTracking: true,
  hasIoT: false,
  digitalAccountingNotes: 'Учет стада, привесов и движения кормов ведется в отдельной системе с еженедельной сверкой.'
};