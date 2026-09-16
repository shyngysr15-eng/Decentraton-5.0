import { FileText, ShieldCheck, Workflow } from 'lucide-react';

import { ApplicationForm } from '@/components/application-form';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div>
          <div className="inline-flex rounded-full border border-black/10 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate">
            Казахстан • Agro Subsidy Scoring MVP
          </div>
          <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            Поэтапный скоринг заявок на агросубсидии с контролируемым запуском каждого блока.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-slate">
            Система сохраняет заявку, считает только текущие 3 модуля, останавливается после каждого блока и показывает накопленный результат до финального вердикта. Архитектура рассчитана на быстрый переход с in-memory store на PostgreSQL.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <div className="rounded-3xl border border-black/8 bg-white/85 p-5 shadow-panel">
            <FileText className="h-5 w-5 text-pine" />
            <div className="mt-3 text-lg font-semibold text-ink">11 секций формы</div>
            <p className="mt-2 text-sm leading-6 text-slate">Удобная группировка полей, базовая клиентская и серверная валидация, кнопка для быстрой загрузки demo farm data.</p>
          </div>
          <div className="rounded-3xl border border-black/8 bg-white/85 p-5 shadow-panel">
            <Workflow className="h-5 w-5 text-pine" />
            <div className="mt-3 text-lg font-semibold text-ink">4 этапа scoring</div>
            <p className="mt-2 text-sm leading-6 text-slate">Только текущий батч из 3 модулей уходит в расчет. Следующий шаг требует явного действия пользователя.</p>
          </div>
          <div className="rounded-3xl border border-black/8 bg-white/85 p-5 shadow-panel">
            <ShieldCheck className="h-5 w-5 text-pine" />
            <div className="mt-3 text-lg font-semibold text-ink">Mock fallback</div>
            <p className="mt-2 text-sm leading-6 text-slate">Если ключ OpenAI не задан, приложение продолжает работать и возвращает реалистичные mock-результаты.</p>
          </div>
        </div>
      </section>

      <ApplicationForm />
    </main>
  );
}