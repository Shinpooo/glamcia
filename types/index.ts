export type PaymentMethod = 'cash' | 'card' | 'mixed';

export interface PaymentDetails {
  method: PaymentMethod;
  cashAmount: number;
  cardAmount: number;
}

export interface Prestation {
  id: number;
  serviceCategory: string;
  date: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  cashAmount: number;
  cardAmount: number;
}

// Helper function to get total price
export const getPrestationTotal = (prestation: Prestation): number => {
  return prestation.cashAmount + prestation.cardAmount;
};

export interface Expense {
  id: number;
  categoryId: string;
  categoryName: string;
  amount: number; // Deprecated - keep for backward compatibility
  date: string;
  description?: string;
  paymentMethod: PaymentMethod;
  cashAmount: number;
  cardAmount: number;
}

// Helper function to get total expense amount
export const getExpenseTotal = (expense: Expense): number => {
  return expense.cashAmount + expense.cardAmount;
};

export interface ExpenseCategory {
  id: string;
  name: string;
}

export interface DailyStats {
  date: string;
  totalRevenue: number;
  prestationCount: number;
  prestations: Prestation[];
  totalCash: number;
  totalCard: number;
  cashPayments: number;
  cardPayments: number;
  mixedPayments: number;
}

export interface DailyExpenseStats {
  date: string;
  totalExpenses: number;
  expenseCount: number;
  expenses: Expense[];
  totalCashExpenses: number;
  totalCardExpenses: number;
  cashExpenseCount: number;
  cardExpenseCount: number;
}

export interface PaymentMethodStats {
  method: PaymentMethod;
  transactionCount: number;
  totalAmount: number;
  totalCash: number;
  totalCard: number;
  averageAmount: number;
}

export interface Transaction {
  id: string;
  type: 'revenue' | 'expense';
  amount: number;
  date: string;
  description: string;
  category: string;
  notes?: string;
  paymentMethod?: PaymentMethod;
  cashAmount?: number;
  cardAmount?: number;
} 