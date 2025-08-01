import { NextRequest, NextResponse } from 'next/server'
import { localAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ valid: false, message: 'No token provided' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const user = await localAuth.verifyToken(token)

    if (!user) {
      return NextResponse.json({ valid: false, message: 'Invalid token' }, { status: 401 })
    }

    return NextResponse.json({ 
      valid: true, 
      user: {
        id: user.id,
        mobileNumber: user.mobileNumber,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive
      }
    })
  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json({ valid: false, message: 'Token verification failed' }, { status: 500 })
  }
}
