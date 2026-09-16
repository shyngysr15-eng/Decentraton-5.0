import { APPLICATION_FORM_SECTIONS } from '@/lib/applicationMeta';
import { ApplicationRecord } from '@/lib/types';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function formatFieldValue(value: unknown, valueType: string) {
  if (valueType === 'boolean') {
    return value ? 'Да' : 'Нет';
  }

  if (valueType === 'currency' && typeof value === 'number') {
    return formatCurrency(value);
  }

  if (valueType === 'percent' && typeof value === 'number') {
    return `${formatNumber(value)}%`;
  }

  if (valueType === 'date' && typeof value === 'string') {
    return formatDate(value);
  }

  if (typeof value === 'number') {
    return formatNumber(value);
  }

  if (value === null || value === '') {
    return 'Не указано';
  }

  return String(value);
}

function statusVariant(status: ApplicationRecord['status']) {
  if (status === 'completed') {
    return 'success' as const;
  }

  if (status === 'draft') {
    return 'warning' as const;
  }

  return 'info' as const;
}

function statusLabel(status: ApplicationRecord['status']) {
  const labels: Record<ApplicationRecord['status'], string> = {
    draft: 'Черновик',
    block_1_done: 'Блок 1 завершен',
    block_2_done: 'Блок 2 завершен',
    block_3_done: 'Блок 3 завершен',
    completed: 'Завершено'
  };

  return labels[status];
}

export function ApplicationSummary({ application }: { application: ApplicationRecord }) {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle className="text-2xl">{application.input.companyName}</CardTitle>
              <CardDescription className="max-w-3xl leading-6">
                Карточка заявки содержит исходные данные, текущий статус скоринга и накопленные результаты по блокам. Данные хранятся на сервере в in-memory store и доступны по id заявки.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant={statusVariant(application.status)}>{statusLabel(application.status)}</Badge>
              <Badge variant="neutral">ID: {application.id}</Badge>
              <Badge variant="neutral">Режим: {application.mode}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-mist p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-slate">Прогресс</div>
              <div className="mt-2 text-3xl font-semibold text-ink">{application.completedBlocks.length}/4</div>
            </div>
            <div className="rounded-2xl bg-mist p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-slate">Тип субсидии</div>
              <div className="mt-2 text-base font-semibold text-ink">{application.input.subsidyType}</div>
            </div>
            <div className="rounded-2xl bg-mist p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-slate">Регион</div>
              <div className="mt-2 text-base font-semibold text-ink">{application.input.region}</div>
            </div>
            <div className="rounded-2xl bg-mist p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-slate">Создано</div>
              <div className="mt-2 text-base font-semibold text-ink">{formatDate(application.createdAt)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Входные данные заявки</CardTitle>
          <CardDescription>Структурированный обзор параметров, которые участвуют в расчетах блоков и финальной агрегации.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {APPLICATION_FORM_SECTIONS.map((section) => (
            <section key={section.id}>
              <div className="mb-4">
                <h3 className="text-base font-semibold text-ink">{section.title}</h3>
                <p className="mt-1 text-sm text-slate">{section.description}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {section.fields.map((field) => (
                  <div key={String(field.name)} className="rounded-2xl border border-black/6 bg-[#fcfbf8] p-4">
                    <div className="text-xs uppercase tracking-[0.14em] text-slate">{field.label}</div>
                    <div className="mt-2 text-sm font-medium leading-6 text-ink">
                      {formatFieldValue(application.input[field.name], field.valueType)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}