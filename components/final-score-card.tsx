import { AlertTriangle, CheckCircle2 } from 'lucide-react';

import { ApplicationRecord } from '@/lib/types';
import { formatNumber } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function FinalScoreCard({ application }: { application: ApplicationRecord }) {
  if (!application.finalResult) {
    return null;
  }

  const result = application.finalResult;
  const progressWidth = `${Math.min(Math.max(result.final_score, 0), 100)}%`;

  return (
    <Card className="overflow-hidden bg-ink text-white">
      <CardHeader className="border-white/10">
        <CardTitle className="text-white">Финальный verdict</CardTitle>
        <CardDescription className="text-white/70">
          Итоговая оценка собирается после расчета всех 4 блоков. Сервер пересчитывает final_score, чтобы исключить завышение или отрицательные значения.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-5 lg:grid-cols-[280px_1fr] lg:items-center">
          <div className="rounded-3xl bg-white/8 p-5">
            <div className="text-xs uppercase tracking-[0.18em] text-white/60">Итоговый score</div>
            <div className="mt-3 text-5xl font-semibold">{formatNumber(result.final_score)}</div>
            <div className="mt-4 h-3 rounded-full bg-white/10">
              <div className="h-3 rounded-full bg-sand" style={{ width: progressWidth }} />
            </div>
            <div className="mt-2 text-sm text-white/70">Шкала 0-100</div>
          </div>
          <div className="rounded-3xl bg-white/8 p-5">
            <div className="text-xs uppercase tracking-[0.18em] text-white/60">Summary</div>
            <p className="mt-3 text-sm leading-7 text-white/85">{result.summary}</p>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl bg-white/8 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              Strengths
            </div>
            <div className="mt-4 space-y-3 text-sm leading-6 text-white/80">
              {result.strengths.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </div>
          <div className="rounded-3xl bg-white/8 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <AlertTriangle className="h-4 w-4 text-amber-300" />
              Weaknesses
            </div>
            <div className="mt-4 space-y-3 text-sm leading-6 text-white/80">
              {result.weaknesses.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </div>
          <div className="rounded-3xl bg-white/8 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <AlertTriangle className="h-4 w-4 text-rose-300" />
              Risk flags
            </div>
            <div className="mt-4 space-y-3 text-sm leading-6 text-white/80">
              {result.risk_flags.length > 0 ? result.risk_flags.map((item) => <p key={item}>{item}</p>) : <p>Критические флаги не выявлены.</p>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}