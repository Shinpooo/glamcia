import React, { useState, useEffect } from 'react';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  Trash2,
  TrendingUp,
  TrendingDown,
  Edit3
} from 'lucide-react';

import { getCombinedDailyStats, deletePrestation, deleteExpense, CombinedDailyStats, getPrestationById, getExpenseById } from '../utils/storage';
import Modal from '../components/Modal';
import PrestationForm from '../components/PrestationForm';
import ExpenseForm from '../components/ExpenseForm';
import { Prestation, Expense } from '../types';

const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [dailyStats, setDailyStats] = useState<CombinedDailyStats[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPrestation, setEditingPrestation] = useState<Prestation | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  useEffect(() => {
    const loadData = () => {
      const stats = getCombinedDailyStats();
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

  const getDayStats = (date: Date): CombinedDailyStats | undefined => {
    const dateString = format(date, 'yyyy-MM-dd');
    return dailyStats.find(stats => stats.date === dateString);
  };

  const selectedDayStats = selectedDate ? getDayStats(selectedDate) : null;

  const handleDeletePrestation = (prestationId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette prestation ?')) {
      deletePrestation(prestationId);
      // Reload data to refresh the calendar
      const stats = getCombinedDailyStats();
      setDailyStats(stats);
    }
  };

  const handleDeleteExpense = (expenseId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) {
      deleteExpense(expenseId);
      // Reload data to refresh the calendar
      const stats = getCombinedDailyStats();
      setDailyStats(stats);
    }
  };

  const handleEditPrestation = (prestationId: string) => {
    const prestation = getPrestationById(prestationId);
    if (prestation) {
      setEditingPrestation(prestation);
    }
  };

  const handleEditExpense = (expenseId: string) => {
    const expense = getExpenseById(expenseId);
    if (expense) {
      setEditingExpense(expense);
    }
  };

  const handleEditSuccess = () => {
    setEditingPrestation(null);
    setEditingExpense(null);
    // Reload data to refresh the calendar
    const stats = getCombinedDailyStats();
    setDailyStats(stats);
  };

  const handleEditCancel = () => {
    setEditingPrestation(null);
    setEditingExpense(null);
  };

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
        <p className="text-gray-600">Vue d&apos;ensemble de vos revenus et dépenses par jour</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-3 sm:p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handlePreviousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Mois précédent"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
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
                <div key={day} className="p-1 sm:p-2 text-center text-xs sm:text-sm font-medium text-gray-500">
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{day.charAt(0)}</span>
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before month start */}
              {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, index) => (
                <div key={`empty-${index}`} className="p-1 sm:p-2 h-20 sm:h-20 md:h-24"></div>
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
                    className={`p-1 sm:p-2 h-20 sm:h-20 md:h-24 border rounded-lg text-left transition-all hover:shadow-sm overflow-hidden ${
                      isSelected
                        ? 'border-pink-500 bg-pink-50'
                        : isToday
                        ? 'border-blue-300 bg-blue-50'
                        : dayStats
                        ? 'border-green-200 bg-green-50 hover:bg-green-100'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-xs sm:text-sm font-medium text-gray-900 mb-1">
                      {format(date, 'd')}
                    </div>
                    {dayStats && (
                      <div className="flex flex-col h-full justify-between">
                        {/* Mobile: Show optimized compact info */}
                        <div className="sm:hidden flex-1 flex flex-col justify-center space-y-0.5">
                          {/* Si les deux existent, afficher seulement le net avec indicateurs visuels */}
                          {dayStats.totalRevenue > 0 && dayStats.totalExpenses > 0 ? (
                            <div className="space-y-0.5">
                              <div className="flex items-center justify-between">
                                <div className="flex space-x-1">
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                                </div>
                                <div className={`text-[9px] font-bold ${
                                  dayStats.netProfit >= 0 ? 'text-green-700' : 'text-red-700'
                                }`}>
                                  {dayStats.netProfit >= 0 ? '+' : ''}{dayStats.netProfit}€
                                </div>
                              </div>
                              <div className="text-[8px] text-gray-500 text-center leading-tight">
                                {dayStats.prestationCount + dayStats.expenseCount} op.
                              </div>
                            </div>
                          ) : (
                            /* Si seulement revenus ou dépenses */
                            <div className="space-y-0.5">
                              {dayStats.totalRevenue > 0 && (
                                <div className="text-[9px] text-green-600 font-bold leading-tight">
                                  +{dayStats.totalRevenue}€
                                </div>
                              )}
                              {dayStats.totalExpenses > 0 && (
                                <div className="text-[9px] text-red-600 font-bold leading-tight">
                                  -{dayStats.totalExpenses}€
                                </div>
                              )}
                              <div className="text-[8px] text-gray-500 text-center leading-tight">
                                {dayStats.prestationCount + dayStats.expenseCount} op.
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Desktop: Show full info */}
                        <div className="hidden sm:block space-y-1">
                          {dayStats.totalRevenue > 0 && (
                            <div className="text-xs text-green-600 font-medium">
                              +{dayStats.totalRevenue}€
                            </div>
                          )}
                          {dayStats.totalExpenses > 0 && (
                            <div className="text-xs text-red-600 font-medium">
                              -{dayStats.totalExpenses}€
                            </div>
                          )}
                          <div className={`text-xs font-medium ${
                            dayStats.netProfit >= 0 ? 'text-green-700' : 'text-red-700'
                          }`}>
                            Net: {dayStats.netProfit}€
                          </div>
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
                        <span className="text-gray-600">Revenus:</span>
                        <div className="font-semibold text-green-600">
                          +{selectedDayStats.totalRevenue}€
                        </div>
                        <div className="text-xs text-gray-500">
                          {selectedDayStats.prestationCount} prestation{selectedDayStats.prestationCount > 1 ? 's' : ''}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Dépenses:</span>
                        <div className="font-semibold text-red-600">
                          -{selectedDayStats.totalExpenses}€
                        </div>
                        <div className="text-xs text-gray-500">
                          {selectedDayStats.expenseCount} dépense{selectedDayStats.expenseCount > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Bénéfice net:</span>
                        <div className={`font-semibold ${
                          selectedDayStats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {selectedDayStats.netProfit >= 0 ? '+' : ''}{selectedDayStats.netProfit}€
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Prestations List */}
                  {selectedDayStats.prestations.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span>Prestations du jour</span>
                      </h4>
                      {selectedDayStats.prestations.map((prestation) => (
                        <div
                          key={prestation.id}
                          className="p-3 bg-green-50 rounded-lg border border-green-200"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 mb-1">
                                {prestation.serviceName}
                              </div>
                              <div className="flex items-center justify-between text-sm text-gray-600">
                                <span>{prestation.serviceCategory}</span>
                                <span className="font-semibold text-green-600">
                                  +{prestation.price}€
                                </span>
                              </div>
                              {prestation.notes && (
                                <div className="mt-2 text-xs text-gray-500">
                                  {prestation.notes}
                                </div>
                              )}
                            </div>
                            <div className="ml-3 flex space-x-1">
                              <button
                                onClick={() => handleEditPrestation(prestation.id)}
                                className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                                aria-label="Modifier"
                              >
                                <Edit3 className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleDeletePrestation(prestation.id)}
                                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                aria-label="Supprimer"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Expenses List */}
                  {selectedDayStats.expenses.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        <span>Dépenses du jour</span>
                      </h4>
                      {selectedDayStats.expenses.map((expense) => (
                        <div
                          key={expense.id}
                          className="p-3 bg-red-50 rounded-lg border border-red-200"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 mb-1">
                                {expense.categoryName}
                              </div>
                              <div className="flex items-center justify-between text-sm text-gray-600">
                                <span>Dépense</span>
                                <span className="font-semibold text-red-600">
                                  -{expense.amount}€
                                </span>
                              </div>
                              {expense.description && (
                                <div className="mt-2 text-xs text-gray-500">
                                  {expense.description}
                                </div>
                              )}
                            </div>
                            <div className="ml-3 flex space-x-1">
                              <button
                                onClick={() => handleEditExpense(expense.id)}
                                className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                                aria-label="Modifier"
                              >
                                <Edit3 className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteExpense(expense.id)}
                                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                aria-label="Supprimer"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Aucune activité ce jour</p>
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
              const totalExpenses = monthlyStats.reduce((sum, stats) => sum + stats.totalExpenses, 0);
              const totalPrestations = monthlyStats.reduce((sum, stats) => sum + stats.prestationCount, 0);
              const totalExpenseCount = monthlyStats.reduce((sum, stats) => sum + stats.expenseCount, 0);
              const netProfit = totalRevenue - totalExpenses;
              const activeDays = monthlyStats.length;
              
              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Jours actifs:</span>
                    <span className="font-semibold text-gray-900">{activeDays}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Prestations:</span>
                    <span className="font-semibold text-gray-900">{totalPrestations}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Dépenses:</span>
                    <span className="font-semibold text-gray-900">{totalExpenseCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Revenus totaux:</span>
                    <span className="font-semibold text-green-600">+{totalRevenue}€</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Dépenses totales:</span>
                    <span className="font-semibold text-red-600">-{totalExpenses}€</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                    <span className="text-gray-600 font-medium">Bénéfice net:</span>
                    <span className={`font-semibold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {netProfit >= 0 ? '+' : ''}{netProfit}€
                    </span>
                  </div>
                  {activeDays > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Moyenne/jour:</span>
                      <span className={`font-semibold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {netProfit >= 0 ? '+' : ''}{Math.round(netProfit / activeDays)}€
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Edit Modals */}
      {editingPrestation && (
        <Modal
          isOpen={true}
          onClose={handleEditCancel}
          title="Modifier la Prestation"
          size="lg"
        >
          <PrestationForm
            prestation={editingPrestation}
            onSuccess={handleEditSuccess}
            onCancel={handleEditCancel}
          />
        </Modal>
      )}

      {editingExpense && (
        <Modal
          isOpen={true}
          onClose={handleEditCancel}
          title="Modifier la Dépense"
          size="lg"
        >
          <ExpenseForm
            expense={editingExpense}
            onSuccess={handleEditSuccess}
            onCancel={handleEditCancel}
          />
        </Modal>
      )}
    </div>
  );
};

export default CalendarPage; 