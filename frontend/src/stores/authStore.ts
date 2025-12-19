import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  initialized: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
  demoLogin: () => Promise<{ error: Error | null }>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    try {
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession()
      
      set({ 
        session, 
        user: session?.user ?? null, 
        loading: false,
        initialized: true 
      })

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        set({ 
          session, 
          user: session?.user ?? null,
          loading: false 
        })
      })
    } catch (error) {
      console.error('Error initializing auth:', error)
      set({ loading: false, initialized: true })
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true })
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      set({ 
        user: data.user, 
        session: data.session,
        loading: false 
      })

      return { error: null }
    } catch (error) {
      set({ loading: false })
      return { error: error as Error }
    }
  },

  signUp: async (email: string, password: string, name: string) => {
    try {
      set({ loading: true })
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      })

      if (error) throw error

      set({ 
        user: data.user, 
        session: data.session,
        loading: false 
      })

      return { error: null }
    } catch (error) {
      set({ loading: false })
      return { error: error as Error }
    }
  },

  signOut: async () => {
    try {
      set({ loading: true })
      await supabase.auth.signOut()
      set({
        user: null,
        session: null,
        loading: false
      })
    } catch (error) {
      console.error('Error signing out:', error)
      set({ loading: false })
    }
  },

  demoLogin: async () => {
    try {
      set({ loading: true })
      
      // Create a fake user object for demo purposes
      const demoUser = {
        id: 'demo-user-123',
        email: 'demo@example.com',
        user_metadata: { name: 'Demo User' },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User

      const demoSession = {
        access_token: 'demo-token',
        refresh_token: 'demo-refresh',
        expires_in: 3600,
        token_type: 'bearer',
        user: demoUser,
      } as Session

      set({
        user: demoUser,
        session: demoSession,
        loading: false
      })

      return { error: null }
    } catch (error) {
      set({ loading: false })
      return { error: error as Error }
    }
  },
}))
