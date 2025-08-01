import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    
    try {
      jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get distinct property types
    const types = await prisma.property.findMany({
      select: { type: true },
      distinct: ['type'],
      where: { 
        AND: [
          { type: { not: null } },
          { type: { not: '' } }
        ]
      }
    })

    // Get distinct transaction types
    const transactionTypes = await prisma.property.findMany({
      select: { transactionType: true },
      distinct: ['transactionType'],
      where: { 
        AND: [
          { transactionType: { not: null } },
          { transactionType: { not: '' } }
        ]
      }
    })

    // Get distinct area numbers (sorted)
    const areaNumbers = await prisma.property.findMany({
      select: { areaNumber: true },
      distinct: ['areaNumber'],
      where: { 
        areaNumber: { 
          not: null 
        } 
      },
      orderBy: { areaNumber: 'asc' }
    })

    return NextResponse.json({
      types: types.map((t: any) => t.type).filter(Boolean),
      transactionTypes: transactionTypes.map((t: any) => t.transactionType).filter(Boolean),
      areaNumbers: areaNumbers.map((a: any) => a.areaNumber).filter(Boolean)
    })

  } catch (error) {
    console.error('Filter options error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
