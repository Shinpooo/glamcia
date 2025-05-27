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
  Star
} from 'lucide-react';
import { getDailyStats, getTotalRevenue, getRevenueByMonth } from '../utils/storage';
import { DailyStats } from '../types';

const Dashboard: React.FC = () => {
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState<{ [month: string]: number }>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      const stats = getDailyStats();
      const total = getTotalRevenue();
      const monthly = getRevenueByMonth();
      
      setDailyStats(stats);
      setTotalRevenue(total);
      setMonthlyRevenue(monthly);
      setIsLoading(false);
    };

    loadData();
  }, []);

  const currentMonth = format(new Date(), 'yyyy-MM');
  const currentMonthRevenue = monthlyRevenue[currentMonth] || 0;
  const recentStats = dailyStats.slice(0, 5);
  const totalPrestations = dailyStats.reduce((sum, day) => sum + day.prestationCount, 0);

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Tableau de Bord
        </h1>
        <p className="text-gray-600">
          Aperçu de votre activité de make-up artist
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenus Total</p>
              <p className="text-2xl font-bold text-gray-900">{totalRevenue}€</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Euro className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ce Mois</p>
              <p className="text-2xl font-bold text-gray-900">{currentMonthRevenue}€</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Prestations</p>
              <p className="text-2xl font-bold text-gray-900">{totalPrestations}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Jours Actifs</p>
              <p className="text-2xl font-bold text-gray-900">{dailyStats.length}</p>
            </div>
            <div className="bg-pink-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-pink-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/add-prestation"
            className="flex items-center space-x-3 p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors group"
          >
            <div className="bg-pink-500 p-2 rounded-full group-hover:bg-pink-600 transition-colors">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Nouvelle Prestation</p>
              <p className="text-sm text-gray-600">Ajouter une prestation</p>
            </div>
          </Link>

          <Link
            href="/prestations"
            className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
          >
            <div className="bg-blue-500 p-2 rounded-full group-hover:bg-blue-600 transition-colors">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Historique</p>
              <p className="text-sm text-gray-600">Voir toutes les prestations</p>
            </div>
          </Link>

          <Link
            href="/calendar"
            className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group"
          >
            <div className="bg-purple-500 p-2 rounded-full group-hover:bg-purple-600 transition-colors">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Calendrier</p>
              <p className="text-sm text-gray-600">Vue par jour</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Activité Récente</h2>
          <Link
            href="/prestations"
            className="text-pink-600 hover:text-pink-700 text-sm font-medium"
          >
            Voir tout
          </Link>
        </div>

        {recentStats.length === 0 ? (
          <div className="text-center py-8">
            <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Aucune prestation enregistrée</p>
            <Link
              href="/add-prestation"
              className="inline-flex items-center px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter votre première prestation
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentStats.map((day) => (
              <div
                key={day.date}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {format(parseISO(day.date), 'EEEE d MMMM yyyy', { locale: fr })}
                  </p>
                  <p className="text-sm text-gray-600">
                    {day.prestationCount} prestation{day.prestationCount > 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{day.totalRevenue}€</p>
                  <p className="text-sm text-gray-600">
                    Moy. {Math.round(day.totalRevenue / day.prestationCount)}€
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
