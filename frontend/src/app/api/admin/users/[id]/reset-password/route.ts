import { NextResponse, NextRequest } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const resolvedParams = await params;
  const targetId = resolvedParams.id;
  
  try {
    const data = await request.json();
    const newPassword = data.newPassword;

    if (!newPassword) {
      return NextResponse.json({ message: 'New password is required' }, { status: 400 });
    }

    const db = await readDB();
    const userIndex = db.users.findIndex((u: any) => u.id === targetId);

    if (userIndex === -1) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    db.users[userIndex].passwordHash = newPassword;
    await writeDB(db);

    return NextResponse.json({ message: 'Password reset successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Error resetting password' }, { status: 500 });
  }
}
