import { NextResponse } from 'next/server'
import { signToken } from '@/lib/auth'

export async function POST(request: Request) {
  const { password } = await request.json()
  const correctPassword = process.env.AUTH_PASSWORD || 'Lemme2026!'

  if (password !== correctPassword) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const token = await signToken({ authenticated: true })

  const response = NextResponse.json({ success: true })
  response.cookies.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  })

  return response
}
