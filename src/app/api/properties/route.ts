import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    
    try {
      jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const type = searchParams.get('type')
    const transactionType = searchParams.get('transactionType')
    const areaNumber = searchParams.get('areaNumber')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (type && type !== '') where.type = type
    if (transactionType && transactionType !== '') where.transactionType = transactionType
    if (areaNumber && areaNumber !== '') where.areaNumber = parseInt(areaNumber)

    console.log('Properties API - Query params:', { page, limit, type, transactionType, areaNumber })
    console.log('Properties API - Where clause:', where)

    // Get properties with pagination
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          owner: {
            select: {
              fullName: true,
              mobileNumber: true
            }
          },
          agent: {
            include: {
              user: {
                select: {
                  fullName: true,
                  mobileNumber: true
                }
              }
            }
          },
          features: {
            include: {
              feature: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.property.count({ where })
    ])

    console.log(`Properties API - Found ${properties.length} properties out of ${total} total`)

    // Get statistics
    const stats = await prisma.property.groupBy({
      by: ['type', 'transactionType', 'status'],
      _count: {
        id: true
      }
    })

    return NextResponse.json({
      properties,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats,
      success: true
    })

  } catch (error) {
    console.error('Properties API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        success: false
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
