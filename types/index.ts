export interface Service {
  id: string;
  category: string;
  name: string;
}

export interface Prestation {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  price: number;
  date: string;
  notes?: string;
}

export interface Expense {
  id: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  date: string;
  description?: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
}

export interface DailyStats {
  date: string;
  totalRevenue: number;
  prestationCount: number;
  prestations: Prestation[];
}

export interface DailyExpenseStats {
  date: string;
  totalExpenses: number;
  expenseCount: number;
  expenses: Expense[];
}

export interface Transaction {
  id: string;
  type: 'revenue' | 'expense';
  amount: number;
  date: string;
  description: string;
  category: string;
  notes?: string;
} 