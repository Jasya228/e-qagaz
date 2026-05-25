import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const db = await readDB();
    const user = db.users.find((u: any) => u.email === email && u.passwordHash === password);

    if (!user) {
      return NextResponse.json({ message: 'Неверный email или пароль' }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ message: 'Аккаунт заблокирован' }, { status: 403 });
    }

    const payload = { sub: user.id, role: user.role };
    const token = Buffer.from(JSON.stringify(payload)).toString('base64');

    // Simulate httpOnly cookie for refresh token
    const res = NextResponse.json({
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });

    res.cookies.set('refresh_token', token, { httpOnly: true, path: '/' });

    return res;
  } catch (error) {
    return NextResponse.json({ message: 'Ошибка сервера' }, { status: 500 });
  }
}
