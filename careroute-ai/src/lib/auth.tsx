import type { Session } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from './supabase'

export interface StaffProfile {
  user_id: string
  email: string | null
  display_name: string | null
  role: string
}

interface AuthState {
  /** true until the initial session + staff lookup has finished */
  loading: boolean
  session: Session | null
  /** null when signed out OR signed in but not on the staff list */
  staff: StaffProfile | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [sessionReady, setSessionReady] = useState(!supabase)
  const [staff, setStaff] = useState<StaffProfile | null>(null)
  const [staffReadyFor, setStaffReadyFor] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setSessionReady(true)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  const userId = session?.user.id ?? null

  // Look up the signed-in user's staff row (RLS returns it only if they are staff).
  useEffect(() => {
    if (!supabase || !userId) return
    let cancelled = false
    supabase
      .from('staff')
      .select('user_id, email, display_name, role')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return
        setStaff(data ?? null)
        setStaffReadyFor(userId)
      })
    return () => {
      cancelled = true
    }
  }, [userId])

  const loading = !sessionReady || (userId !== null && staffReadyFor !== userId)

  const value: AuthState = {
    loading,
    session,
    staff: userId && staffReadyFor === userId ? staff : null,
    async signIn(email, password) {
      if (!supabase) throw new Error('Supabase is not configured.')
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (error) {
        throw new Error(
          error.message === 'Invalid login credentials'
            ? 'Incorrect email or password.'
            : 'Sign-in failed. Please try again.',
        )
      }
    },
    async signOut() {
      await supabase?.auth.signOut()
      setStaff(null)
      setStaffReadyFor(null)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
