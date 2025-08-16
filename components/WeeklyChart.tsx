import React, { useMemo, useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  BarController,
  LineController,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { 
  format, 
  endOfWeek, 
  endOfMonth,
  endOfYear,
  eachWeekOfInterval, 
  eachDayOfInterval,
  eachMonthOfInterval,
  eachYearOfInterval,
  parseISO, 
  isWithinInterval,
  subDays,
  subWeeks,
  subMonths,
  subYears,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  isFuture
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { loadPrestations, loadExpenses } from '../utils/supabase-storage';
import { TrendingUp, TrendingDown, Calendar, Clock, BarChart3, ChevronLeft, ChevronRight, RotateCcw, CalendarDays, CreditCard, Banknote, DollarSign } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { getPrestationTotal } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  BarController,
  LineController
);

type TimeUnit = 'day' | 'week' | 'month' | 'year';
type PaymentFilter = 'total' | 'cash' | 'card';

interface TimeData {
  period: string;
  periodLabel: string;
  prestations: { [category: string]: number };
  prestationsCash: { [category: string]: number };
  prestationsCard: { [category: string]: number };
  expenses: { [category: string]: number };
  expensesCash: { [category: string]: number };
  expensesCard: { [category: string]: number };
  totalRevenue: number;
  totalCashRevenue: number;
  totalCardRevenue: number;
  totalExpenses: number;
  totalCashExpenses: number;
  totalCardExpenses: number;
  netProfit: number;
  netCashProfit: number;
  netCardProfit: number;
}

const TimeChart: React.FC = () => {
  const { data: session } = useSession();
  const [timeUnit, setTimeUnit] = useState<TimeUnit>('week');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('total');
  const [currentPeriod, setCurrentPeriod] = useState<Date>(new Date());
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [timeData, setTimeData] = useState<TimeData[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [chartData, setChartData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Handle window resize for responsive chart
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Set initial value
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load data when timeUnit or currentPeriod changes
  useEffect(() => {
    const loadData = async () => {
      if (!session?.user?.email) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const userEmail = session.user.email;
        const [prestations, expenses] = await Promise.all([
          loadPrestations(userEmail),
          loadExpenses(userEmail)
        ]);
        
        // Calculer la plage de dates selon l'unité de temps et la période courante
        const endDate = new Date(currentPeriod);
        const startDate = new Date(currentPeriod);
        let intervals: Date[] = [];
        
        switch (timeUnit) {
          case 'day':
            // Reduce data points on mobile for better performance
            const dayCount = isMobile ? 7 : 14;
            startDate.setDate(endDate.getDate() - (dayCount - 1));
            intervals = eachDayOfInterval({ start: startDate, end: endDate });
            break;
          case 'week':
            // Reduce data points on mobile for better performance
            const weekCount = isMobile ? 6 : 8;
            startDate.setDate(endDate.getDate() - (weekCount * 7));
            intervals = eachWeekOfInterval(
              { start: startDate, end: endDate },
              { weekStartsOn: 1 }
            );
            break;
          case 'month':
            // Reduce data points on mobile for better performance
            const monthCount = isMobile ? 6 : 12;
            startDate.setMonth(endDate.getMonth() - (monthCount - 1));
            intervals = eachMonthOfInterval({ start: startDate, end: endDate });
            break;
          case 'year':
            // Keep same for years as it's already minimal
            startDate.setFullYear(endDate.getFullYear() - 4); // 5 années
            intervals = eachYearOfInterval({ start: startDate, end: endDate });
            break;
        }
        
        const newTimeData = intervals.map(intervalStart => {
          let intervalEnd: Date;
          let periodLabel: string;
          
          switch (timeUnit) {
            case 'day':
              intervalEnd = intervalStart;
              periodLabel = format(intervalStart, 'd MMM', { locale: fr });
              break;
            case 'week':
              intervalEnd = endOfWeek(intervalStart, { weekStartsOn: 1 });
              periodLabel = `${format(intervalStart, 'd MMM', { locale: fr })}`;
              break;
            case 'month':
              intervalEnd = endOfMonth(intervalStart);
              periodLabel = format(intervalStart, 'MMM yyyy', { locale: fr });
              break;
            case 'year':
              intervalEnd = endOfYear(intervalStart);
              periodLabel = format(intervalStart, 'yyyy', { locale: fr });
              break;
          }
          
          const timeDataItem: TimeData = {
            period: format(intervalStart, 'yyyy-MM-dd'),
            periodLabel,
            prestations: {
              'Manucure & Pédicure': 0,
              'Spray-Tanning': 0,
              'Blanchiment dentaire': 0,
              'Soins & Lissages': 0,
              'Produits': 0,
              'Divers': 0,
              'Formation ongles': 0,
              'Formation spray tan': 0,
              'Formation soin-lissage': 0,
              'Formation blanchiment dentaire': 0,
            },
            prestationsCash: {
              'Manucure & Pédicure': 0,
              'Spray-Tanning': 0,
              'Blanchiment dentaire': 0,
              'Soins & Lissages': 0,
              'Produits': 0,
              'Divers': 0,
              'Formation ongles': 0,
              'Formation spray tan': 0,
              'Formation soin-lissage': 0,
              'Formation blanchiment dentaire': 0,
            },
            prestationsCard: {
              'Manucure & Pédicure': 0,
              'Spray-Tanning': 0,
              'Blanchiment dentaire': 0,
              'Soins & Lissages': 0,
              'Produits': 0,
              'Divers': 0,
              'Formation ongles': 0,
              'Formation spray tan': 0,
              'Formation soin-lissage': 0,
              'Formation blanchiment dentaire': 0,
            },
            expenses: {
              'Fournisseur ongle': 0,
              'Fournisseur cheveux': 0,
              'Fournisseur spray tan': 0,
              'Fournisseur blanchiment': 0,
              'Aménagement du salon': 0,
              'Formation ongles': 0,
              'Formation spray tan': 0,
              'Formation soin-lissage': 0,
              'Formation blanchiment dentaire': 0,
              'Produits': 0,
              'Divers': 0,
            },
            expensesCash: {
              'Fournisseur ongle': 0,
              'Fournisseur cheveux': 0,
              'Fournisseur spray tan': 0,
              'Fournisseur blanchiment': 0,
              'Aménagement du salon': 0,
              'Formation ongles': 0,
              'Formation spray tan': 0,
              'Formation soin-lissage': 0,
              'Formation blanchiment dentaire': 0,
              'Produits': 0,
              'Divers': 0,
            },
            expensesCard: {
              'Fournisseur ongle': 0,
              'Fournisseur cheveux': 0,
              'Fournisseur spray tan': 0,
              'Fournisseur blanchiment': 0,
              'Aménagement du salon': 0,
              'Formation ongles': 0,
              'Formation spray tan': 0,
              'Formation soin-lissage': 0,
              'Formation blanchiment dentaire': 0,
              'Produits': 0,
              'Divers': 0,
            },
            totalRevenue: 0,
            totalCashRevenue: 0,
            totalCardRevenue: 0,
            totalExpenses: 0,
            totalCashExpenses: 0,
            totalCardExpenses: 0,
            netProfit: 0,
            netCashProfit: 0,
            netCardProfit: 0
          };
          
          // Agréger les prestations de la période
          prestations.forEach(prestation => {
            const prestationDate = parseISO(prestation.date);
            if (isWithinInterval(prestationDate, { start: intervalStart, end: intervalEnd })) {
              const total = getPrestationTotal(prestation);
              
              const category = prestation.serviceCategory;
              timeDataItem.prestations[category] += total;
              timeDataItem.totalRevenue += total;
              
              // Ajouter les montants cash et card séparément
              timeDataItem.prestationsCash[category] += prestation.cashAmount;
              timeDataItem.totalCashRevenue += prestation.cashAmount;
              
              timeDataItem.prestationsCard[category] += prestation.cardAmount;
              timeDataItem.totalCardRevenue += prestation.cardAmount;
            }
          });
          
          // Agréger les dépenses de la période
          expenses.forEach(expense => {
            const expenseDate = parseISO(expense.date);
            if (isWithinInterval(expenseDate, { start: intervalStart, end: intervalEnd })) {
              timeDataItem.expenses[expense.categoryName] += expense.amount;
              timeDataItem.totalExpenses += expense.amount;
              
              if (expense.cashAmount > 0) {
                timeDataItem.expensesCash[expense.categoryName] += expense.cashAmount;
                timeDataItem.totalCashExpenses += expense.cashAmount;
              }
              
              if (expense.cardAmount > 0) {
                timeDataItem.expensesCard[expense.categoryName] += expense.cardAmount;
                timeDataItem.totalCardExpenses += expense.cardAmount;
              }
            }
          });
          
          timeDataItem.netProfit = timeDataItem.totalRevenue - timeDataItem.totalExpenses;
          timeDataItem.netCashProfit = timeDataItem.totalCashRevenue - timeDataItem.totalCashExpenses;
          timeDataItem.netCardProfit = timeDataItem.totalCardRevenue - timeDataItem.totalCardExpenses;
          
          return timeDataItem;
        });

        // Préparer les données pour Chart.js
        const labels = newTimeData.map(data => data.periodLabel);
        
        // Couleurs pour les prestations (tons chauds)
        const prestationColors = {
          'Manucure & Pédicure': 'rgba(236, 72, 153, 0.8)',
          'Spray-Tanning': 'rgba(234, 179, 8, 0.8)',
          'Blanchiment dentaire': 'rgba(6, 182, 212, 0.8)',
          'Soins & Lissages': 'rgba(16, 185, 129, 0.8)',
          'Produits (vente)': 'rgba(249, 115, 22, 0.8)',
          'Divers (prestation)': 'rgba(156, 163, 175, 0.8)',
          'Formation ongles (prestation)': 'rgba(244, 63, 94, 0.8)',
          'Formation spray tan (prestation)': 'rgba(251, 191, 36, 0.8)',
          'Formation soin-lissage (prestation)': 'rgba(34, 197, 94, 0.8)',
          'Formation blanchiment dentaire (prestation)': 'rgba(14, 165, 233, 0.8)',
        };

        // Couleurs pour les dépenses (palette diversifiée)
        const expenseColors = {
          'Fournisseur ongle': 'rgba(239, 68, 68, 0.8)',     // Rouge
          'Fournisseur cheveux': 'rgba(168, 85, 247, 0.8)',  // Violet
          'Fournisseur spray tan': 'rgba(245, 158, 11, 0.8)', // Ambre
          'Fournisseur blanchiment': 'rgba(59, 130, 246, 0.8)', // Bleu
          'Aménagement du salon': 'rgba(156, 163, 175, 0.8)', // Gris
          'Formation ongles (dépense)': 'rgba(220, 38, 127, 0.8)',      // Rose foncé
          'Formation spray tan (dépense)': 'rgba(217, 119, 6, 0.8)',    // Orange foncé
          'Formation soin-lissage (dépense)': 'rgba(22, 163, 74, 0.8)', // Vert
          'Formation blanchiment dentaire (dépense)': 'rgba(37, 99, 235, 0.8)', // Bleu indigo
          'Produits (achat)': 'rgba(234, 88, 12, 0.8)',              // Orange
          'Divers (dépense)': 'rgba(107, 114, 128, 0.8)',              // Gris foncé
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const datasets: any[] = [];

        // Datasets pour les prestations (valeurs positives) - selon le filtre de paiement
        const prestationData = paymentFilter === 'cash' 
          ? newTimeData.map(data => data.prestationsCash)
          : paymentFilter === 'card'
          ? newTimeData.map(data => data.prestationsCard)
          : newTimeData.map(data => data.prestations);

        // Mapping des noms affichés vers les noms de données
        const prestationMapping: { [key: string]: string } = {
          'Produits (vente)': 'Produits',
          'Divers (prestation)': 'Divers',
          'Formation ongles (prestation)': 'Formation ongles',
          'Formation spray tan (prestation)': 'Formation spray tan',
          'Formation soin-lissage (prestation)': 'Formation soin-lissage',
          'Formation blanchiment dentaire (prestation)': 'Formation blanchiment dentaire',
        };

        Object.keys(prestationColors).forEach(displayCategory => {
          const dataCategory = prestationMapping[displayCategory] || displayCategory;
          const categoryData = prestationData.map(data => data[dataCategory] || 0);
          
          // Ne pas afficher la catégorie si toutes les valeurs sont nulles
          const hasNonZeroValue = categoryData.some(value => value !== 0);
          
          if (hasNonZeroValue) {
            datasets.push({
              label: displayCategory,
              data: categoryData,
              backgroundColor: prestationColors[displayCategory as keyof typeof prestationColors],
              borderColor: prestationColors[displayCategory as keyof typeof prestationColors].replace('0.8', '1'),
              borderWidth: 1,
              stack: 'revenue',
            });
          }
        });

        // Datasets pour les dépenses (valeurs négatives) - selon le filtre de paiement
        const expenseData = paymentFilter === 'cash' 
          ? newTimeData.map(data => data.expensesCash)
          : paymentFilter === 'card'
          ? newTimeData.map(data => data.expensesCard)
          : newTimeData.map(data => data.expenses);

        // Mapping des noms affichés vers les noms de données
        const expenseMapping: { [key: string]: string } = {
          'Formation ongles (dépense)': 'Formation ongles',
          'Formation spray tan (dépense)': 'Formation spray tan',
          'Formation soin-lissage (dépense)': 'Formation soin-lissage',
          'Formation blanchiment dentaire (dépense)': 'Formation blanchiment dentaire',
          'Produits (achat)': 'Produits',
          'Divers (dépense)': 'Divers',
        };

        Object.keys(expenseColors).forEach(displayCategory => {
          const dataCategory = expenseMapping[displayCategory] || displayCategory;
          const categoryData = expenseData.map(data => {
            const value = data[dataCategory] || 0;
            // Éviter -0 en retournant 0 si la valeur est 0
            return value === 0 ? 0 : -value;
          });
          
          // Ne pas afficher la catégorie si toutes les valeurs sont nulles
          const hasNonZeroValue = categoryData.some(value => value !== 0);
          
          if (hasNonZeroValue) {
            datasets.push({
              label: displayCategory,
              data: categoryData,
              backgroundColor: expenseColors[displayCategory as keyof typeof expenseColors],
              borderColor: expenseColors[displayCategory as keyof typeof expenseColors].replace('0.8', '1'),
              borderWidth: 1,
              stack: 'expenses',
            });
          }
        });

        // Dataset pour la ligne de profit - selon le filtre de paiement
        const profitData = paymentFilter === 'cash'
          ? newTimeData.map(data => data.netCashProfit)
          : paymentFilter === 'card'
          ? newTimeData.map(data => data.netCardProfit)
          : newTimeData.map(data => data.netProfit);

        datasets.push({
          label: 'Évolution du profit',
          data: profitData,
          type: 'line',
          borderColor: 'rgba(34, 197, 94, 1)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderWidth: 3,
          pointBackgroundColor: profitData.map(profit => 
            profit >= 0 ? 'rgba(34, 197, 94, 1)' : 'rgba(239, 68, 68, 1)'
          ),
          pointBorderColor: profitData.map(profit => 
            profit >= 0 ? 'rgba(34, 197, 94, 1)' : 'rgba(239, 68, 68, 1)'
          ),
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.4,
          fill: false,
          yAxisID: 'y',
        });

        const newChartData = {
          labels,
          datasets,
        };

        setTimeData(newTimeData);
        setChartData(newChartData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading chart data:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, [timeUnit, currentPeriod, isMobile, session, paymentFilter]);

  const options: ChartOptions<'bar'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    devicePixelRatio: (typeof window !== 'undefined' ? window.devicePixelRatio : 1) || 1,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false, // On va créer notre propre légende
      },
      tooltip: {
        enabled: true,
        external: undefined, // Use default tooltip
        filter: (tooltipItem) => {
          // Toujours afficher la ligne de profit
          if (tooltipItem.dataset.label === 'Évolution du profit') {
            return true;
          }
          // Masquer les éléments avec une valeur de 0
          return Math.abs(tooltipItem.parsed.y) !== 0;
        },
        callbacks: {
          title: (context) => {
            const periodIndex = context[0].dataIndex;
            const period = timeData[periodIndex];
            const unitLabel = timeUnit === 'day' ? 'Jour du' : timeUnit === 'week' ? 'Semaine du' : timeUnit === 'month' ? 'Mois de' : 'Année';
            return `${unitLabel} ${period.periodLabel}`;
          },
          afterTitle: (context) => {
            const periodIndex = context[0].dataIndex;
            const period = timeData[periodIndex];
            const currentRevenue = paymentFilter === 'cash' 
              ? period.totalCashRevenue 
              : paymentFilter === 'card'
              ? period.totalCardRevenue
              : period.totalRevenue;
            const currentExpenses = paymentFilter === 'cash'
              ? period.totalCashExpenses
              : paymentFilter === 'card'
              ? period.totalCardExpenses
              : period.totalExpenses;
            const currentProfit = paymentFilter === 'cash'
              ? period.netCashProfit
              : paymentFilter === 'card'
              ? period.netCardProfit
              : period.netProfit;
            
            const filterConfig = getPaymentFilterConfig(paymentFilter);
            return [
              `Revenus (${filterConfig.description}): +${currentRevenue}€`,
              `Dépenses (${filterConfig.description}): -${currentExpenses}€`,
              `Bénéfice (${filterConfig.description}): ${currentProfit >= 0 ? '+' : ''}${currentProfit}€`
            ];
          },
          label: (context) => {
            // Affichage spécial pour la ligne de profit
            if (context.dataset.label === 'Évolution du profit') {
              const value = context.parsed.y;
              return `Évolution du profit: ${value >= 0 ? '+' : ''}${value}€`;
            }
            
            // Pour les prestations et dépenses (les valeurs à 0 sont déjà filtrées)
            const value = Math.abs(context.parsed.y);
            return `${context.dataset.label}: ${context.parsed.y < 0 ? '-' : '+'}${value}€`;
          },
          labelColor: (context) => {
            // Retourner la couleur du dataset pour l'affichage dans le tooltip
            return {
              borderColor: context.dataset.borderColor as string,
              backgroundColor: context.dataset.backgroundColor as string,
              borderWidth: 2,
              borderRadius: 2,
            };
          },
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1f2937',
        bodyColor: '#374151',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        padding: isMobile ? 8 : 12,
        titleFont: {
          size: isMobile ? 12 : 14,
        },
        bodyFont: {
          size: isMobile ? 11 : 13,
        },
        displayColors: true, // Afficher les couleurs dans le tooltip
        usePointStyle: true, // Utiliser des points au lieu de rectangles
        boxWidth: isMobile ? 8 : 12,
        boxHeight: isMobile ? 8 : 12,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: isMobile ? 10 : 12,
          },
          maxRotation: isMobile ? 45 : (timeUnit === 'day' ? 45 : 0),
          minRotation: isMobile ? 45 : 0,
          padding: isMobile ? 2 : 4,
        },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        grid: {
          color: 'rgba(243, 244, 246, 0.8)',
          lineWidth: isMobile ? 0.5 : 1,
        },
        ticks: {
          font: {
            size: isMobile ? 10 : 12,
          },
          padding: isMobile ? 4 : 8,
          callback: function(value) {
            // Shorter format on mobile
            if (isMobile) {
              const num = Number(value);
              if (Math.abs(num) >= 1000) {
                return `${(num / 1000).toFixed(1)}k€`;
              }
              return `${num}€`;
            }
            return `${value}€`;
          },
        },
        title: {
          display: !isMobile, // Hide Y axis title on mobile to save space
          text: 'Montant (€)',
          font: {
            size: 12,
            weight: 'bold',
          },
          color: '#6b7280',
        },
      },
    },
    elements: {
      bar: {
        borderWidth: isMobile ? 0 : 1,
      },
      point: {
        radius: isMobile ? 4 : 6,
        hoverRadius: isMobile ? 6 : 8,
      },
      line: {
        borderWidth: isMobile ? 2 : 3,
      },
    },
  }), [timeData, timeUnit, isMobile, paymentFilter]);

  // Créer les légendes séparées avec distinction prestations/dépenses
  const prestationCategories = ['Manucure & Pédicure', 'Spray-Tanning', 'Blanchiment dentaire', 'Soins & Lissages', 'Produits (vente)', 'Divers (prestation)', 'Formation ongles (prestation)', 'Formation spray tan (prestation)', 'Formation soin-lissage (prestation)', 'Formation blanchiment dentaire (prestation)'];
  const expenseCategories = ['Fournisseur ongle', 'Fournisseur cheveux', 'Fournisseur spray tan', 'Fournisseur blanchiment', 'Aménagement du salon', 'Formation ongles (dépense)', 'Formation spray tan (dépense)', 'Formation soin-lissage (dépense)', 'Formation blanchiment dentaire (dépense)', 'Produits (achat)', 'Divers (dépense)'];

  const prestationColors = {
    'Manucure & Pédicure': '#ec4899',
    'Spray-Tanning': '#eab308',
    'Blanchiment dentaire': '#06b6d4',
    'Soins & Lissages': '#10b981',
    'Produits (vente)': '#f97316',
    'Divers (prestation)': '#9ca3af',
    'Formation ongles (prestation)': '#f43f5e',
    'Formation spray tan (prestation)': '#fbbf24',
    'Formation soin-lissage (prestation)': '#22c55e',
    'Formation blanchiment dentaire (prestation)': '#0ea5e9',
  };

  const expenseColors = {
    'Fournisseur ongle': '#ef4444',     // Rouge
    'Fournisseur cheveux': '#a855f7',   // Violet
    'Fournisseur spray tan': '#f59e0b', // Ambre
    'Fournisseur blanchiment': '#3b82f6', // Bleu
    'Aménagement du salon': '#9ca3af',  // Gris
    'Formation ongles (dépense)': '#e41e7a',      // Rose foncé
    'Formation spray tan (dépense)': '#f5650a',    // Orange foncé
    'Formation soin-lissage (dépense)': '#25c2a0', // Vert
    'Formation blanchiment dentaire (dépense)': '#2563eb', // Bleu indigo
    'Produits (achat)': '#ea580c',              // Orange
    'Divers (dépense)': '#6b7280',               // Gris foncé
  };

  const getPaymentFilterConfig = (filter: PaymentFilter) => {
    switch (filter) {
      case 'total':
        return {
          label: 'Total',
          icon: DollarSign,
          description: 'Tous les paiements'
        };
      case 'cash':
        return {
          label: 'Espèces',
          icon: Banknote,
          description: 'Paiements en espèces'
        };
      case 'card':
        return {
          label: 'Carte',
          icon: CreditCard,
          description: 'Paiements par carte'
        };
    }
  };

  const getTimeUnitConfig = (unit: TimeUnit) => {
    switch (unit) {
      case 'day':
        return {
          label: 'Jours',
          icon: Clock,
          period: isMobile ? '7 jours' : '14 jours'
        };
      case 'week':
        return {
          label: 'Semaines',
          icon: Calendar,
          period: isMobile ? '6 semaines' : '8 semaines'
        };
      case 'month':
        return {
          label: 'Mois',
          icon: BarChart3,
          period: isMobile ? '6 mois' : '12 mois'
        };
      case 'year':
        return {
          label: 'Années',
          icon: CalendarDays,
          period: '5 années'
        };
    }
  };

  const currentConfig = getTimeUnitConfig(timeUnit);

  // Fonctions de navigation
  const navigatePrevious = () => {
    switch (timeUnit) {
      case 'day':
        const dayCount = isMobile ? 7 : 14;
        setCurrentPeriod(prev => subDays(prev, dayCount));
        break;
      case 'week':
        const weekCount = isMobile ? 6 : 8;
        setCurrentPeriod(prev => subWeeks(prev, weekCount));
        break;
      case 'month':
        const monthCount = isMobile ? 6 : 12;
        setCurrentPeriod(prev => subMonths(prev, monthCount));
        break;
      case 'year':
        setCurrentPeriod(prev => subYears(prev, 5));
        break;
    }
  };

  const navigateNext = () => {
    switch (timeUnit) {
      case 'day':
        const dayCount = isMobile ? 7 : 14;
        setCurrentPeriod(prev => addDays(prev, dayCount));
        break;
      case 'week':
        const weekCount = isMobile ? 6 : 8;
        setCurrentPeriod(prev => addWeeks(prev, weekCount));
        break;
      case 'month':
        const monthCount = isMobile ? 6 : 12;
        setCurrentPeriod(prev => addMonths(prev, monthCount));
        break;
      case 'year':
        setCurrentPeriod(prev => addYears(prev, 5));
        break;
    }
  };

  const resetToToday = () => {
    setCurrentPeriod(new Date());
  };

  // Vérifier si on peut naviguer vers le futur
  const canNavigateNext = () => {
    const nextPeriod = new Date(currentPeriod);
    switch (timeUnit) {
      case 'day':
        const dayCount = isMobile ? 7 : 14;
        nextPeriod.setDate(nextPeriod.getDate() + dayCount);
        break;
      case 'week':
        const weekCount = isMobile ? 6 : 8;
        nextPeriod.setDate(nextPeriod.getDate() + (weekCount * 7));
        break;
      case 'month':
        const monthCount = isMobile ? 6 : 12;
        nextPeriod.setMonth(nextPeriod.getMonth() + monthCount);
        break;
      case 'year':
        nextPeriod.setFullYear(nextPeriod.getFullYear() + 5);
        break;
    }
    return !isFuture(nextPeriod);
  };

  // Obtenir la description de la période actuelle
  const getCurrentPeriodDescription = () => {
    const endDate = new Date(currentPeriod);
    const startDate = new Date(currentPeriod);
    
    switch (timeUnit) {
      case 'day':
        const dayCount = isMobile ? 7 : 14;
        startDate.setDate(endDate.getDate() - (dayCount - 1));
        return `${format(startDate, 'd MMM', { locale: fr })} - ${format(endDate, 'd MMM yyyy', { locale: fr })}`;
      case 'week':
        const weekCount = isMobile ? 6 : 8;
        startDate.setDate(endDate.getDate() - (weekCount * 7));
        return `${format(startDate, 'd MMM', { locale: fr })} - ${format(endDate, 'd MMM yyyy', { locale: fr })}`;
      case 'month':
        const monthCount = isMobile ? 6 : 12;
        startDate.setMonth(endDate.getMonth() - (monthCount - 1));
        return `${format(startDate, 'MMM yyyy', { locale: fr })} - ${format(endDate, 'MMM yyyy', { locale: fr })}`;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 4);
        return `${format(startDate, 'yyyy', { locale: fr })} - ${format(endDate, 'yyyy', { locale: fr })}`;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-3 sm:p-6">
      <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
        {/* Header avec titre et toggles */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">Analyse Temporelle</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Revenus vs Dépenses ({currentConfig.period}) - {getPaymentFilterConfig(paymentFilter).description}
            </p>
          </div>
          
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            {/* Toggle pour l'unité de temps */}
            <div className="flex bg-gray-100 rounded-xl p-1 mx-auto sm:mx-0">
              {(['day', 'week', 'month', 'year'] as TimeUnit[]).map((unit) => {
                const config = getTimeUnitConfig(unit);
                const Icon = config.icon;
                return (
                  <button
                    key={unit}
                    onClick={() => {
                      setTimeUnit(unit);
                      setCurrentPeriod(new Date()); // Reset à aujourd'hui quand on change d'unité
                    }}
                    className={`flex items-center justify-center space-x-1 px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all min-w-0 ${
                      timeUnit === unit
                        ? 'bg-white text-pink-700 shadow-sm'
                        : 'text-gray-600 hover:text-pink-600'
                    }`}
                  >
                    <Icon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="hidden sm:inline">{config.label}</span>
                    <span className="sm:hidden text-xs">{config.label.charAt(0)}</span>
                  </button>
                );
              })}
            </div>

            {/* Toggle pour le filtre de paiement */}
            <div className="flex bg-blue-100 rounded-xl p-1 mx-auto sm:mx-0">
              {(['total', 'cash', 'card'] as PaymentFilter[]).map((filter) => {
                const config = getPaymentFilterConfig(filter);
                const Icon = config.icon;
                return (
                  <button
                    key={filter}
                    onClick={() => setPaymentFilter(filter)}
                    className={`flex items-center justify-center space-x-1 px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all min-w-0 ${
                      paymentFilter === filter
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    <Icon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="hidden sm:inline">{config.label}</span>
                    <span className="sm:hidden text-xs">{config.label.charAt(0)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Navigation temporelle - Mobile optimized */}
        <div className="flex items-center justify-between bg-gray-50 rounded-xl p-2 sm:p-4 gap-2">
          <button
            onClick={navigatePrevious}
            className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all hover:bg-gray-50 flex-shrink-0"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
            <span className="text-xs sm:text-sm font-medium text-gray-700 hidden sm:inline">Précédent</span>
          </button>

          <div className="flex flex-col items-center space-y-1 min-w-0 flex-1">
            <div className="text-center">
              <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{getCurrentPeriodDescription()}</p>
              <p className="text-xs text-gray-500">{currentConfig.period}</p>
            </div>
            
            <button
              onClick={resetToToday}
              className="flex items-center space-x-1 px-2 sm:px-3 py-1 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-colors text-xs sm:text-sm"
              title="Retour à aujourd'hui"
            >
              <RotateCcw className="h-3 w-3" />
              <span className="hidden sm:inline">Aujourd&apos;hui</span>
              <span className="sm:hidden">Auj.</span>
            </button>
          </div>

          <button
            onClick={navigateNext}
            disabled={!canNavigateNext()}
            className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-lg shadow-sm transition-all flex-shrink-0 ${
              canNavigateNext()
                ? 'bg-white hover:shadow-md hover:bg-gray-50 text-gray-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span className="text-xs sm:text-sm font-medium hidden sm:inline">Suivant</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Légendes améliorées - Mobile optimized */}
      <div className="mb-4 sm:mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        <div className="bg-green-50 rounded-xl p-3 sm:p-4">
          <div className="flex items-center space-x-2 mb-2 sm:mb-3">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            <h4 className="text-xs sm:text-sm font-semibold text-green-700">Prestations</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs">
            {prestationCategories.map(category => (
              <div key={category} className="flex items-center space-x-2">
                <div 
                  className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: prestationColors[category as keyof typeof prestationColors] }}
                ></div>
                <span className="text-gray-700 truncate text-xs">{category}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-red-50 rounded-xl p-3 sm:p-4">
          <div className="flex items-center space-x-2 mb-2 sm:mb-3">
            <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
            <h4 className="text-xs sm:text-sm font-semibold text-red-700">Dépenses</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs">
            {expenseCategories.map(category => (
              <div key={category} className="flex items-center space-x-2">
                <div 
                  className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: expenseColors[category as keyof typeof expenseColors] }}
                ></div>
                <span className="text-gray-700 truncate text-xs">{category}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-emerald-50 rounded-xl p-3 sm:p-4 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center space-x-2 mb-2 sm:mb-3">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
            <h4 className="text-xs sm:text-sm font-semibold text-emerald-700">Évolution du Bénéfice</h4>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-1 gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-0.5 sm:w-8 sm:h-0.5 bg-emerald-600 rounded flex-shrink-0"></div>
              <span className="text-gray-700 text-xs">Tendance</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full flex-shrink-0"></div>
              <span className="text-gray-700 text-xs">Positif</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full flex-shrink-0"></div>
              <span className="text-gray-700 text-xs">Négatif</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Graphique - Mobile optimized */}
      <div className="h-64 sm:h-80 lg:h-96 relative bg-gray-50 rounded-xl p-2 sm:p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          </div>
        ) : chartData ? (
          <>
            <Chart type="bar" data={chartData} options={options} />
            
            {/* Ligne de référence zéro */}
            <div className="absolute inset-0 pointer-events-none flex items-center">
              <div className="w-full h-px bg-gray-400 opacity-30 sm:opacity-50"></div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucune donnée disponible</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Résumé des totaux - Mobile optimized */}
      <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
          <p className="text-xs sm:text-sm text-green-600 font-medium">
            Total Revenus ({getPaymentFilterConfig(paymentFilter).label})
          </p>
          <p className="text-base sm:text-lg font-bold text-green-700">
            +{paymentFilter === 'cash' 
              ? timeData.reduce((sum, period) => sum + period.totalCashRevenue, 0)
              : paymentFilter === 'card'
              ? timeData.reduce((sum, period) => sum + period.totalCardRevenue, 0)
              : timeData.reduce((sum, period) => sum + period.totalRevenue, 0)
            }€
          </p>
        </div>
        <div className="text-center p-3 sm:p-4 bg-red-50 rounded-lg">
          <p className="text-xs sm:text-sm text-red-600 font-medium">Total Dépenses</p>
          <p className="text-base sm:text-lg font-bold text-red-700">
            -{timeData.reduce((sum, period) => sum + period.totalExpenses, 0)}€
          </p>
        </div>
        <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
          <p className="text-xs sm:text-sm text-gray-600 font-medium">
            Bénéfice Net ({getPaymentFilterConfig(paymentFilter).label})
          </p>
          <p className={`text-base sm:text-lg font-bold ${
            (paymentFilter === 'cash' 
              ? timeData.reduce((sum, period) => sum + period.netCashProfit, 0)
              : paymentFilter === 'card'
              ? timeData.reduce((sum, period) => sum + period.netCardProfit, 0)
              : timeData.reduce((sum, period) => sum + period.netProfit, 0)
            ) >= 0 
              ? 'text-green-700' 
              : 'text-red-700'
          }`}>
            {(paymentFilter === 'cash' 
              ? timeData.reduce((sum, period) => sum + period.netCashProfit, 0)
              : paymentFilter === 'card'
              ? timeData.reduce((sum, period) => sum + period.netCardProfit, 0)
              : timeData.reduce((sum, period) => sum + period.netProfit, 0)
            ) >= 0 ? '+' : ''}
            {paymentFilter === 'cash' 
              ? timeData.reduce((sum, period) => sum + period.netCashProfit, 0)
              : paymentFilter === 'card'
              ? timeData.reduce((sum, period) => sum + period.netCardProfit, 0)
              : timeData.reduce((sum, period) => sum + period.netProfit, 0)
            }€
          </p>
        </div>
      </div>
    </div>
  );
};

export default TimeChart; 