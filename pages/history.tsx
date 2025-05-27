import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Euro, 
  Calendar,
  FileText,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Filter
} from 'lucide-react';
import { loadPrestations, deletePrestation, loadExpenses, deleteExpense, getPrestationById, getExpenseById } from '../utils/storage';
import { Prestation, Expense, Transaction } from '../types';
import TransactionCard from '../components/TransactionCard';
import Modal from '../components/Modal';
import PrestationForm from '../components/PrestationForm';
import ExpenseForm from '../components/ExpenseForm';

const HistoryPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'revenue' | 'expense'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'description'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingPrestation, setEditingPrestation] = useState<Prestation | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  useEffect(() => {
    const loadData = () => {
      const prestations = loadPrestations();
      const expenses = loadExpenses();
      
      // Convert prestations to transactions
      const revenueTransactions: Transaction[] = prestations.map(prestation => ({
        id: prestation.id,
        type: 'revenue' as const,
        amount: prestation.price,
        date: prestation.date,
        description: prestation.serviceName,
        category: prestation.serviceCategory,
        notes: prestation.notes
      }));

      // Convert expenses to transactions
      const expenseTransactions: Transaction[] = expenses.map(expense => ({
        id: expense.id,
        type: 'expense' as const,
        amount: expense.amount,
        date: expense.date,
        description: expense.categoryName,
        category: expense.categoryName,
        notes: expense.description
      }));

      const allTransactions = [...revenueTransactions, ...expenseTransactions];
      setTransactions(allTransactions);
      setFilteredTransactions(allTransactions);
      setIsLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    let filtered = [...transactions];

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === typeFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (transaction.notes && transaction.notes.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'description':
          comparison = a.description.localeCompare(b.description);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, typeFilter, sortBy, sortOrder]);

  const handleDelete = async (transaction: Transaction) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer cette ${transaction.type === 'revenue' ? 'prestation' : 'dépense'} ?`)) {
      try {
        if (transaction.type === 'revenue') {
          deletePrestation(transaction.id);
        } else {
          deleteExpense(transaction.id);
        }
        
        // Reload data
        const prestations = loadPrestations();
        const expenses = loadExpenses();
        
        const revenueTransactions: Transaction[] = prestations.map(prestation => ({
          id: prestation.id,
          type: 'revenue' as const,
          amount: prestation.price,
          date: prestation.date,
          description: prestation.serviceName,
          category: prestation.serviceCategory,
          notes: prestation.notes
        }));

        const expenseTransactions: Transaction[] = expenses.map(expense => ({
          id: expense.id,
          type: 'expense' as const,
          amount: expense.amount,
          date: expense.date,
          description: expense.categoryName,
          category: expense.categoryName,
          notes: expense.description
        }));

        const allTransactions = [...revenueTransactions, ...expenseTransactions];
        setTransactions(allTransactions);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleSort = (newSortBy: 'date' | 'amount' | 'description') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const handleEdit = async (transaction: Transaction) => {
    setEditingTransaction(transaction);
    
    if (transaction.type === 'revenue') {
      const prestation = getPrestationById(transaction.id);
      setEditingPrestation(prestation || null);
    } else {
      const expense = getExpenseById(transaction.id);
      setEditingExpense(expense || null);
    }
  };

  const handleEditSuccess = () => {
    setEditingTransaction(null);
    setEditingPrestation(null);
    setEditingExpense(null);
    
    // Reload data
    const prestations = loadPrestations();
    const expenses = loadExpenses();
    
    const revenueTransactions: Transaction[] = prestations.map(prestation => ({
      id: prestation.id,
      type: 'revenue' as const,
      amount: prestation.price,
      date: prestation.date,
      description: prestation.serviceName,
      category: prestation.serviceCategory,
      notes: prestation.notes
    }));

    const expenseTransactions: Transaction[] = expenses.map(expense => ({
      id: expense.id,
      type: 'expense' as const,
      amount: expense.amount,
      date: expense.date,
      description: expense.categoryName,
      category: expense.categoryName,
      notes: expense.description
    }));

    const allTransactions = [...revenueTransactions, ...expenseTransactions];
    setTransactions(allTransactions);
  };

  const handleEditCancel = () => {
    setEditingTransaction(null);
    setEditingPrestation(null);
    setEditingExpense(null);
  };

  const totalRevenue = filteredTransactions
    .filter(t => t.type === 'revenue')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalRevenue - totalExpenses;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full mb-4">
            <FileText className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Historique financier</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Chargement...</h1>
        </div>
        
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-pink-500 mx-auto mb-4"></div>
              <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-purple-500 animate-spin mx-auto" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
            </div>
            <p className="text-gray-600">Chargement de vos transactions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full mb-4">
          <FileText className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">Historique financier</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Toutes vos transactions</h1>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-green-700">+{totalRevenue}€</span>
            </div>
            <p className="text-sm text-gray-600">Total des revenus</p>
            <div className="mt-2 h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-gradient-to-r from-green-400 to-green-600 rounded-full" style={{width: '75%'}}></div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingDown className="h-8 w-8 text-red-600" />
              <span className="text-2xl font-bold text-red-700">-{totalExpenses}€</span>
            </div>
            <p className="text-sm text-gray-600">Total des dépenses</p>
            <div className="mt-2 h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-gradient-to-r from-red-400 to-red-600 rounded-full" style={{width: '45%'}}></div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Euro className={`h-8 w-8 ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`} />
              <span className={`text-2xl font-bold ${netProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                {netProfit >= 0 ? '+' : ''}{netProfit}€
              </span>
            </div>
            <p className="text-sm text-gray-600">Bénéfice net</p>
            <div className="mt-2 h-2 bg-gray-200 rounded-full">
              <div className={`h-2 rounded-full ${
                netProfit >= 0 
                  ? 'bg-gradient-to-r from-emerald-400 to-green-600' 
                  : 'bg-gradient-to-r from-red-400 to-red-600'
              }`} style={{width: netProfit >= 0 ? '85%' : '30%'}}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filtres et recherche</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>{filteredTransactions.length} transaction{filteredTransactions.length > 1 ? 's' : ''}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Search */}
          <div className="lg:col-span-5 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par description, catégorie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all bg-gray-50 focus:bg-white"
            />
          </div>

          {/* Type Filter */}
          <div className="lg:col-span-4 relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'all' | 'revenue' | 'expense')}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all bg-gray-50 focus:bg-white appearance-none"
            >
              <option value="all">Toutes les transactions</option>
              <option value="revenue">Revenus uniquement</option>
              <option value="expense">Dépenses uniquement</option>
            </select>
          </div>

          {/* Sort */}
          <div className="lg:col-span-3 flex space-x-2">
            <button
              onClick={() => handleSort('date')}
              className={`flex items-center justify-center space-x-1 px-4 py-3 rounded-xl text-sm font-medium transition-all flex-1 ${
                sortBy === 'date' 
                  ? 'bg-pink-100 text-pink-700 shadow-sm' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Date</span>
              {sortBy === 'date' && <ArrowUpDown className="h-3 w-3" />}
            </button>
            <button
              onClick={() => handleSort('amount')}
              className={`flex items-center justify-center space-x-1 px-4 py-3 rounded-xl text-sm font-medium transition-all flex-1 ${
                sortBy === 'amount' 
                  ? 'bg-pink-100 text-pink-700 shadow-sm' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Euro className="h-4 w-4" />
              <span className="hidden sm:inline">Montant</span>
              {sortBy === 'amount' && <ArrowUpDown className="h-3 w-3" />}
            </button>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="inline-flex p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-6">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {transactions.length === 0 
              ? 'Aucune transaction enregistrée' 
              : 'Aucun résultat trouvé'
            }
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {transactions.length === 0 
              ? 'Commencez par ajouter votre première prestation ou dépense pour voir l\'historique ici.'
              : 'Aucune transaction ne correspond à vos critères de recherche. Essayez de modifier vos filtres.'
            }
          </p>
          {(searchTerm || typeFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('all');
              }}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Effacer les filtres
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredTransactions.map((transaction) => (
            <TransactionCard
              key={`${transaction.type}-${transaction.id}`}
              transaction={transaction}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))}

          {/* Edit Modals */}
          {editingTransaction && editingTransaction.type === 'revenue' && editingPrestation && (
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

          {editingTransaction && editingTransaction.type === 'expense' && editingExpense && (
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
      )}
    </div>
  );
};

export default HistoryPage; 