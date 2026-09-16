import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { startScoring } from '@/lib/scoring/engine';
import { applicationIdRequestSchema } from '@/lib/types';

function errorResponse(error: unknown, status = 400) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Ошибка валидации запроса',
        details: error.issues.map((issue) => issue.message)
      },
      { status }
    );
  }

  return NextResponse.json(
    {
      error: error instanceof Error ? error.message : 'Неизвестная ошибка скоринга'
    },
    { status }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { applicationId } = applicationIdRequestSchema.parse(body);
    const application = await startScoring(applicationId);

    return NextResponse.json({ application });
  } catch (error) {
    return errorResponse(error);
  }
}