import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const cookie = request.headers.get('cookie');
  if (!cookie || !cookie.includes('refresh_token')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Extract the token (simplified parsing for mock)
  const match = cookie.match(/refresh_token=([^;]+)/);
  if (!match) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const token = match[1];

  // In a real app we'd verify the refresh token in DB. Here we just echo it back as access_token
  return NextResponse.json({ access_token: token });
}
