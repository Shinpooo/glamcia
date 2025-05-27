import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Euro, 
  Calendar, 
  TrendingUp, 
  Users, 
  Plus,
  Clock,
  Star,
  BarChart3,
  Minus
} from 'lucide-react';
import { getCombinedDailyStats, getTotalRevenue, getRevenueByMonth, getTotalExpenses, getExpensesByMonth } from '../utils/storage';
import { CombinedDailyStats } from '../utils/storage';
import Modal from '../components/Modal';
import PrestationForm from '../components/PrestationForm';
import ExpenseForm from '../components/ExpenseForm';
import TimeChart from '../components/WeeklyChart';

const Dashboard: React.FC = () => {
  const [dailyStats, setDailyStats] = useState<CombinedDailyStats[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState<{ [month: string]: number }>({});
  const [monthlyExpenses, setMonthlyExpenses] = useState<{ [month: string]: number }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isPrestationModalOpen, setIsPrestationModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  useEffect(() => {
    const loadData = () => {
      const stats = getCombinedDailyStats();
      const total = getTotalRevenue();
      const totalExp = getTotalExpenses();
      const monthly = getRevenueByMonth();
      const monthlyExp = getExpensesByMonth();
      
      setDailyStats(stats);
      setTotalRevenue(total);
      setTotalExpenses(totalExp);
      setMonthlyRevenue(monthly);
      setMonthlyExpenses(monthlyExp);
      setIsLoading(false);
    };

    loadData();
  }, []);

  const currentMonth = format(new Date(), 'yyyy-MM');
  const currentMonthRevenue = monthlyRevenue[currentMonth] || 0;
  const currentMonthExpenses = monthlyExpenses[currentMonth] || 0;
  const netProfit = totalRevenue - totalExpenses;
  const currentMonthProfit = currentMonthRevenue - currentMonthExpenses;
  const recentStats = dailyStats.slice(0, 5);

  const handlePrestationSuccess = () => {
    setIsPrestationModalOpen(false);
    // Reload data
    const stats = getCombinedDailyStats();
    const total = getTotalRevenue();
    const totalExp = getTotalExpenses();
    const monthly = getRevenueByMonth();
    const monthlyExp = getExpensesByMonth();
    
    setDailyStats(stats);
    setTotalRevenue(total);
    setTotalExpenses(totalExp);
    setMonthlyRevenue(monthly);
    setMonthlyExpenses(monthlyExp);
  };

  const handleExpenseSuccess = () => {
    setIsExpenseModalOpen(false);
    // Reload data
    const stats = getCombinedDailyStats();
    const total = getTotalRevenue();
    const totalExp = getTotalExpenses();
    const monthly = getRevenueByMonth();
    const monthlyExp = getExpensesByMonth();
    
    setDailyStats(stats);
    setTotalRevenue(total);
    setTotalExpenses(totalExp);
    setMonthlyRevenue(monthly);
    setMonthlyExpenses(monthlyExp);
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
        {/* Revenus Card */}
        <div className="group bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl group-hover:scale-110 transition-transform">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Revenus</p>
              <p className="text-2xl font-bold text-green-700">{totalRevenue}€</p>
            </div>
          </div>

        </div>

        {/* Dépenses Card */}
        <div className="group bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-red-100 to-rose-100 rounded-xl group-hover:scale-110 transition-transform">
              <TrendingUp className="h-6 w-6 text-red-600 rotate-180" />
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-red-600 uppercase tracking-wide">Dépenses</p>
              <p className="text-2xl font-bold text-red-700">{totalExpenses}€</p>
            </div>
          </div>

        </div>

        {/* Bénéfice Net Card */}
        <div className="group bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl group-hover:scale-110 transition-transform ${
              netProfit >= 0 
                ? 'bg-gradient-to-br from-emerald-100 to-green-100' 
                : 'bg-gradient-to-br from-red-100 to-rose-100'
            }`}>
              <Euro className={`h-6 w-6 ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`} />
            </div>
            <div className="text-right">
              <p className={`text-xs font-medium uppercase tracking-wide ${
                netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}>Bénéfice Net</p>
              <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                {netProfit >= 0 ? '+' : ''}{netProfit}€
              </p>
            </div>
          </div>

        </div>

        {/* Ce Mois Card */}
        <div className="group bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl group-hover:scale-110 transition-transform">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Ce Mois</p>
              <p className={`text-2xl font-bold ${currentMonthProfit >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                {currentMonthProfit >= 0 ? '+' : ''}{currentMonthProfit}€
              </p>
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
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Actions Rapides</h2>
          <div className="h-1 w-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full"></div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setIsPrestationModalOpen(true)}
            className="group relative overflow-hidden bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-6 hover:from-pink-100 hover:to-rose-100 transition-all duration-300 hover:scale-105 hover:shadow-lg text-left"
          >
            <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <Plus className="h-8 w-8 text-pink-600" />
            </div>
            <div className="relative">
              <div className="inline-flex p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Prestation</h3>
              <p className="text-sm text-gray-600">Ajouter un service</p>
            </div>
          </button>

          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="group relative overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 hover:from-orange-100 hover:to-amber-100 transition-all duration-300 hover:scale-105 hover:shadow-lg text-left"
          >
            <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <Minus className="h-8 w-8 text-orange-600" />
            </div>
            <div className="relative">
              <div className="inline-flex p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                <Minus className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Dépense</h3>
              <p className="text-sm text-gray-600">Ajouter un coût</p>
            </div>
          </button>

          <Link
            href="/history"
            className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <div className="relative">
              <div className="inline-flex p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Historique</h3>
              <p className="text-sm text-gray-600">Voir tout</p>
            </div>
          </Link>

          <Link
            href="/calendar"
            className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 hover:from-purple-100 hover:to-violet-100 transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
            <div className="relative">
              <div className="inline-flex p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Calendrier</h3>
              <p className="text-sm text-gray-600">Vue mensuelle</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Time Chart */}
      <TimeChart />

      {/* Recent Activity - Mobile optimized */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-3 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Activité Récente</h2>
            <div className="px-2 py-1 bg-gray-100 rounded-full">
              <span className="text-xs font-medium text-gray-600">{recentStats.length}</span>
            </div>
          </div>
          <Link
            href="/history"
            className="inline-flex items-center space-x-1 text-pink-600 hover:text-pink-700 text-xs sm:text-sm font-medium group"
          >
            <span className="hidden sm:inline">Voir tout</span>
            <span className="sm:hidden">Tout</span>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {recentStats.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="inline-flex p-3 sm:p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-3 sm:mb-4">
              <Star className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Commencez votre activité</h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6 max-w-sm mx-auto">
              Ajoutez votre première prestation pour commencer à suivre vos performances
            </p>
            <button
              onClick={() => setIsPrestationModalOpen(true)}
              className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg text-sm sm:text-base"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Ajouter une prestation
            </button>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {recentStats.map((day) => (
              <div
                key={day.date}
                className="group relative overflow-hidden bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-3 sm:p-4 hover:from-pink-50 hover:to-purple-50 transition-all duration-300 hover:shadow-md"
              >
                {/* Mobile Layout */}
                <div className="block sm:hidden">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-bold text-pink-600">
                          {format(parseISO(day.date), 'd')}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {format(parseISO(day.date), 'EEE d MMM', { locale: fr })}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                          {day.prestationCount > 0 && (
                            <span className="flex items-center space-x-1">
                              <Users className="h-3 w-3" />
                              <span>{day.prestationCount}</span>
                            </span>
                          )}
                          {day.expenseCount > 0 && (
                            <span className="flex items-center space-x-1">
                              <Minus className="h-3 w-3" />
                              <span>{day.expenseCount}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {day.totalRevenue > 0 && (
                        <p className="text-sm font-bold text-green-600">
                          +{day.totalRevenue}€
                        </p>
                      )}
                      {day.totalExpenses > 0 && (
                        <p className="text-sm font-bold text-red-600">
                          -{day.totalExpenses}€
                        </p>
                      )}
                    </div>
                  </div>
                  {(day.totalRevenue > 0 || day.totalExpenses > 0) && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        {/* Points verts pour les prestations */}
                        {Array.from({ length: Math.min(day.prestationCount, 3) }).map((_, i) => (
                          <div key={`prestation-${i}`} className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                        ))}
                        {day.prestationCount > 3 && (
                          <span className="text-xs text-green-600">+{day.prestationCount - 3}</span>
                        )}
                        
                        {/* Séparateur si les deux types existent */}
                        {day.prestationCount > 0 && day.expenseCount > 0 && (
                          <div className="w-px h-2 bg-gray-300 mx-1"></div>
                        )}
                        
                        {/* Points rouges pour les dépenses */}
                        {Array.from({ length: Math.min(day.expenseCount, 3) }).map((_, i) => (
                          <div key={`expense-${i}`} className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                        ))}
                        {day.expenseCount > 3 && (
                          <span className="text-xs text-red-600">+{day.expenseCount - 3}</span>
                        )}
                      </div>
                      <p className={`text-xs font-semibold ${day.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        Net: {day.netProfit >= 0 ? '+' : ''}{day.netProfit}€
                      </p>
                    </div>
                  )}
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="text-sm font-bold text-pink-600">
                          {format(parseISO(day.date), 'd')}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-pink-700 transition-colors">
                        {format(parseISO(day.date), 'EEEE d MMMM', { locale: fr })}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{day.prestationCount} prestation{day.prestationCount > 1 ? 's' : ''}</span>
                        </span>
                        {day.expenseCount > 0 && (
                          <span className="flex items-center space-x-1">
                            <Minus className="h-3 w-3" />
                            <span>{day.expenseCount} dépense{day.expenseCount > 1 ? 's' : ''}</span>
                          </span>
                        )}
                        {day.prestationCount > 0 && (
                          <span className="flex items-center space-x-1">
                            <TrendingUp className="h-3 w-3" />
                            <span>Moy. {Math.round(day.totalRevenue / day.prestationCount)}€</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="space-y-1">
                      {day.totalRevenue > 0 && (
                        <p className="text-lg font-bold text-green-600 group-hover:text-green-700 transition-colors">
                          +{day.totalRevenue}€
                        </p>
                      )}
                      {day.totalExpenses > 0 && (
                        <p className="text-lg font-bold text-red-600 group-hover:text-red-700 transition-colors">
                          -{day.totalExpenses}€
                        </p>
                      )}
                      {(day.totalRevenue > 0 || day.totalExpenses > 0) && (
                        <p className={`text-sm font-semibold ${day.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          Net: {day.netProfit >= 0 ? '+' : ''}{day.netProfit}€
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-end space-x-1 mt-2">
                      {/* Points verts pour les prestations */}
                      {Array.from({ length: Math.min(day.prestationCount, 5) }).map((_, i) => (
                        <div key={`prestation-${i}`} className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                      ))}
                      {day.prestationCount > 5 && (
                        <span className="text-xs text-green-600 ml-1">+{day.prestationCount - 5}</span>
                      )}
                      
                      {/* Séparateur si les deux types existent */}
                      {day.prestationCount > 0 && day.expenseCount > 0 && (
                        <div className="w-px h-3 bg-gray-300 mx-1"></div>
                      )}
                      
                      {/* Points rouges pour les dépenses */}
                      {Array.from({ length: Math.min(day.expenseCount, 5) }).map((_, i) => (
                        <div key={`expense-${i}`} className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                      ))}
                      {day.expenseCount > 5 && (
                        <span className="text-xs text-red-600 ml-1">+{day.expenseCount - 5}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Hover effect indicator */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-pink-200 rounded-xl transition-colors pointer-events-none"></div>
              </div>
            ))}
          </div>
        )}
      </div>

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
