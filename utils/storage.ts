import { Prestation, DailyStats } from '../types';
import { format, parseISO, isSameDay } from 'date-fns';

const PRESTATIONS_KEY = 'glamcia_prestations';

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

export const deletePrestation = (id: string): void => {
  const prestations = loadPrestations();
  const filtered = prestations.filter(p => p.id !== id);
  savePrestations(filtered);
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
    
    statsMap[date].totalRevenue += prestation.finalPrice;
    statsMap[date].prestationCount += 1;
    statsMap[date].prestations.push(prestation);
  });

  return Object.values(statsMap).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

export const getTotalRevenue = (): number => {
  const prestations = loadPrestations();
  return prestations.reduce((total, prestation) => total + prestation.finalPrice, 0);
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
    
    monthlyRevenue[monthKey] += prestation.finalPrice;
  });

  return monthlyRevenue;
}; 