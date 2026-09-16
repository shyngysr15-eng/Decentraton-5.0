'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, LoaderCircle, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, inputClassName } from '@/components/ui/field';
import {
  APPLICATION_FORM_SECTIONS,
  ApplicationFormState,
  createEmptyFormState,
  createFormStateFromInput,
  DEMO_APPLICATION_INPUT
} from '@/lib/applicationMeta';
import { createApplicationRequestSchema } from '@/lib/types';

type ValidationErrors = Partial<Record<keyof ApplicationFormState, string>>;

export function ApplicationForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<ApplicationFormState>(() => createEmptyFormState());
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const sectionCount = useMemo(() => APPLICATION_FORM_SECTIONS.length, []);

  function setFieldValue<Key extends keyof ApplicationFormState>(key: Key, value: ApplicationFormState[Key]) {
    setFormData((current) => ({ ...current, [key]: value }));
  }

  function applyDemoData() {
    setFormData(createFormStateFromInput(DEMO_APPLICATION_INPUT));
    setErrors({});
    setSubmitError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setSubmitError(null);

    const parsed = createApplicationRequestSchema.safeParse({ input: formData });

    if (!parsed.success) {
      const fieldErrors: ValidationErrors = {};

      for (const issue of parsed.error.issues) {
        const fieldName = issue.path.at(-1);

        if (typeof fieldName === 'string') {
          fieldErrors[fieldName as keyof ApplicationFormState] = issue.message;
        }
      }

      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    setErrors({});

    try {
      const response = await fetch('/api/applications/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data)
      });

      const payload = (await response.json()) as { application?: { id: string }; error?: string; details?: string[] };

      if (!response.ok || !payload.application) {
        throw new Error(payload.error || 'Не удалось создать заявку');
      }

      router.push(`/application/${payload.application.id}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Ошибка при создании заявки');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-white via-mist to-[#edf5ef]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle className="text-2xl">Новая заявка на скоринг</CardTitle>
            <CardDescription className="max-w-2xl text-sm leading-6">
              Заполните профиль фермы, финансовые и инфраструктурные показатели. После создания заявка будет считаться по 4 блокам с явной остановкой после каждого этапа.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={applyDemoData} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Заполнить демо-данными
            </Button>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/80 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-slate">Секции формы</div>
            <div className="mt-2 text-2xl font-semibold text-ink">{sectionCount}</div>
          </div>
          <div className="rounded-2xl bg-white/80 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-slate">Модулей скоринга</div>
            <div className="mt-2 text-2xl font-semibold text-ink">12</div>
          </div>
          <div className="rounded-2xl bg-white/80 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-slate">Режим MVP</div>
            <div className="mt-2 text-2xl font-semibold text-ink">Mock / LLM</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <form onSubmit={handleSubmit} className="divide-y divide-black/6">
          {APPLICATION_FORM_SECTIONS.map((section) => (
            <section key={section.id} className="px-6 py-7 lg:px-8">
              <div className="mb-5 max-w-3xl">
                <h3 className="text-base font-semibold text-ink">{section.title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate">{section.description}</p>
              </div>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {section.fields.map((field) => {
                  const value = formData[field.name];
                  const error = errors[field.name];
                  const fieldId = `field-${String(field.name)}`;

                  if (field.kind === 'checkbox') {
                    return (
                      <label key={fieldId} htmlFor={fieldId} className="flex min-h-[56px] items-center justify-between rounded-2xl border border-black/10 bg-mist/50 px-4 py-3">
                        <div className="pr-4">
                          <div className="text-sm font-medium text-ink">{field.label}</div>
                          {field.hint ? <div className="mt-1 text-xs text-slate">{field.hint}</div> : null}
                          {error ? <div className="mt-1 text-xs text-rose-700">{error}</div> : null}
                        </div>
                        <input
                          id={fieldId}
                          type="checkbox"
                          checked={Boolean(value)}
                          onChange={(event) => setFieldValue(field.name, event.target.checked)}
                          className="h-5 w-5 rounded border-black/20 text-pine focus:ring-pine"
                        />
                      </label>
                    );
                  }

                  if (field.kind === 'select') {
                    return (
                      <Field key={fieldId} label={field.label} htmlFor={fieldId} hint={field.hint} error={error}>
                        <select
                          id={fieldId}
                          value={String(value)}
                          onChange={(event) => setFieldValue(field.name, event.target.value)}
                          className={inputClassName(Boolean(error))}
                        >
                          <option value="">Выберите значение</option>
                          {field.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </Field>
                    );
                  }

                  if (field.kind === 'textarea') {
                    return (
                      <Field key={fieldId} label={field.label} htmlFor={fieldId} hint={field.hint} error={error} className="md:col-span-2 xl:col-span-3">
                        <textarea
                          id={fieldId}
                          value={String(value)}
                          onChange={(event) => setFieldValue(field.name, event.target.value)}
                          placeholder={field.placeholder}
                          rows={4}
                          className={inputClassName(Boolean(error))}
                        />
                      </Field>
                    );
                  }

                  return (
                    <Field key={fieldId} label={field.label} htmlFor={fieldId} hint={field.hint} error={error}>
                      <input
                        id={fieldId}
                        type={field.kind}
                        step={field.step}
                        value={String(value)}
                        onChange={(event) => setFieldValue(field.name, event.target.value)}
                        placeholder={field.placeholder}
                        className={inputClassName(Boolean(error))}
                      />
                    </Field>
                  );
                })}
              </div>
            </section>
          ))}
          <section className="px-6 py-6 lg:px-8">
            <div className="grid gap-4 rounded-3xl bg-ink px-5 py-5 text-white lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="text-sm font-semibold">Что будет дальше</div>
                <div className="mt-1 text-sm text-white/80">
                  После создания система сохранит заявку как черновик. Расчет блока 1 запускается отдельно на странице заявки и не уходит дальше без действия пользователя.
                </div>
              </div>
              <Button type="submit" disabled={loading} className="gap-2 bg-white text-ink hover:bg-mist disabled:bg-white/80">
                {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                Создать заявку
              </Button>
            </div>
            {submitError ? <p className="mt-4 text-sm text-rose-700">{submitError}</p> : null}
          </section>
        </form>
      </CardContent>
    </Card>
  );
}