import { NextRequest, NextResponse } from 'next/server'
import { localAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('=== LOGIN DEBUG API ===')
    const { identifier, password } = await request.json()
    console.log('Login attempt for:', identifier)
    console.log('Password provided:', password ? 'Yes' : 'No')

    if (!identifier || !password) {
      console.log('Missing credentials')
      return NextResponse.json(
        { message: 'Identifier and password are required' },
        { status: 400 }
      )
    }

    // Check if user exists in database
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { mobileNumber: identifier },
          { email: identifier }
        ]
      }
    })

    console.log('User found:', user ? 'Yes' : 'No')
    if (user) {
      console.log('User details:', {
        id: user.id,
        email: user.email,
        mobile: user.mobileNumber,
        role: user.role,
        isActive: user.isActive
      })
    }

    const result = await localAuth.login(identifier, password)
    console.log('Auth result:', result.success ? 'Success' : 'Failed')
    if (!result.success) {
      console.log('Auth error:', result.message)
    }

    if (!result.success) {
      return NextResponse.json(
        { message: result.message },
        { status: 401 }
      )
    }

    console.log('Login successful for user:', result.user?.role)
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
