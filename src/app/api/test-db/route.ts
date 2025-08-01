import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Simple test endpoint without authentication
    const count = await prisma.property.count()
    const sample = await prisma.property.findFirst({
      include: {
        owner: {
          select: {
            fullName: true,
            mobileNumber: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Database connection successful',
      totalProperties: count,
      sampleProperty: sample,
      success: true
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      error: 'Database connection failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      success: false
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
