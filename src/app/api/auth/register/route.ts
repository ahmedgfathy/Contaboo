import { NextRequest, NextResponse } from 'next/server'
import { localAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { mobileNumber, email, fullName, password, role } = await request.json()

    if (!mobileNumber || !password) {
      return NextResponse.json(
        { message: 'Mobile number and password are required' },
        { status: 400 }
      )
    }

    const result = await localAuth.register({
      mobileNumber,
      email,
      fullName,
      password,
      role
    })

    if (!result.success) {
      return NextResponse.json(
        { message: result.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      user: result.user,
      token: result.token
    })
  } catch (error) {
    console.error('Register API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
