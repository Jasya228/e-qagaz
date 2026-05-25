import { NextRequest } from 'next/server';

export function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const payloadStr = Buffer.from(token, 'base64').toString('utf-8');
    const payload = JSON.parse(payloadStr);
    return payload; // { sub: 'id', role: 'ROLE' }
  } catch (e) {
    return null;
  }
}
