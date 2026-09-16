import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { getScoringMode } from '@/lib/openai/client';
import { createApplication } from '@/lib/store';
import { createApplicationRequestSchema } from '@/lib/types';

function errorResponse(error: unknown, status = 400) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Ошибка валидации заявки',
        details: error.issues.map((issue) => issue.message)
      },
      { status }
    );
  }

  return NextResponse.json(
    {
      error: error instanceof Error ? error.message : 'Неизвестная ошибка'
    },
    { status }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createApplicationRequestSchema.parse(body);
    const application = createApplication(parsed.input, getScoringMode());

    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}