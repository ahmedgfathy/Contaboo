import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { mobileNumber, email, password, fullName, role } = await request.json()

    if (!mobileNumber || !password || !fullName) {
      return NextResponse.json(
        { error: 'Mobile number, password, and full name are required' },
        { status: 400 }
      )
    }

    const user = await AuthService.signUp(
      mobileNumber,
      email,
      password,
      fullName,
      role || 'client'
    )

    if (!user) {
      return NextResponse.json(
        { error: 'User already exists or registration failed' },
        { status: 400 }
      )
    }

    // Set auth cookie
    await AuthService.setAuthCookie(user)

    return NextResponse.json({
      user: {
        id: user.id,
        mobileNumber: user.mobileNumber,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Sign up error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
