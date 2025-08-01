import { createClient } from '@/lib/supabase/client'

export interface AuthResult {
  success: boolean
  user?: any
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
        const { data: userData, error: userError } = await this.supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (userError) {
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
    } catch (error) {
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
        user: data.user
      }
    } catch (error) {
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
    } catch (error) {
      return { success: false, error: 'Network error occurred' }
    }
  }

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser()
      
      if (error || !user) {
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
    } catch (error) {
      return null
    }
  }

  async getUserRole(userId: string): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()

      if (error || !data) {
        return null
      }

      return data.role
    } catch (error) {
      return null
    }
  }
}

export const mobileAuth = new MobileAuth()
