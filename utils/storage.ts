import { Prestation, DailyStats, Expense, DailyExpenseStats } from '../types';
import { format, parseISO, isSameDay } from 'date-fns';

const PRESTATIONS_KEY = 'glamcia_prestations';
const EXPENSES_KEY = 'glamcia_expenses';

export const savePrestations = (prestations: Prestation[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PRESTATIONS_KEY, JSON.stringify(prestations));
  }
};

export const loadPrestations = (): Prestation[] => {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(PRESTATIONS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const addPrestation = (prestation: Prestation): void => {
  const prestations = loadPrestations();
  prestations.push(prestation);
  savePrestations(prestations);
};

export const updatePrestation = (id: string, updatedPrestation: Prestation): void => {
  const prestations = loadPrestations();
  const index = prestations.findIndex(p => p.id === id);
  if (index !== -1) {
    prestations[index] = updatedPrestation;
    savePrestations(prestations);
  }
};

export const deletePrestation = (id: string): void => {
  const prestations = loadPrestations();
  const filtered = prestations.filter(p => p.id !== id);
  savePrestations(filtered);
};

export const getPrestationById = (id: string): Prestation | undefined => {
  const prestations = loadPrestations();
  return prestations.find(p => p.id === id);
};

export const getPrestationsByDate = (date: string): Prestation[] => {
  const prestations = loadPrestations();
  return prestations.filter(p => p.date === date);
};

export const getDailyStats = (): DailyStats[] => {
  const prestations = loadPrestations();
  const statsMap: { [date: string]: DailyStats } = {};

  prestations.forEach(prestation => {
    const date = prestation.date;
    
    if (!statsMap[date]) {
      statsMap[date] = {
        date,
        totalRevenue: 0,
        prestationCount: 0,
        prestations: []
      };
    }
    
    statsMap[date].totalRevenue += prestation.price;
    statsMap[date].prestationCount += 1;
    statsMap[date].prestations.push(prestation);
  });

  return Object.values(statsMap).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

export const getTotalRevenue = (): number => {
  const prestations = loadPrestations();
  return prestations.reduce((total, prestation) => total + prestation.price, 0);
};

export const getRevenueByMonth = (): { [month: string]: number } => {
  const prestations = loadPrestations();
  const monthlyRevenue: { [month: string]: number } = {};

  prestations.forEach(prestation => {
    const date = parseISO(prestation.date);
    const monthKey = format(date, 'yyyy-MM');
    
    if (!monthlyRevenue[monthKey]) {
      monthlyRevenue[monthKey] = 0;
    }
    
    monthlyRevenue[monthKey] += prestation.price;
  });

  return monthlyRevenue;
};

// Expense functions
export const saveExpenses = (expenses: Expense[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  }
};

export const loadExpenses = (): Expense[] => {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(EXPENSES_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const addExpense = (expense: Expense): void => {
  const expenses = loadExpenses();
  expenses.push(expense);
  saveExpenses(expenses);
};

export const updateExpense = (id: string, updatedExpense: Expense): void => {
  const expenses = loadExpenses();
  const index = expenses.findIndex(e => e.id === id);
  if (index !== -1) {
    expenses[index] = updatedExpense;
    saveExpenses(expenses);
  }
};

export const deleteExpense = (id: string): void => {
  const expenses = loadExpenses();
  const filtered = expenses.filter(e => e.id !== id);
  saveExpenses(filtered);
};

export const getExpenseById = (id: string): Expense | undefined => {
  const expenses = loadExpenses();
  return expenses.find(e => e.id === id);
};

export const getExpensesByDate = (date: string): Expense[] => {
  const expenses = loadExpenses();
  return expenses.filter(e => e.date === date);
};

export const getDailyExpenseStats = (): DailyExpenseStats[] => {
  const expenses = loadExpenses();
  const statsMap: { [date: string]: DailyExpenseStats } = {};

  expenses.forEach(expense => {
    const date = expense.date;
    
    if (!statsMap[date]) {
      statsMap[date] = {
        date,
        totalExpenses: 0,
        expenseCount: 0,
        expenses: []
      };
    }
    
    statsMap[date].totalExpenses += expense.amount;
    statsMap[date].expenseCount += 1;
    statsMap[date].expenses.push(expense);
  });

  return Object.values(statsMap).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

export const getTotalExpenses = (): number => {
  const expenses = loadExpenses();
  return expenses.reduce((total, expense) => total + expense.amount, 0);
};

export const getExpensesByMonth = (): { [month: string]: number } => {
  const expenses = loadExpenses();
  const monthlyExpenses: { [month: string]: number } = {};

  expenses.forEach(expense => {
    const date = parseISO(expense.date);
    const monthKey = format(date, 'yyyy-MM');
    
    if (!monthlyExpenses[monthKey]) {
      monthlyExpenses[monthKey] = 0;
    }
    
    monthlyExpenses[monthKey] += expense.amount;
  });

  return monthlyExpenses;
};

// Combined daily stats for calendar
export interface CombinedDailyStats {
  date: string;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  prestationCount: number;
  expenseCount: number;
  prestations: Prestation[];
  expenses: Expense[];
}

export const getCombinedDailyStats = (): CombinedDailyStats[] => {
  const prestations = loadPrestations();
  const expenses = loadExpenses();
  const statsMap: { [date: string]: CombinedDailyStats } = {};

  // Process prestations
  prestations.forEach(prestation => {
    const date = prestation.date;
    
    if (!statsMap[date]) {
      statsMap[date] = {
        date,
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        prestationCount: 0,
        expenseCount: 0,
        prestations: [],
        expenses: []
      };
    }
    
    statsMap[date].totalRevenue += prestation.price;
    statsMap[date].prestationCount += 1;
    statsMap[date].prestations.push(prestation);
  });

  // Process expenses
  expenses.forEach(expense => {
    const date = expense.date;
    
    if (!statsMap[date]) {
      statsMap[date] = {
        date,
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        prestationCount: 0,
        expenseCount: 0,
        prestations: [],
        expenses: []
      };
    }
    
    statsMap[date].totalExpenses += expense.amount;
    statsMap[date].expenseCount += 1;
    statsMap[date].expenses.push(expense);
  });

  // Calculate net profit for each day
  Object.values(statsMap).forEach(stats => {
    stats.netProfit = stats.totalRevenue - stats.totalExpenses;
  });

  return Object.values(statsMap).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}; 