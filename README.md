# Agro Subsidy Scoring MVP

MVP веб-приложения для поэтапного скоринга заявок на агросубсидии Казахстана. Приложение построено на Next.js 14 App Router, TypeScript и Tailwind CSS. Пользователь создает заявку, после чего scoring идет по 4 блокам. Каждый блок считает только 3 модуля и запускается только после явного действия пользователя.

## Стек

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Zod для валидации
- OpenAI API через серверный адаптер
- In-memory store на `Map<string, ApplicationRecord>` для MVP

## Структура проекта

```text
.
├── .env.example
├── README.md
├── app
│   ├── api
│   │   ├── applications
│   │   │   ├── [id]
│   │   │   │   └── route.ts
│   │   │   └── create
│   │   │       └── route.ts
│   │   └── scoring
│   │       ├── continue
│   │       │   └── route.ts
│   │       └── start
│   │           └── route.ts
│   ├── application
│   │   └── [id]
│   │       └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components
│   ├── application-form.tsx
│   ├── application-summary.tsx
│   ├── block-results.tsx
│   ├── final-score-card.tsx
│   └── ui
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       └── field.tsx
├── lib
│   ├── applicationMeta.ts
│   ├── mock
│   │   └── mockScoring.ts
│   ├── openai
│   │   └── client.ts
│   ├── scoring
│   │   ├── blocks.ts
│   │   ├── engine.ts
│   │   └── prompts.ts
│   ├── store.ts
│   ├── types.ts
│   └── utils.ts
├── next-env.d.ts
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## Установка

1. Установите зависимости:

```bash
npm install
```

2. Создайте `.env.local` на основе `.env.example`:

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
```

3. Запустите приложение:

```bash
npm run dev
```

4. Откройте `http://localhost:3000`.

## ENV-переменные

- `OPENAI_API_KEY` — ключ OpenAI. Если отсутствует, приложение автоматически работает в mock mode.
- `OPENAI_MODEL` — модель для реального LLM-режима. По умолчанию используется `gpt-4.1-mini`.

## Flow по блокам

1. Пользователь заполняет форму на главной странице.
2. `POST /api/applications/create` создает заявку и сохраняет ее со статусом `draft`.
3. На странице заявки пользователь нажимает `Начать расчет`.
4. `POST /api/scoring/start` считает только блок 1 и сохраняет результат со статусом `block_1_done`.
5. Пользователь видит результат блока 1 и кнопку `Продолжить`.
6. `POST /api/scoring/continue` определяет следующий блок и считает только его.
7. После блока 4 backend выполняет финальную агрегацию, сохраняет `finalResult` и переводит заявку в `completed`.
8. `GET /api/applications/[id]` всегда возвращает полную заявку с входными данными, batch results и финальным результатом.

## Mock mode

Mock mode включается автоматически, если `OPENAI_API_KEY` не задан. В этом режиме:

- backend не падает и не пытается обращаться к внешнему API;
- для каждого блока генерируется реалистичный JSON того же формата, что и в LLM-режиме;
- после блока 4 генерируется итоговый summary, strengths, weaknesses и risk_flags.

Это позволяет запускать MVP локально без внешних зависимостей.

## Real LLM mode

Если `OPENAI_API_KEY` задан:

- приложение использует адаптер в `lib/openai/client.ts`;
- system prompt и user prompt собираются на русском языке;
- в запрос уходит только текущий блок из 3 модулей;
- ответ модели безопасно парсится и валидируется через Zod;
- сервер нормализует score в диапазон от `0` до `max_score`;
- `block_total` и итоговый `final_score` считаются и валидируются на сервере.

## Архитектура scoring

- Конфигурация блоков находится в `lib/scoring/blocks.ts`.
- Построение промптов вынесено в `lib/scoring/prompts.ts`.
- Основной orchestration находится в `lib/scoring/engine.ts`.
- Mock-генератор вынесен в `lib/mock/mockScoring.ts`.
- OpenAI-адаптер вынесен в `lib/openai/client.ts`.

Разделение позволяет легко заменить источник scoring и позже вынести хранение в базу данных.

## Как заменить in-memory store на PostgreSQL

Сейчас `lib/store.ts` хранит заявки в глобальном `Map`. Для перехода на PostgreSQL:

1. Создайте слой репозитория с теми же методами: `createApplication`, `getApplication`, `updateApplication`, `saveBatchResult`, `finalizeApplication`.
2. Сохраните текущие TypeScript-типы и контракт `ApplicationRecord`.
3. Замените реализацию `Map` на SQL-таблицы `applications`, `application_batches`, `application_final_results`.
4. Оставьте `lib/scoring/engine.ts` без изменений, чтобы orchestration не зависел от конкретного хранилища.

## Что уже реализовано

- Главная страница с описанием системы.
- Полноценная форма заявки с секциями, валидацией и demo fill.
- Страница заявки с карточкой, статусом, прогрессом и результатами блоков.
- Кнопки `Начать расчет` и `Продолжить` с реальным backend flow.
- Финальный блок с итоговым score, summary, strengths, weaknesses и risk_flags.
- Обработка loading, success и error состояний.
