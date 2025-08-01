import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export interface AuthResult {
  success: boolean
  user?: User & { role?: string; mobile_number?: string; full_name?: string }
  error?: string
}

export class MobileAuth {
  private supabase = createClient()

  async signInWithMobile(mobileNumber: string, password: string): Promise<AuthResult> {
    try {
      // Use phone-based authentication
      const { data, error } = await this.supabase.auth.signInWithPassword({
        phone: mobileNumber,
        password: password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        // Get user role and additional data
        const { data: userData } = await this.supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (!userData) {
          return { success: false, error: 'Failed to fetch user data' }
        }

        return {
          success: true,
          user: {
            ...data.user,
            ...userData
          }
        }
      }

      return { success: false, error: 'Authentication failed' }
    } catch {
      return { success: false, error: 'Network error occurred' }
    }
  }

  async signUpWithMobile(
    mobileNumber: string, 
    password: string, 
    fullName: string,
    role: 'agent' | 'client' = 'client'
  ): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        phone: mobileNumber,
        password: password,
        options: {
          data: {
            mobile_number: mobileNumber,
            full_name: fullName,
            role: role
          }
        }
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return {
        success: true,
        user: data.user || undefined
      }
    } catch {
      return { success: false, error: 'Network error occurred' }
    }
  }

  async signOut(): Promise<AuthResult> {
    try {
      const { error } = await this.supabase.auth.signOut()
      
      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch {
      return { success: false, error: 'Network error occurred' }
    }
  }

  async getCurrentUser() {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      
      if (!user) {
        return null
      }

      // Get additional user data
      const { data: userData } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      return {
        ...user,
        ...userData
      }
    } catch {
      return null
    }
  }

  async getUserRole(userId: string): Promise<string | null> {
    try {
      const { data } = await this.supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()

      if (!data) {
        return null
      }

      return data.role
    } catch {
      return null
    }
  }
}

export const mobileAuth = new MobileAuth()
