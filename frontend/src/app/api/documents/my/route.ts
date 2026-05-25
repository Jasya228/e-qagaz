import { NextResponse, NextRequest } from 'next/server';
import { readDB } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  // Returning empty documents for now as there's no documents table in db.json yet
  // If we had it, we would filter by user.sub
  return NextResponse.json([]);
}
