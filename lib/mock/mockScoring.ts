import { BatchResult, FarmApplicationInput, FinalScoreResult, ModuleScore, ScoringModuleKey } from '@/lib/types';
import { getAllModuleDefinitions, getBlockDefinition } from '@/lib/scoring/blocks';

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function scoreToFive(value: number) {
  return round(clamp(value, 0, 5));
}

function safeRatio(numerator: number, denominator: number) {
  if (denominator <= 0) {
    return 0;
  }

  return numerator / denominator;
}

function moduleReasoning(name: string, facts: string[], qualifier: string) {
  return `${name}: ${qualifier}. ${facts.join('; ')}.`;
}

function moduleFactors(...items: string[]) {
  return items.filter(Boolean).slice(0, 4);
}

function computeModuleScore(application: FarmApplicationInput, key: ScoringModuleKey, name: string): Omit<ModuleScore, 'key'> {
  const feedPerHead = safeRatio(
    application.hayTons + application.silageTons + application.strawTons + application.feedTons,
    application.totalCattle || 1
  );
  const cofinancingShare = safeRatio(application.cofinancingAmount, application.totalPurchaseCost || 1);
  const debtToRevenue = safeRatio(application.totalDebt, Math.max(application.revenue2025, 1));
  const infrastructureScore = [
    application.hasQuarantineZone,
    application.hasIsolator,
    application.hasVetPoint,
    application.hasScale,
    application.hasFeedStorage,
    application.hasManureStorage
  ].filter(Boolean).length;
  const digitalScore = [
    application.hasHerdManagementSoftware,
    application.hasGpsTracking,
    application.hasIoT
  ].filter(Boolean).length;

  switch (key) {
    case 'history': {
      const raw = 2.6 + (application.netProfit2024 > 0 ? 0.7 : 0) + (application.netProfit2025 > 0 ? 0.8 : -0.5)
        + (application.subsidyReturns ? -0.8 : 0.4) + (application.misuseOfFunds ? -1.4 : 0.5);
      return {
        name,
        score: scoreToFive(raw),
        max_score: 5,
        reasoning: moduleReasoning(name, moduleFactors(
          `чистая прибыль 2024: ${application.netProfit2024.toLocaleString('ru-RU')} KZT`,
          `чистая прибыль 2025: ${application.netProfit2025.toLocaleString('ru-RU')} KZT`,
          application.subsidyReturns ? `были возвраты субсидий на ${application.returnAmount.toLocaleString('ru-RU')} KZT` : 'возвратов субсидий не зафиксировано',
          application.misuseOfFunds ? 'есть факт нецелевого использования' : 'нарушения использования средств не указаны'
        ), 'история заявителя выглядит устойчивой при умеренных регуляторных рисках'),
        key_factors: moduleFactors(
          application.netProfit2025 > 0 ? 'положительная прибыль в 2025 году' : 'слабая прибыльность в 2025 году',
          application.subsidyReturns ? 'зафиксированы возвраты прошлых субсидий' : 'нет возвратов прошлых субсидий',
          application.misuseOfFunds ? 'есть репутационный риск' : 'репутационный фон нейтральный'
        )
      };
    }
    case 'farmReality': {
      const landCoverage = safeRatio(application.totalLandHa, Math.max(application.totalCattle, 1));
      const raw = 1.8 + Math.min(1.4, landCoverage / 8) + Math.min(1, feedPerHead / 5) + infrastructureScore * 0.15;
      return {
        name,
        score: scoreToFive(raw),
        max_score: 5,
        reasoning: moduleReasoning(name, moduleFactors(
          `земля на голову: ${round(landCoverage)} га`,
          `корма на голову: ${round(feedPerHead)} т`,
          `инфраструктурных элементов: ${infrastructureScore} из 6`,
          `общее поголовье: ${application.totalCattle}`
        ), 'операционная база фермы подтверждается фактическими ресурсами'),
        key_factors: moduleFactors(
          landCoverage >= 2 ? 'земельный банк поддерживает текущее поголовье' : 'земельный банк ограничен',
          feedPerHead >= 3 ? 'кормовая база выглядит достаточной' : 'кормовая база требует усиления',
          infrastructureScore >= 4 ? 'инфраструктура выше среднего' : 'инфраструктура частично неполная'
        )
      };
    }
    case 'climate': {
      const raw = 2.1 + (application.region.toLowerCase().includes('север') ? 0.2 : 0)
        + Math.min(1.2, safeRatio(application.pastureHa + application.hayfieldHa, Math.max(application.totalLandHa, 1)) * 2.2)
        + (application.hasFeedStorage ? 0.8 : -0.3);
      return {
        name,
        score: scoreToFive(raw),
        max_score: 5,
        reasoning: moduleReasoning(name, moduleFactors(
          `регион: ${application.region}`,
          `доля пастбищ и сенокосов: ${round(safeRatio(application.pastureHa + application.hayfieldHa, Math.max(application.totalLandHa, 1)) * 100)}%`,
          application.hasFeedStorage ? 'есть хранилище кормов' : 'нет отдельного хранилища кормов'
        ), 'климатическая устойчивость зависит от структуры земель и наличия буфера кормов'),
        key_factors: moduleFactors(
          application.hasFeedStorage ? 'есть инфраструктура для сезонного резерва' : 'слабый резерв по кормам',
          application.pastureHa > application.feedFieldHa ? 'значимая пастбищная база' : 'ограниченная пастбищная база',
          `${application.region}, ${application.district}`
        )
      };
    }
    case 'deficit': {
      const raw = 1.9 + Math.min(1.2, safeRatio(application.purchaseHeifers + application.purchaseBulls, Math.max(application.totalCattle, 1)) * 6)
        + (cofinancingShare < 0.35 ? 0.9 : 0.2) + (application.totalDebt > 0 ? 0.3 : 0.1);
      return {
        name,
        score: scoreToFive(raw),
        max_score: 5,
        reasoning: moduleReasoning(name, moduleFactors(
          `доля закупки к стаду: ${round(safeRatio(application.purchaseHeifers + application.purchaseBulls, Math.max(application.totalCattle, 1)) * 100)}%`,
          `софинансирование: ${round(cofinancingShare * 100)}%`,
          `общий долг: ${application.totalDebt.toLocaleString('ru-RU')} KZT`
        ), 'потребность в субсидии выглядит обоснованной при текущем масштабе проекта'),
        key_factors: moduleFactors(
          cofinancingShare < 0.35 ? 'высокая зависимость от субсидии' : 'есть заметное собственное участие',
          application.purchaseHeifers + application.purchaseBulls > 0 ? 'проект включает расширение закупки' : 'новая закупка не заявлена',
          application.totalDebt > 0 ? 'есть долговая нагрузка' : 'долговая нагрузка низкая'
        )
      };
    }
    case 'scalability': {
      const growthPotential = safeRatio(application.plannedBreedingFemales - application.breedingFemales, Math.max(application.breedingFemales, 1));
      const revenueGrowth = safeRatio(application.plannedRevenueIn2Years - application.revenue2025, Math.max(application.revenue2025, 1));
      const raw = 2 + Math.min(1.4, growthPotential * 3.5) + Math.min(1.2, revenueGrowth * 2.2) + (application.newJobsPlanned > 0 ? 0.4 : 0);
      return {
        name,
        score: scoreToFive(raw),
        max_score: 5,
        reasoning: moduleReasoning(name, moduleFactors(
          `рост маточного стада: ${round(growthPotential * 100)}%`,
          `рост выручки за 2 года: ${round(revenueGrowth * 100)}%`,
          `новые рабочие места: ${application.newJobsPlanned}`
        ), 'масштабирование проекта выглядит достижимым при сохранении операционной дисциплины'),
        key_factors: moduleFactors(
          growthPotential > 0.15 ? 'есть потенциал расширения маточного стада' : 'рост поголовья ограниченный',
          revenueGrowth > 0.1 ? 'ожидается рост выручки' : 'финансовый рост умеренный',
          application.newJobsPlanned > 0 ? 'проект создает занятость' : 'социальный рост ограничен'
        )
      };
    }
    case 'productionEfficiency': {
      const raw = 1.8 + Math.min(1.2, application.calfOutputPer100 / 90) + Math.min(1, application.avgDailyGainKg / 1.1)
        + Math.max(-0.9, 0.8 - application.youngMortalityPercent * 0.12)
        + Math.max(-0.7, 0.6 - application.adultMortalityPercent * 0.15);
      return {
        name,
        score: scoreToFive(raw),
        max_score: 5,
        reasoning: moduleReasoning(name, moduleFactors(
          `выход телят: ${application.calfOutputPer100} на 100 маток`,
          `среднесуточный привес: ${application.avgDailyGainKg} кг`,
          `падеж взрослого поголовья: ${application.adultMortalityPercent}%`,
          `падеж молодняка: ${application.youngMortalityPercent}%`
        ), 'производственная эффективность определяется биологическими и управленческими показателями стада'),
        key_factors: moduleFactors(
          application.calfOutputPer100 >= 80 ? 'высокий выход телят' : 'выход телят ниже целевого',
          application.avgDailyGainKg >= 0.85 ? 'привес соответствует коммерческому уровню' : 'привес ниже желаемого',
          application.youngMortalityPercent <= 4 ? 'контроль падежа молодняка приемлемый' : 'риски падежа молодняка повышены'
        )
      };
    }
    case 'risks': {
      const raw = 4.4 - Math.min(1.6, debtToRevenue * 2.8) - (application.overdueDebt ? 1.2 : 0.1)
        - (application.misuseOfFunds ? 0.9 : 0) - (application.subsidyReturns ? 0.4 : 0);
      return {
        name,
        score: scoreToFive(raw),
        max_score: 5,
        reasoning: moduleReasoning(name, moduleFactors(
          `долг/выручка 2025: ${round(debtToRevenue * 100)}%`,
          application.overdueDebt ? 'есть просроченная задолженность' : 'просрочки не указаны',
          application.misuseOfFunds ? 'нарушения использования средств повышают риск' : 'сигналы злоупотребления не указаны'
        ), 'риск-профиль в основном определяется долговой нагрузкой и качеством исполнения обязательств'),
        key_factors: moduleFactors(
          application.overdueDebt ? 'есть просроченная задолженность' : 'нет просроченной задолженности',
          debtToRevenue <= 0.5 ? 'долговая нагрузка контролируемая' : 'долговая нагрузка повышенная',
          application.misuseOfFunds ? 'есть регуляторный риск' : 'регуляторный риск умеренный'
        )
      };
    }
    case 'ecology': {
      const raw = 1.8 + (application.hasRenewables ? 0.7 : 0.2) + (application.hasManureStorage ? 1 : 0)
        + (application.wasteProcessing.toLowerCase().includes('переработ') ? 0.8 : 0.3)
        + (application.manureManagementNotes.length > 30 ? 0.6 : 0.2);
      return {
        name,
        score: scoreToFive(raw),
        max_score: 5,
        reasoning: moduleReasoning(name, moduleFactors(
          `источник энергии: ${application.energySource}`,
          application.hasRenewables ? 'есть ВИЭ' : 'ВИЭ не используются',
          application.hasManureStorage ? 'есть навозохранилище' : 'нет навозохранилища',
          `обращение с отходами: ${application.wasteProcessing}`
        ), 'экологическая устойчивость проекта зависит от зрелости обращения с отходами и энергией'),
        key_factors: moduleFactors(
          application.hasManureStorage ? 'организовано хранение навоза' : 'хранение навоза требует усиления',
          application.hasRenewables ? 'есть элементы зеленой энергетики' : 'энергетика традиционная',
          application.wasteProcessing
        )
      };
    }
    case 'socialEffect': {
      const raw = 1.9 + Math.min(1.3, safeRatio(application.newJobsPlanned, Math.max(application.permanentWorkers, 1)) * 4)
        + Math.min(1, application.seasonalWorkers / 15) + (application.district ? 0.4 : 0.1)
        + (application.plannedRevenueIn2Years > application.revenue2025 ? 0.5 : 0.2);
      return {
        name,
        score: scoreToFive(raw),
        max_score: 5,
        reasoning: moduleReasoning(name, moduleFactors(
          `постоянные сотрудники: ${application.permanentWorkers}`,
          `сезонные сотрудники: ${application.seasonalWorkers}`,
          `новые рабочие места: ${application.newJobsPlanned}`,
          `район реализации: ${application.district}`
        ), 'социальный эффект оценивается через занятость и локальное значение проекта'),
        key_factors: moduleFactors(
          application.newJobsPlanned >= 3 ? 'создается заметное число новых рабочих мест' : 'создание занятости ограничено',
          application.seasonalWorkers > 0 ? 'проект поддерживает сезонную занятость' : 'сезонная занятость отсутствует',
          `${application.region}, ${application.district}`
        )
      };
    }
    case 'digitalization': {
      const raw = 1.7 + digitalScore * 0.9 + (application.digitalAccountingNotes.length > 20 ? 0.6 : 0.2);
      return {
        name,
        score: scoreToFive(raw),
        max_score: 5,
        reasoning: moduleReasoning(name, moduleFactors(
          `цифровых систем: ${digitalScore} из 3`,
          application.hasHerdManagementSoftware ? 'есть ПО для управления стадом' : 'нет ПО управления стадом',
          application.hasGpsTracking ? 'есть GPS-трекинг' : 'GPS-трекинг не используется',
          application.hasIoT ? 'есть IoT-датчики' : 'IoT-датчики не используются'
        ), 'уровень цифровизации выше там, где данные используются в операционном контуре'),
        key_factors: moduleFactors(
          application.hasHerdManagementSoftware ? 'есть цифровой учет стада' : 'учет стада не автоматизирован',
          application.hasGpsTracking ? 'используется GPS-контроль' : 'нет GPS-контроля',
          application.hasIoT ? 'есть IoT-инфраструктура' : 'IoT пока не внедрен'
        )
      };
    }
    case 'selfFinancing': {
      const profitabilityTrend = [application.netProfit2023, application.netProfit2024, application.netProfit2025].filter((value) => value > 0).length;
      const raw = 1.9 + Math.min(1.6, cofinancingShare * 3.2) + profitabilityTrend * 0.3 - Math.min(0.8, debtToRevenue * 1.4);
      return {
        name,
        score: scoreToFive(raw),
        max_score: 5,
        reasoning: moduleReasoning(name, moduleFactors(
          `софинансирование: ${round(cofinancingShare * 100)}%`,
          `прибыльных лет: ${profitabilityTrend} из 3`,
          `долг/выручка: ${round(debtToRevenue * 100)}%`
        ), 'самофинансирование зависит от собственной доли участия и качества денежного потока'),
        key_factors: moduleFactors(
          cofinancingShare >= 0.3 ? 'собственное участие заметное' : 'собственное участие ограничено',
          profitabilityTrend >= 2 ? 'прибыльность в последние годы поддерживает проект' : 'прибыльность нестабильна',
          debtToRevenue <= 0.5 ? 'долг обслуживаемый' : 'долг ограничивает гибкость'
        )
      };
    }
    case 'pastSubsidyUse': {
      const raw = 3.4 + (application.pastSubsidy2023 + application.pastSubsidy2024 > 0 ? 0.4 : 0)
        - (application.subsidyReturns ? 1 : 0) - (application.misuseOfFunds ? 1.4 : 0.1);
      return {
        name,
        score: scoreToFive(raw),
        max_score: 5,
        reasoning: moduleReasoning(name, moduleFactors(
          `субсидии 2023: ${application.pastSubsidy2023.toLocaleString('ru-RU')} KZT`,
          `субсидии 2024: ${application.pastSubsidy2024.toLocaleString('ru-RU')} KZT`,
          application.subsidyReturns ? `возврат: ${application.returnAmount.toLocaleString('ru-RU')} KZT` : 'возвратов не было',
          application.misuseOfFunds ? 'есть указание на нецелевое использование' : 'нарушения не указаны'
        ), 'качество использования прошлых субсидий влияет на доверие к новой заявке'),
        key_factors: moduleFactors(
          application.subsidyReturns ? 'были возвраты средств' : 'возвратов не было',
          application.misuseOfFunds ? 'есть риск повторения нарушений' : 'нарушений использования средств не выявлено',
          application.pastSubsidy2023 + application.pastSubsidy2024 > 0 ? 'есть опыт работы с субсидиями' : 'опыт субсидий ограничен'
        )
      };
    }
  }
}

