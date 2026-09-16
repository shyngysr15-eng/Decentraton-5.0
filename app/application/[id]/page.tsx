'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, LoaderCircle, Play, RefreshCw } from 'lucide-react';

import { ApplicationSummary } from '@/components/application-summary';
import { BlockResults } from '@/components/block-results';
import { FinalScoreCard } from '@/components/final-score-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ApplicationRecord } from '@/lib/types';

type ApiResponse = {
  application?: ApplicationRecord;
  error?: string;
  details?: string[];
};

export default function ApplicationDetailsPage({ params }: { params: { id: string } }) {
  const [application, setApplication] = useState<ApplicationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchApplication(showSpinner = true) {
    if (showSpinner) {
      setLoading(true);
    }

    try {
      const response = await fetch(`/api/applications/${params.id}`, { cache: 'no-store' });
      const payload = (await response.json()) as ApiResponse;

      if (!response.ok || !payload.application) {
        throw new Error(payload.error || 'Заявка не найдена');
      }

      setApplication(payload.application);
      setError(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Ошибка загрузки заявки');
    } finally {
      if (showSpinner) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    void fetchApplication();
  }, [params.id]);

  const canStart = Boolean(application && application.currentBlock === 0 && application.status === 'draft');
  const canContinue = Boolean(application && application.currentBlock > 0 && application.currentBlock < 4 && application.status !== 'completed');

  const actionLabel = useMemo(() => {
    if (canStart) {
      return 'Начать расчет';
    }

    if (canContinue) {
      return 'Продолжить';
    }

    return null;
  }, [canContinue, canStart]);

  async function handleScoringAction() {
    if (!application || !actionLabel) {
      return;
    }

    setActionLoading(true);

    try {
      const route = canStart ? '/api/scoring/start' : '/api/scoring/continue';
      const response = await fetch(route, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: application.id })
      });

      const payload = (await response.json()) as ApiResponse;

      if (!response.ok || !payload.application) {
        throw new Error(payload.error || 'Не удалось выполнить расчет');
      }

      setApplication(payload.application);
      setError(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Ошибка расчета');
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-mist">
            <ArrowLeft className="h-4 w-4" />
            К форме заявки
          </Link>
          {application ? <Badge variant="neutral">Текущий блок: {application.currentBlock}/4</Badge> : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => void fetchApplication(false)} className="gap-2" disabled={loading || actionLoading}>
            <RefreshCw className="h-4 w-4" />
            Обновить данные
          </Button>
          {actionLabel ? (
            <Button onClick={() => void handleScoringAction()} disabled={actionLoading || loading} className="gap-2">
              {actionLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {actionLabel}
            </Button>
          ) : null}
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="flex items-center gap-3 p-8 text-sm text-slate">
            <LoaderCircle className="h-5 w-5 animate-spin" />
            Загружаю заявку и накопленные результаты блоков.
          </CardContent>
        </Card>
      ) : null}

      {error ? (
        <Card className="border-rose-200 bg-rose-50">
          <CardContent className="p-6 text-sm text-rose-800">{error}</CardContent>
        </Card>
      ) : null}

      {!loading && application ? (
        <>
          <ApplicationSummary application={application} />
          <BlockResults application={application} />
          <FinalScoreCard application={application} />
        </>
      ) : null}
    </main>
  );
}