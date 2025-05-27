import React, { useState, useEffect } from 'react';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Plus,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { getDailyStats } from '../utils/storage';
import { DailyStats } from '../types';

const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      const stats = getDailyStats();
      setDailyStats(stats);
      setIsLoading(false);
    };

    loadData();
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
    setSelectedDate(null);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(selectedDate && isSameDay(selectedDate, date) ? null : date);
  };

  const getDayStats = (date: Date): DailyStats | undefined => {
    const dateString = format(date, 'yyyy-MM-dd');
    return dailyStats.find(stats => stats.date === dateString);
  };

  const selectedDayStats = selectedDate ? getDayStats(selectedDate) : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendrier</h1>
        <p className="text-gray-600">Vue d&apos;ensemble de vos prestations par jour</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handlePreviousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Mois précédent"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              
              <h2 className="text-xl font-semibold text-gray-900">
                {format(currentDate, 'MMMM yyyy', { locale: fr })}
              </h2>
              
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Mois suivant"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before month start */}
              {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, index) => (
                <div key={`empty-${index}`} className="p-2 h-20"></div>
              ))}
              
              {/* Days of the month */}
              {daysInMonth.map((date) => {
                const dayStats = getDayStats(date);
                const isSelected = selectedDate && isSameDay(selectedDate, date);
                const isToday = isSameDay(date, new Date());
                
                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => handleDateClick(date)}
                    className={`p-2 h-20 border rounded-lg text-left transition-all hover:shadow-sm ${
                      isSelected
                        ? 'border-pink-500 bg-pink-50'
                        : isToday
                        ? 'border-blue-300 bg-blue-50'
                        : dayStats
                        ? 'border-green-200 bg-green-50 hover:bg-green-100'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {format(date, 'd')}
                    </div>
                    {dayStats && (
                      <div className="space-y-1">
                        <div className="text-xs text-green-700 font-medium">
                          {dayStats.prestationCount} prestation{dayStats.prestationCount > 1 ? 's' : ''}
                        </div>
                        <div className="text-xs text-green-600">
                          {dayStats.totalRevenue}€
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Day Details */}
        <div className="space-y-6">
          {/* Quick Add */}
          <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Action Rapide</h3>
            <Link
              href="/add-prestation"
              className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Nouvelle Prestation</span>
            </Link>
          </div>

          {/* Selected Day Details */}
          {selectedDate ? (
            <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <CalendarIcon className="h-5 w-5 text-pink-500" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
                </h3>
              </div>

              {selectedDayStats ? (
                <div className="space-y-4">
                  {/* Day Summary */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Prestations:</span>
                        <div className="font-semibold text-gray-900">
                          {selectedDayStats.prestationCount}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Revenus:</span>
                        <div className="font-semibold text-pink-600">
                          {selectedDayStats.totalRevenue}€
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Prestations List */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Prestations du jour</h4>
                    {selectedDayStats.prestations.map((prestation) => (
                      <div
                        key={prestation.id}
                        className="p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="font-medium text-gray-900 mb-1">
                          {prestation.serviceName}
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>{prestation.serviceCategory}</span>
                          <span className="font-semibold text-pink-600">
                            {prestation.finalPrice}€
                          </span>
                        </div>
                        {prestation.notes && (
                          <div className="mt-2 text-xs text-gray-500">
                            {prestation.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">Aucune prestation ce jour</p>
                  <Link
                    href={`/add-prestation?date=${format(selectedDate, 'yyyy-MM-dd')}`}
                    className="inline-flex items-center space-x-2 px-3 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Ajouter une prestation</span>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
              <div className="text-center py-8">
                <CalendarIcon className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  Cliquez sur une date pour voir les détails
                </p>
              </div>
            </div>
          )}

          {/* Monthly Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Résumé de {format(currentDate, 'MMMM yyyy', { locale: fr })}
            </h3>
            
            {(() => {
              const monthlyStats = dailyStats.filter(stats => {
                const statsDate = parseISO(stats.date);
                return statsDate.getMonth() === currentDate.getMonth() && 
                       statsDate.getFullYear() === currentDate.getFullYear();
              });
              
              const totalRevenue = monthlyStats.reduce((sum, stats) => sum + stats.totalRevenue, 0);
              const totalPrestations = monthlyStats.reduce((sum, stats) => sum + stats.prestationCount, 0);
              const activeDays = monthlyStats.length;
              
              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Jours actifs:</span>
                    <span className="font-semibold text-gray-900">{activeDays}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total prestations:</span>
                    <span className="font-semibold text-gray-900">{totalPrestations}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Revenus totaux:</span>
                    <span className="font-semibold text-pink-600">{totalRevenue}€</span>
                  </div>
                  {activeDays > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Moyenne/jour:</span>
                      <span className="font-semibold text-gray-900">
                        {Math.round(totalRevenue / activeDays)}€
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage; 