export function generateMockBatchResult(application: FarmApplicationInput, blockNumber: 1 | 2 | 3 | 4): BatchResult {
  const block = getBlockDefinition(blockNumber);

  if (!block) {
    throw new Error(`Неизвестный блок ${blockNumber}`);
  }

  const modules: ModuleScore[] = block.modules.map((module) => {
    const score = computeModuleScore(application, module.key, module.name);
    return {
      key: module.key,
      ...score
    };
  });

  return {
    block: block.block,
    modules,
    block_total: round(modules.reduce((total, module) => total + module.score, 0))
  };
}

export function generateMockFinalResult(allBatchResults: BatchResult[]): FinalScoreResult {
  const modules = allBatchResults.flatMap((batch) => batch.modules);
  const totalScore = modules.reduce((total, module) => total + module.score, 0);
  const maxScore = modules.reduce((total, module) => total + module.max_score, 0);
  const finalScore = round(safeRatio(totalScore, Math.max(maxScore, 1)) * 100);

  const sorted = [...modules].sort((left, right) => right.score - left.score);
  const weakest = [...sorted].reverse();
  const strengths = sorted.slice(0, 3).map((module) => `${module.name}: ${module.reasoning}`);
  const weaknesses = weakest.slice(0, 3).map((module) => `${module.name}: ${module.reasoning}`);
  const riskFlags = modules
    .filter((module) => module.score < 3)
    .slice(0, 4)
    .map((module) => `Низкий результат по модулю «${module.name}»`);

  return {
    final_score: finalScore,
    summary:
      finalScore >= 70
        ? 'Проект выглядит в целом жизнеспособным: ресурсы подтверждены, потенциал роста присутствует, но для устойчивого результата потребуется контроль рисков и операционной дисциплины.'
        : 'Проект требует осторожного подхода: часть предпосылок подтверждена, однако долговая нагрузка, операционная устойчивость или качество прошлой поддержки снижают итоговую оценку.',
    strengths,
    weaknesses,
    risk_flags: riskFlags
  };
}

export function getMockModeName() {
  return 'mock' as const;
}

export function getModuleDefinitionsByName(name: string) {
  return getAllModuleDefinitions().find((module) => module.name.toLowerCase() === name.toLowerCase()) ?? null;
}