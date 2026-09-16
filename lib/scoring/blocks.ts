import { ApplicationStatus, ScoringModuleKey } from '@/lib/types';

export interface ModuleDefinition {
  key: ScoringModuleKey;
  name: string;
  focus: string;
}

export interface BlockDefinition {
  block: 1 | 2 | 3 | 4;
  status: ApplicationStatus;
  title: string;
  modules: [ModuleDefinition, ModuleDefinition, ModuleDefinition];
}

export const SCORING_BLOCKS: BlockDefinition[] = [
  {
    block: 1,
    status: 'block_1_done',
    title: 'История, Реальность фермы, Климат',
    modules: [
      { key: 'history', name: 'История', focus: 'репутация, финансовая история, дисциплина возвратов и общая зрелость заявителя' },
      { key: 'farmReality', name: 'Реальность фермы', focus: 'фактическая обеспеченность стадом, землей, кормами и инфраструктурой' },
      { key: 'climate', name: 'Климат', focus: 'климатические ограничения региона, устойчивость кормовой базы и сезонные риски' }
    ]
  },
  {
    block: 2,
    status: 'block_2_done',
    title: 'Дефицит, Масштабируемость, Производственная эффективность',
    modules: [
      { key: 'deficit', name: 'Дефицит', focus: 'обоснованность потребности в субсидии и нехватка ресурсов без господдержки' },
      { key: 'scalability', name: 'Масштабируемость', focus: 'потенциал расширения поголовья, доходов и производственной базы' },
      { key: 'productionEfficiency', name: 'Производственная эффективность', focus: 'выход телят, привесы, падеж и коммерческая эффективность производства' }
    ]
  },
  {
    block: 3,
    status: 'block_3_done',
    title: 'Риски, Экологичность, Социальный эффект',
    modules: [
      { key: 'risks', name: 'Риски', focus: 'долговая нагрузка, просрочка, операционные и управленческие уязвимости' },
      { key: 'ecology', name: 'Экологичность', focus: 'обращение с отходами, навозом, энергоэффективность и устойчивость практик' },
      { key: 'socialEffect', name: 'Социальный эффект', focus: 'создание рабочих мест, влияние на район и стабильность занятости' }
    ]
  },
  {
    block: 4,
    status: 'completed',
    title: 'Цифровизация, Самофинансирование, Использование прошлых субсидий',
    modules: [
      { key: 'digitalization', name: 'Цифровизация', focus: 'цифровой учет, трекинг, IoT и зрелость управленческих систем' },
      { key: 'selfFinancing', name: 'Самофинансирование', focus: 'доля собственных средств, устойчивость cash flow и инвестиционная дисциплина' },
      { key: 'pastSubsidyUse', name: 'Использование прошлых субсидий', focus: 'эффективность, возвраты, нарушения и результативность предыдущей поддержки' }
    ]
  }
];

export function getBlockDefinition(blockNumber: number) {
  return SCORING_BLOCKS.find((block) => block.block === blockNumber) ?? null;
}

export function getNextBlockNumber(currentBlock: 0 | 1 | 2 | 3 | 4) {
  if (currentBlock >= 4) {
    return null;
  }

  return (currentBlock + 1) as 1 | 2 | 3 | 4;
}

export function getStatusForBlock(blockNumber: 1 | 2 | 3 | 4): ApplicationStatus {
  return getBlockDefinition(blockNumber)?.status ?? 'draft';
}

export function getAllModuleDefinitions() {
  return SCORING_BLOCKS.flatMap((block) => block.modules);
}