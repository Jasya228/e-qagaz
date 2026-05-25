import { NextResponse, NextRequest } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const resolvedParams = await params;
  const db = await readDB();
  if (db.notifications) {
    db.notifications = db.notifications.map((n: any) => 
      n.id === resolvedParams.id && n.userId === user.sub ? { ...n, isRead: true } : n
    );
    await writeDB(db);
  }

  return NextResponse.json({ success: true });
}
