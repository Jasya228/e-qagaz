import { NextResponse, NextRequest } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'STUDENT') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const resolvedParams = await params;
    const targetId = resolvedParams.id;
    const db = await readDB();

    if (!db.documents) return NextResponse.json({ message: 'Not found' }, { status: 404 });

    const docIndex = db.documents.findIndex((d: any) => d.id === targetId && d.userId === user.sub);
    
    if (docIndex === -1) {
      return NextResponse.json({ message: 'Document not found or access denied' }, { status: 404 });
    }

    db.documents.splice(docIndex, 1);
    await writeDB(db);

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting document' }, { status: 500 });
  }
}
