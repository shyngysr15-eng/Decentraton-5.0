import { SCORING_BLOCKS } from '@/lib/scoring/blocks';
import { ApplicationRecord } from '@/lib/types';
import { formatNumber } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function BlockResults({ application }: { application: ApplicationRecord }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Промежуточные scoring results</CardTitle>
        <CardDescription>
          Каждый блок считается отдельно. До нажатия пользователем кнопки продолжения следующий блок не уходит в расчет.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {SCORING_BLOCKS.map((block) => {
          const result = application.batchResults.find((batch) => batch.block === block.block);
          const isCompleted = Boolean(result);

          return (
            <div key={block.block} className="rounded-3xl border border-black/8 bg-[#fbfaf7] p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-slate">Блок {block.block}</div>
                  <h3 className="mt-2 text-lg font-semibold text-ink">{block.title}</h3>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate">
                    {block.modules.map((module) => module.name).join(', ')}.
                  </p>
                </div>
                <Badge variant={isCompleted ? 'success' : 'warning'}>{isCompleted ? 'Рассчитан' : 'Ожидает запуска'}</Badge>
              </div>

              {result ? (
                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl bg-white p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate">Итог блока</div>
                    <div className="mt-2 text-3xl font-semibold text-ink">{formatNumber(result.block_total)} / 15</div>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-3">
                    {result.modules.map((module) => (
                      <article key={module.key} className="rounded-2xl border border-black/8 bg-white p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-ink">{module.name}</div>
                            <div className="mt-1 text-xs uppercase tracking-[0.16em] text-slate">{module.key}</div>
                          </div>
                          <div className="rounded-2xl bg-mist px-3 py-2 text-right">
                            <div className="text-xs text-slate">Score</div>
                            <div className="text-lg font-semibold text-ink">
                              {formatNumber(module.score)} / {formatNumber(module.max_score)}
                            </div>
                          </div>
                        </div>
                        <p className="mt-4 text-sm leading-6 text-slate">{module.reasoning}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {module.key_factors.map((factor) => (
                            <span key={factor} className="rounded-full bg-mist px-3 py-1 text-xs font-medium text-ink">
                              {factor}
                            </span>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-black/12 bg-white p-5 text-sm leading-6 text-slate">
                  Блок еще не рассчитывался. После запуска или продолжения здесь появится детальный разбор по 3 модулям текущего этапа.
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}