import { NextResponse } from 'next/server';

import { getApplication } from '@/lib/store';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const application = getApplication(params.id);

  if (!application) {
    return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 });
  }

  return NextResponse.json({ application });
}