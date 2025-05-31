import { supabase, DatabasePrestation, DatabaseExpense } from '../lib/supabase'
import { Prestation, DailyStats, Expense, DailyExpenseStats, PaymentMethod, getPrestationTotal, getExpenseTotal } from '../types'
import { format, parseISO } from 'date-fns'

// Convert database record to app format
const dbPrestationToPrestation = (dbPrestation: DatabasePrestation): Prestation => ({
  id: dbPrestation.id,
  serviceCategory: dbPrestation.service_category,
  date: dbPrestation.date,
  notes: dbPrestation.notes,
  paymentMethod: dbPrestation.payment_method as PaymentMethod,
  cashAmount: dbPrestation.cash_amount,
  cardAmount: dbPrestation.card_amount
})

const dbExpenseToExpense = (dbExpense: DatabaseExpense): Expense => ({
  id: dbExpense.id,
  categoryId: dbExpense.category_id,
  categoryName: dbExpense.category_name,
  amount: dbExpense.amount, // Keep for backward compatibility
  date: dbExpense.date,
  description: dbExpense.description,
  paymentMethod: (dbExpense.payment_method || 'cash') as PaymentMethod, // Default to cash for old records
  cashAmount: dbExpense.cash_amount || dbExpense.amount || 0, // Fallback for old data
  cardAmount: dbExpense.card_amount || 0
})

// Convert app format to database format
const prestationToDbPrestation = (prestation: Prestation, userEmail: string): Omit<DatabasePrestation, 'id' | 'created_at' | 'updated_at'> => ({
  user_email: userEmail,
  service_category: prestation.serviceCategory,
  date: prestation.date,
  notes: prestation.notes,
  payment_method: prestation.paymentMethod,
  cash_amount: prestation.cashAmount,
  card_amount: prestation.cardAmount
})

const expenseToDbExpense = (expense: Expense, userEmail: string): Omit<DatabaseExpense, 'id' | 'created_at' | 'updated_at'> => ({
  user_email: userEmail,
  category_id: expense.categoryId,
  category_name: expense.categoryName,
  amount: expense.amount || getExpenseTotal(expense), // Keep for backward compatibility
  date: expense.date,
  description: expense.description,
  payment_method: expense.paymentMethod,
  cash_amount: expense.cashAmount,
  card_amount: expense.cardAmount
})

// PRESTATIONS FUNCTIONS
export const loadPrestations = async (userEmail?: string): Promise<Prestation[]> => {
  try {
    if (!userEmail) {
      console.log('No user email provided')
      return []
    }

    const { data, error } = await supabase
      .from('prestations')
      .select('*')
      .eq('user_email', userEmail)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error loading prestations:', error)
      return []
    }

    return data.map(dbPrestationToPrestation)
  } catch (error) {
    console.error('Error loading prestations:', error)
    return []
  }
}

