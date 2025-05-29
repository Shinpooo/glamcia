import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Database types
export interface DatabasePrestation {
  id: number
  user_email: string
  service_id: string
  service_name: string
  service_category: string
  date: string
  notes?: string
  payment_method: string
  cash_amount: number
  card_amount: number
  created_at: string
  updated_at: string
}

export interface DatabaseExpense {
  id: number
  user_email: string
  category_id: string
  category_name: string
  amount: number
  date: string
  description?: string
  created_at: string
  updated_at: string
} 