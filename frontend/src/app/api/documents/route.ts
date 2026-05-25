import { NextResponse, NextRequest } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const db = await readDB();
  const docs = (db.documents || []).filter((d: any) => d.userId === user.sub);
  return NextResponse.json(docs);
}

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'STUDENT') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const data = await request.json();
    const db = await readDB();

    if (!db.documents) db.documents = [];

    const newDoc = {
      id: `doc-${Date.now()}`,
      userId: user.sub,
      title: data.title,
      type: data.type,
      status: 'READY',
      fileUrl: data.fileUrl,
      createdAt: new Date().toISOString()
    };

    db.documents.push(newDoc);
    await writeDB(db);

    return NextResponse.json(newDoc, { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: 'Error uploading document' }, { status: 500 });
  }
}
