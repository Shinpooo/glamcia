export interface Service {
  id: string;
  category: string;
  name: string;
  basePrice: number;
}

export interface Prestation {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  basePrice: number;
  supplement: number;
  finalPrice: number;
  date: string;
  notes?: string;
}

export interface DailyStats {
  date: string;
  totalRevenue: number;
  prestationCount: number;
  prestations: Prestation[];
} 