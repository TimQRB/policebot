import { NextRequest, NextResponse } from 'next/server';
import { createToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const { login, password } = await request.json();

  const adminLogin = process.env.ADMIN_LOGIN;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (login === adminLogin && password === adminPassword) {
    const token = await createToken({ role: 'admin', login });
    
    const response = NextResponse.json({ success: true });
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
    });
    
    return response;
  }

  return NextResponse.json({ error: 'Неверные данные' }, { status: 401 });
}