export const addPrestation = async (prestation: Prestation, userEmail?: string): Promise<boolean> => {
  try {
    if (!userEmail) {
      console.log('No user email provided')
      return false
    }

    const dbPrestation = prestationToDbPrestation(prestation, userEmail)
    
    const { error } = await supabase
      .from('prestations')
      .insert([dbPrestation])

    if (error) {
      console.error('Error adding prestation:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error adding prestation:', error)
    return false
  }
}

export const updatePrestation = async (id: number, updatedPrestation: Prestation, userEmail?: string): Promise<boolean> => {
  try {
    if (!userEmail) return false

    const dbPrestation = prestationToDbPrestation(updatedPrestation, userEmail)
    
    const { error } = await supabase
      .from('prestations')
      .update(dbPrestation)
      .eq('id', id)
      .eq('user_email', userEmail)

    if (error) {
      console.error('Error updating prestation:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating prestation:', error)
    return false
  }
}

export const deletePrestation = async (id: number, userEmail?: string): Promise<boolean> => {
  try {
    if (!userEmail) return false

    const { error } = await supabase
      .from('prestations')
      .delete()
      .eq('id', id)
      .eq('user_email', userEmail)

    if (error) {
      console.error('Error deleting prestation:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting prestation:', error)
    return false
  }
}

export const getPrestationById = async (id: number, userEmail?: string): Promise<Prestation | undefined> => {
  try {
    if (!userEmail) return undefined

    const { data, error } = await supabase
      .from('prestations')
      .select('*')
      .eq('id', id)
      .eq('user_email', userEmail)
      .single()

    if (error) {
      console.error('Error getting prestation by id:', error)
      return undefined
    }

    return dbPrestationToPrestation(data)
  } catch (error) {
    console.error('Error getting prestation by id:', error)
    return undefined
  }
}

export const getPrestationsByDate = async (date: string, userEmail?: string): Promise<Prestation[]> => {
  try {
    if (!userEmail) return []

    const { data, error } = await supabase
      .from('prestations')
      .select('*')
      .eq('user_email', userEmail)
      .eq('date', date)

    if (error) {
      console.error('Error getting prestations by date:', error)
      return []
    }

    return data.map(dbPrestationToPrestation)
  } catch (error) {
    console.error('Error getting prestations by date:', error)
    return []
  }
}

// EXPENSES FUNCTIONS
export const loadExpenses = async (userEmail?: string): Promise<Expense[]> => {
  try {
    if (!userEmail) {
      console.log('No user email provided')
      return []
    }

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_email', userEmail)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error loading expenses:', error)
      return []
    }

    return data.map(dbExpenseToExpense)
  } catch (error) {
    console.error('Error loading expenses:', error)
    return []
  }
}

export const addExpense = async (expense: Expense, userEmail?: string): Promise<boolean> => {
  try {
    if (!userEmail) {
      console.log('No user email provided')
      return false
    }

    const dbExpense = expenseToDbExpense(expense, userEmail)
    
    const { error } = await supabase
      .from('expenses')
      .insert([dbExpense])

    if (error) {
      console.error('Error adding expense:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error adding expense:', error)
    return false
  }
}

export const updateExpense = async (id: number, updatedExpense: Expense, userEmail?: string): Promise<boolean> => {
  try {
    if (!userEmail) return false

    const dbExpense = expenseToDbExpense(updatedExpense, userEmail)
    
    const { error } = await supabase
      .from('expenses')
      .update(dbExpense)
      .eq('id', id)
      .eq('user_email', userEmail)

    if (error) {
      console.error('Error updating expense:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating expense:', error)
    return false
  }
}

export const deleteExpense = async (id: number, userEmail?: string): Promise<boolean> => {
  try {
    if (!userEmail) return false

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_email', userEmail)

    if (error) {
      console.error('Error deleting expense:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting expense:', error)
    return false
  }
}

export const getExpenseById = async (id: number, userEmail?: string): Promise<Expense | undefined> => {
  try {
    if (!userEmail) return undefined

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', id)
      .eq('user_email', userEmail)
      .single()

    if (error) {
      console.error('Error getting expense by id:', error)
      return undefined
    }

    return dbExpenseToExpense(data)
  } catch (error) {
    console.error('Error getting expense by id:', error)
    return undefined
  }
}

export const getExpensesByDate = async (date: string, userEmail?: string): Promise<Expense[]> => {
  try {
    if (!userEmail) return []

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_email', userEmail)
      .eq('date', date)

    if (error) {
      console.error('Error getting expenses by date:', error)
      return []
    }

    return data.map(dbExpenseToExpense)
  } catch (error) {
    console.error('Error getting expenses by date:', error)
    return []
  }
}

// STATISTICS FUNCTIONS
export const getDailyStats = async (userEmail?: string): Promise<DailyStats[]> => {
  const prestations = await loadPrestations(userEmail)
  const statsMap: { [date: string]: DailyStats } = {}

  prestations.forEach(prestation => {
    const date = prestation.date
    
    if (!statsMap[date]) {
      statsMap[date] = {
        date,
        totalRevenue: 0,
        prestationCount: 0,
        prestations: [],
        totalCash: 0,
        totalCard: 0,
        cashPayments: 0,
        cardPayments: 0,
        mixedPayments: 0
      }
    }
    
    statsMap[date].totalRevenue += getPrestationTotal(prestation)
    statsMap[date].prestationCount += 1
    statsMap[date].prestations.push(prestation)
    statsMap[date].totalCash += prestation.cashAmount
    statsMap[date].totalCard += prestation.cardAmount
    
    // Count payment methods
    if (prestation.paymentMethod === 'cash') {
      statsMap[date].cashPayments += 1
    } else if (prestation.paymentMethod === 'card') {
      statsMap[date].cardPayments += 1
    } else if (prestation.paymentMethod === 'mixed') {
      statsMap[date].mixedPayments += 1
    }
  })

  return Object.values(statsMap).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

export const getDailyExpenseStats = async (userEmail?: string): Promise<DailyExpenseStats[]> => {
  const expenses = await loadExpenses(userEmail)
  const statsMap: { [date: string]: DailyExpenseStats } = {}

  expenses.forEach(expense => {
    const date = expense.date
    
    if (!statsMap[date]) {
      statsMap[date] = {
        date,
        totalExpenses: 0,
        expenseCount: 0,
        expenses: [],
        totalCashExpenses: 0,
        totalCardExpenses: 0,
        cashExpenseCount: 0,
        cardExpenseCount: 0
      }
    }
    
    const expenseTotal = getExpenseTotal(expense)
    statsMap[date].totalExpenses += expenseTotal
    statsMap[date].expenseCount += 1
    statsMap[date].expenses.push(expense)
    statsMap[date].totalCashExpenses += expense.cashAmount
    statsMap[date].totalCardExpenses += expense.cardAmount
    
    // Count payment methods
    if (expense.paymentMethod === 'cash') {
      statsMap[date].cashExpenseCount += 1
    } else if (expense.paymentMethod === 'card') {
      statsMap[date].cardExpenseCount += 1
    }
  })

  return Object.values(statsMap).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

export const getTotalRevenue = async (userEmail?: string): Promise<number> => {
  const prestations = await loadPrestations(userEmail)
  return prestations.reduce((total, prestation) => total + getPrestationTotal(prestation), 0)
}

export const getTotalExpenses = async (userEmail?: string): Promise<number> => {
  const expenses = await loadExpenses(userEmail)
  return expenses.reduce((total, expense) => total + getExpenseTotal(expense), 0)
}

export const getRevenueByMonth = async (userEmail?: string): Promise<{ [month: string]: number }> => {
  const prestations = await loadPrestations(userEmail)
  const monthlyRevenue: { [month: string]: number } = {}

  prestations.forEach(prestation => {
    const date = parseISO(prestation.date)
    const monthKey = format(date, 'yyyy-MM')
    
    if (!monthlyRevenue[monthKey]) {
      monthlyRevenue[monthKey] = 0
    }
    
    monthlyRevenue[monthKey] += getPrestationTotal(prestation)
  })

  return monthlyRevenue
}

export const getExpensesByMonth = async (userEmail?: string): Promise<{ [month: string]: number }> => {
  const expenses = await loadExpenses(userEmail)
  const monthlyExpenses: { [month: string]: number } = {}

  expenses.forEach(expense => {
    const date = parseISO(expense.date)
    const monthKey = format(date, 'yyyy-MM')
    
    if (!monthlyExpenses[monthKey]) {
      monthlyExpenses[monthKey] = 0
    }
    
    monthlyExpenses[monthKey] += getExpenseTotal(expense)
  })

  return monthlyExpenses
}

// Payment method analytics
export const getPaymentMethodStats = async (userEmail?: string): Promise<{ [method: string]: { count: number, totalAmount: number, totalCash: number, totalCard: number } }> => {
  const prestations = await loadPrestations(userEmail)
  const stats: { [method: string]: { count: number, totalAmount: number, totalCash: number, totalCard: number } } = {
    cash: { count: 0, totalAmount: 0, totalCash: 0, totalCard: 0 },
    card: { count: 0, totalAmount: 0, totalCash: 0, totalCard: 0 },
    mixed: { count: 0, totalAmount: 0, totalCash: 0, totalCard: 0 }
  }

  prestations.forEach(prestation => {
    const method = prestation.paymentMethod
    stats[method].count += 1
    stats[method].totalAmount += getPrestationTotal(prestation)
    stats[method].totalCash += prestation.cashAmount
    stats[method].totalCard += prestation.cardAmount
  })

  return stats
}

export const getTotalCashRevenue = async (userEmail?: string): Promise<number> => {
  const prestations = await loadPrestations(userEmail)
  return prestations.reduce((total, prestation) => total + prestation.cashAmount, 0)
}

export const getTotalCardRevenue = async (userEmail?: string): Promise<number> => {
  const prestations = await loadPrestations(userEmail)
  return prestations.reduce((total, prestation) => total + prestation.cardAmount, 0)
}

// Combined daily stats for calendar
export interface CombinedDailyStats {
  date: string
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  prestationCount: number
  expenseCount: number
  prestations: Prestation[]
  expenses: Expense[]
  // Payment breakdown
  totalCashRevenue: number
  totalCardRevenue: number
  totalCashExpenses: number
  totalCardExpenses: number
}

export const getCombinedDailyStats = async (userEmail?: string): Promise<CombinedDailyStats[]> => {
  const [prestations, expenses] = await Promise.all([
    loadPrestations(userEmail),
    loadExpenses(userEmail)
  ])

  const statsMap: { [date: string]: CombinedDailyStats } = {}

  // Process prestations
  prestations.forEach(prestation => {
    const date = prestation.date
    
    if (!statsMap[date]) {
      statsMap[date] = {
        date,
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        prestationCount: 0,
        expenseCount: 0,
        prestations: [],
        expenses: [],
        totalCashRevenue: 0,
        totalCardRevenue: 0,
        totalCashExpenses: 0,
        totalCardExpenses: 0
      }
    }
    
    statsMap[date].totalRevenue += getPrestationTotal(prestation)
    statsMap[date].prestationCount += 1
    statsMap[date].prestations.push(prestation)
    statsMap[date].totalCashRevenue += prestation.cashAmount
    statsMap[date].totalCardRevenue += prestation.cardAmount
  })

  // Process expenses
  expenses.forEach(expense => {
    const date = expense.date
    
    if (!statsMap[date]) {
      statsMap[date] = {
        date,
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        prestationCount: 0,
        expenseCount: 0,
        prestations: [],
        expenses: [],
        totalCashRevenue: 0,
        totalCardRevenue: 0,
        totalCashExpenses: 0,
        totalCardExpenses: 0
      }
    }
    
    statsMap[date].totalExpenses += getExpenseTotal(expense)
    statsMap[date].expenseCount += 1
    statsMap[date].expenses.push(expense)
    statsMap[date].totalCashExpenses += expense.cashAmount
    statsMap[date].totalCardExpenses += expense.cardAmount
  })

  // Calculate net profit for each day
  Object.values(statsMap).forEach(stats => {
    stats.netProfit = stats.totalRevenue - stats.totalExpenses
  })

  return Object.values(statsMap).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
} 