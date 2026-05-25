import { NextResponse, NextRequest } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const db = await readDB();
  return NextResponse.json({
    groups: db.groups || [],
    curators: db.curators || [],
    departments: db.departments || []
  });
}

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  try {
    const { type, payload } = await request.json();
    const db = await readDB();

    if (!db.groups) db.groups = [];
    if (!db.curators) db.curators = [];

    const newItem = { id: `${type}-${Date.now()}`, ...payload };

    if (type === 'groups') db.groups.push(newItem);
    else if (type === 'curators') db.curators.push(newItem);
    else if (type === 'departments') db.departments.push(newItem);
    else return NextResponse.json({ message: 'Invalid type' }, { status: 400 });

    await writeDB(db);
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error adding reference' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const id = searchParams.get('id');

  if (!type || !id) return NextResponse.json({ message: 'Missing type or id' }, { status: 400 });

  const db = await readDB();

  if (type === 'groups') db.groups = db.groups.filter((i: any) => i.id !== id);
  else if (type === 'curators') db.curators = db.curators.filter((i: any) => i.id !== id);
  else if (type === 'departments') db.departments = db.departments.filter((i: any) => i.id !== id);
  else return NextResponse.json({ message: 'Invalid type' }, { status: 400 });

  await writeDB(db);
  return NextResponse.json({ message: 'Deleted successfully' });
}
