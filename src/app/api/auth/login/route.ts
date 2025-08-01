import { NextRequest, NextResponse } from 'next/server'
import { localAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { identifier, password } = await request.json()

    if (!identifier || !password) {
      return NextResponse.json(
        { message: 'Identifier and password are required' },
        { status: 400 }
      )
    }

    const result = await localAuth.login(identifier, password)

    if (!result.success) {
      return NextResponse.json(
        { message: result.message },
        { status: 401 }
      )
    }

    return NextResponse.json({
      user: result.user,
      token: result.token
    })
  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
