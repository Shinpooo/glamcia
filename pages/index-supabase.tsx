import React, { useState, useEffect } from 'react';
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Euro, 
  TrendingUp, 
  BarChart3,
  Award,
  Activity,
  TrendingDown
} from 'lucide-react';
import { getCombinedDailyStats, getRevenueByMonth, getExpensesByMonth, loadPrestations } from '../utils/supabase-storage';
import { CombinedDailyStats } from '../utils/supabase-storage';
import Modal from '../components/Modal';
import PrestationForm from '../components/PrestationForm';
import ExpenseForm from '../components/ExpenseForm';
import { getPrestationTotal } from '../types';

const Dashboard: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [dailyStats, setDailyStats] = useState<CombinedDailyStats[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<{ [month: string]: number }>({});
  const [monthlyExpenses, setMonthlyExpenses] = useState<{ [month: string]: number }>({});
  const [weeklyPrestations, setWeeklyPrestations] = useState<number>(0);
  const [currentMonthPrestations, setCurrentMonthPrestations] = useState<number>(0);
  const [lastMonthPrestations, setLastMonthPrestations] = useState<number>(0);
  const [topServiceThisMonth, setTopServiceThisMonth] = useState<{ name: string; revenue: number; count: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPrestationModalOpen, setIsPrestationModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [stats, monthly, monthlyExp, prestations] = await Promise.all([
          getCombinedDailyStats(''),
          getRevenueByMonth(''),
          getExpensesByMonth(''),
          loadPrestations('')
        ]);
        
        // Calculate new metrics
        const now = new Date();
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);
        const lastMonthStart = startOfMonth(subMonths(now, 1));
        const lastMonthEnd = endOfMonth(subMonths(now, 1));
        
        // Prestations this week
        const thisWeekPrestations = prestations.filter(p => {
          const prestationDate = parseISO(p.date);
          return isWithinInterval(prestationDate, { start: weekStart, end: weekEnd });
        }).length;
        
        // Prestations this month vs last month
        const thisMonthPrestations = prestations.filter(p => {
          const prestationDate = parseISO(p.date);
          return isWithinInterval(prestationDate, { start: monthStart, end: monthEnd });
        });
        
        const lastMonthPrestationsData = prestations.filter(p => {
          const prestationDate = parseISO(p.date);
          return isWithinInterval(prestationDate, { start: lastMonthStart, end: lastMonthEnd });
        });
        
        // Top service this month
        const serviceRevenue: { [key: string]: { revenue: number; count: number } } = {};
        thisMonthPrestations.forEach(p => {
          if (!serviceRevenue[p.serviceName]) {
            serviceRevenue[p.serviceName] = { revenue: 0, count: 0 };
          }
          serviceRevenue[p.serviceName].revenue += getPrestationTotal(p);
          serviceRevenue[p.serviceName].count += 1;
        });
        
        const topService = Object.entries(serviceRevenue).reduce((top, [name, data]) => {
          if (!top || data.revenue > top.revenue) {
            return { name, revenue: data.revenue, count: data.count };
          }
          return top;
        }, null as { name: string; revenue: number; count: number } | null);
        
        setDailyStats(stats);
        setMonthlyRevenue(monthly);
        setMonthlyExpenses(monthlyExp);
        setWeeklyPrestations(thisWeekPrestations);
        setCurrentMonthPrestations(thisMonthPrestations.length);
        setLastMonthPrestations(lastMonthPrestationsData.length);
        setTopServiceThisMonth(topService);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const currentMonth = format(new Date(), 'yyyy-MM');
  const currentMonthRevenue = monthlyRevenue[currentMonth] || 0;
  const currentMonthExpenses = monthlyExpenses[currentMonth] || 0;
  const currentMonthProfit = currentMonthRevenue - currentMonthExpenses;

  const handlePrestationSuccess = async () => {
    setIsPrestationModalOpen(false);
    // Reload data
    try {
      const [stats, monthly, monthlyExp, prestations] = await Promise.all([
        getCombinedDailyStats(''),
        getRevenueByMonth(''),
        getExpensesByMonth(''),
        loadPrestations('')
      ]);
      
      // Recalculate new metrics
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      const lastMonthStart = startOfMonth(subMonths(now, 1));
      const lastMonthEnd = endOfMonth(subMonths(now, 1));
      
      const thisWeekPrestations = prestations.filter(p => {
        const prestationDate = parseISO(p.date);
        return isWithinInterval(prestationDate, { start: weekStart, end: weekEnd });
      }).length;
      
      const thisMonthPrestations = prestations.filter(p => {
        const prestationDate = parseISO(p.date);
        return isWithinInterval(prestationDate, { start: monthStart, end: monthEnd });
      });
      
      const lastMonthPrestationsData = prestations.filter(p => {
        const prestationDate = parseISO(p.date);
        return isWithinInterval(prestationDate, { start: lastMonthStart, end: lastMonthEnd });
      });
      
      const serviceRevenue: { [key: string]: { revenue: number; count: number } } = {};
      thisMonthPrestations.forEach(p => {
        if (!serviceRevenue[p.serviceName]) {
          serviceRevenue[p.serviceName] = { revenue: 0, count: 0 };
        }
        serviceRevenue[p.serviceName].revenue += getPrestationTotal(p);
        serviceRevenue[p.serviceName].count += 1;
      });
      
      const topService = Object.entries(serviceRevenue).reduce((top, [name, data]) => {
        if (!top || data.revenue > top.revenue) {
          return { name, revenue: data.revenue, count: data.count };
        }
        return top;
      }, null as { name: string; revenue: number; count: number } | null);
      
      setDailyStats(stats);
      setMonthlyRevenue(monthly);
      setMonthlyExpenses(monthlyExp);
      setWeeklyPrestations(thisWeekPrestations);
      setCurrentMonthPrestations(thisMonthPrestations.length);
      setLastMonthPrestations(lastMonthPrestationsData.length);
      setTopServiceThisMonth(topService);
    } catch (error) {
      console.error('Error reloading data after prestation success:', error);
    }
  };

  const handleExpenseSuccess = async () => {
    setIsExpenseModalOpen(false);
    // Reload data (same logic as handlePrestationSuccess)
    try {
      const [stats, monthly, monthlyExp, prestations] = await Promise.all([
        getCombinedDailyStats(''),
        getRevenueByMonth(''),
        getExpensesByMonth(''),
        loadPrestations('')
      ]);
      
      // Recalculate metrics (same logic as above)
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      const lastMonthStart = startOfMonth(subMonths(now, 1));
      const lastMonthEnd = endOfMonth(subMonths(now, 1));
      
      const thisWeekPrestations = prestations.filter(p => {
        const prestationDate = parseISO(p.date);
        return isWithinInterval(prestationDate, { start: weekStart, end: weekEnd });
      }).length;
      
      const thisMonthPrestations = prestations.filter(p => {
        const prestationDate = parseISO(p.date);
        return isWithinInterval(prestationDate, { start: monthStart, end: monthEnd });
      });
      
      const lastMonthPrestationsData = prestations.filter(p => {
        const prestationDate = parseISO(p.date);
        return isWithinInterval(prestationDate, { start: lastMonthStart, end: lastMonthEnd });
      });
      
      const serviceRevenue: { [key: string]: { revenue: number; count: number } } = {};
      thisMonthPrestations.forEach(p => {
        if (!serviceRevenue[p.serviceName]) {
          serviceRevenue[p.serviceName] = { revenue: 0, count: 0 };
        }
        serviceRevenue[p.serviceName].revenue += getPrestationTotal(p);
        serviceRevenue[p.serviceName].count += 1;
      });
      
      const topService = Object.entries(serviceRevenue).reduce((top, [name, data]) => {
        if (!top || data.revenue > top.revenue) {
          return { name, revenue: data.revenue, count: data.count };
        }
        return top;
      }, null as { name: string; revenue: number; count: number } | null);
      
      setDailyStats(stats);
      setMonthlyRevenue(monthly);
      setMonthlyExpenses(monthlyExp);
      setWeeklyPrestations(thisWeekPrestations);
      setCurrentMonthPrestations(thisMonthPrestations.length);
      setLastMonthPrestations(lastMonthPrestationsData.length);
      setTopServiceThisMonth(topService);
    } catch (error) {
      console.error('Error reloading data after expense success:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full mb-4">
          <BarChart3 className="h-5 w-5 text-pink-600" />
          <span className="text-sm font-medium text-pink-700">Tableau de bord</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bienvenue sur Glamcia
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Suivez vos performances, gérez vos prestations et optimisez la rentabilité de votre salon d&apos;esthétique
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Prestations cette semaine */}
        <div className="group bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-100 to-violet-100 rounded-xl group-hover:scale-110 transition-transform">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">Cette Semaine</p>
              <p className="text-2xl font-bold text-purple-700">{weeklyPrestations}</p>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            <span>Prestations réalisées</span>
          </div>
        </div>

        {/* Évolution du nombre de prestations */}
        <div className="group bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl group-hover:scale-110 transition-transform">
              {currentMonthPrestations >= lastMonthPrestations ? (
                <TrendingUp className="h-6 w-6 text-blue-600" />
              ) : (
                <TrendingDown className="h-6 w-6 text-blue-600" />
              )}
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Activité Mensuelle</p>
              <p className="text-2xl font-bold text-blue-700">{currentMonthPrestations}</p>
            </div>
          </div>
          <div className="text-xs text-gray-500 space-y-1">
            <div className="text-center mb-2">
              <span className="font-medium text-gray-700">Évolution des prestations</span>
            </div>
            <div className="flex justify-between">
              <span>{format(new Date(), 'MMMM', { locale: fr })}:</span>
              <span className="font-medium">{currentMonthPrestations} prestations</span>
            </div>
            <div className="flex justify-between">
              <span>{format(subMonths(new Date(), 1), 'MMMM', { locale: fr })}:</span>
              <span className="font-medium">{lastMonthPrestations} prestations</span>
            </div>
            {lastMonthPrestations > 0 ? (
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="font-medium">Tendance:</span>
                <div className="flex items-center space-x-1">
                  {currentMonthPrestations >= lastMonthPrestations ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span className={`font-bold ${
                    currentMonthPrestations >= lastMonthPrestations ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {currentMonthPrestations >= lastMonthPrestations ? '+' : ''}
                    {((currentMonthPrestations - lastMonthPrestations) / lastMonthPrestations * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ) : (
              <div className="pt-2 border-t border-gray-200 text-center">
                <span className="text-gray-400 italic">Premier mois d&apos;activité</span>
              </div>
            )}
          </div>
        </div>

        {/* Activité la plus rentable ce mois */}
        <div className="group bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl group-hover:scale-110 transition-transform">
              <Award className="h-6 w-6 text-amber-600" />
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-amber-600 uppercase tracking-wide">Top Service</p>
              <p className="text-2xl font-bold text-amber-700">
                {topServiceThisMonth ? `${topServiceThisMonth.revenue}€` : '0€'}
              </p>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {topServiceThisMonth ? (
              <div className="space-y-1">
                <div className="font-medium text-gray-700 truncate">
                  {topServiceThisMonth.name}
                </div>
                <div className="flex justify-between">
                  <span>Prestations:</span>
                  <span className="font-medium">{topServiceThisMonth.count}</span>
                </div>
                <div className="flex justify-between">
                  <span>Moyenne:</span>
                  <span className="font-medium">{Math.round(topServiceThisMonth.revenue / topServiceThisMonth.count)}€</span>
                </div>
              </div>
            ) : (
              <span>Aucune prestation ce mois</span>
            )}
          </div>
        </div>

        {/* Revenus du mois actuel */}
        <div className="group bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl group-hover:scale-110 transition-transform">
              <Euro className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Ce Mois</p>
              <p className="text-2xl font-bold text-green-700">+{currentMonthRevenue}€</p>
            </div>
          </div>
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>Revenus:</span>
              <span className="text-green-600 font-medium">+{currentMonthRevenue}€</span>
            </div>
            <div className="flex justify-between">
              <span>Dépenses:</span>
              <span className="text-red-600 font-medium">-{currentMonthExpenses}€</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-gray-200">
              <span>Net:</span>
              <span className={`font-medium ${currentMonthProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {currentMonthProfit >= 0 ? '+' : ''}{currentMonthProfit}€
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Rest of the component remains the same... */}
      {/* Quick Actions, Time Chart, Recent Activity, Modals */}
      
      {/* Modals */}
      <Modal
        isOpen={isPrestationModalOpen}
        onClose={() => setIsPrestationModalOpen(false)}
        title="Nouvelle Prestation"
        size="lg"
      >
        <PrestationForm
          onSuccess={handlePrestationSuccess}
          onCancel={() => setIsPrestationModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="Nouvelle Dépense"
        size="lg"
      >
        <ExpenseForm
          onSuccess={handleExpenseSuccess}
          onCancel={() => setIsExpenseModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default Dashboard; 