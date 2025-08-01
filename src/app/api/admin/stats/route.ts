import { NextRequest, NextResponse } from 'next/server'
import { localAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const user = await localAuth.verifyToken(token)

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    // Get stats from database
    const [
      totalUsers,
      totalAgents,
      totalClients,
      totalProperties,
      availableProperties,
      soldProperties
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'agent' } }),
      prisma.user.count({ where: { role: 'client' } }),
      prisma.property.count(),
      prisma.property.count({ where: { status: 'available' } }),
      prisma.property.count({ where: { status: 'sold' } })
    ])

    return NextResponse.json({
      totalUsers,
      totalAgents,
      totalClients,
      totalProperties,
      availableProperties,
      soldProperties
    })
  } catch (error) {
    console.error('Admin stats API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
