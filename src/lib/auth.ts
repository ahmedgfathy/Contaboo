import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret'

export interface User {
  id: string
  mobileNumber: string
  email?: string
  fullName?: string
  role: 'admin' | 'agent' | 'client'
  isActive: boolean
}

export interface AuthResult {
  success: boolean
  user?: User
  token?: string
  message?: string
}

class LocalAuth {
  async login(identifier: string, password: string): Promise<AuthResult> {
    try {
      // Check if identifier is admin email
      let user
      if (identifier === process.env.ADMIN_EMAIL) {
        // Find admin by mobile number
        user = await prisma.user.findUnique({
          where: { mobileNumber: process.env.ADMIN_MOBILE }
        })
      } else {
        // Try to find by mobile number or email
        user = await prisma.user.findFirst({
          where: {
            OR: [
              { mobileNumber: identifier },
              { email: identifier }
            ]
          }
        })
      }

      if (!user || !user.isActive) {
        return { success: false, message: 'User not found or inactive' }
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash)
      if (!isValidPassword) {
        return { success: false, message: 'Invalid credentials' }
      }

      const token = jwt.sign(
        { 
          userId: user.id, 
          role: user.role,
          mobileNumber: user.mobileNumber 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      )

      return {
        success: true,
        user: {
          id: user.id,
          mobileNumber: user.mobileNumber,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          isActive: user.isActive
        },
        token
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: 'Authentication failed' }
    }
  }

  async verifyToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      })

      if (!user || !user.isActive) {
        return null
      }

      return {
        id: user.id,
        mobileNumber: user.mobileNumber,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive
      }
    } catch (error) {
      return null
    }
  }

  async register(data: {
    mobileNumber: string
    email?: string
    fullName?: string
    password: string
    role?: 'agent' | 'client'
  }): Promise<AuthResult> {
    try {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { mobileNumber: data.mobileNumber },
            ...(data.email ? [{ email: data.email }] : [])
          ]
        }
      })

      if (existingUser) {
        return { success: false, message: 'User already exists' }
      }

      const passwordHash = await bcrypt.hash(data.password, 12)

      const user = await prisma.user.create({
        data: {
          mobileNumber: data.mobileNumber,
          email: data.email,
          fullName: data.fullName,
          passwordHash,
          role: data.role || 'client',
          isActive: true
        }
      })

      const token = jwt.sign(
        { 
          userId: user.id, 
          role: user.role,
          mobileNumber: user.mobileNumber 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      )

      return {
        success: true,
        user: {
          id: user.id,
          mobileNumber: user.mobileNumber,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          isActive: user.isActive
        },
        token
      }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, message: 'Registration failed' }
    }
  }
}

export const localAuth = new LocalAuth()
