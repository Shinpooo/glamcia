import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Save, Euro } from 'lucide-react';
import Link from 'next/link';
import { getExpenseById, updateExpense } from '../../utils/supabase-storage';
import { EXPENSE_CATEGORIES } from '../../data/expenses';
import { Expense, ExpenseCategory } from '../../types';
import { useSession } from 'next-auth/react';

const EditExpense: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { id } = router.query;
  
  const [expense, setExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: 0,
    date: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const loadExpense = async () => {
      if (!session?.user?.email || !id || typeof id !== 'string') {
        setIsLoading(false);
        return;
      }

      try {
        const expenseId = parseInt(id);
        const userEmail = session.user.email;
        const foundExpense = await getExpenseById(expenseId, userEmail);
        
        if (foundExpense) {
          setExpense(foundExpense);
          setFormData({
            categoryId: foundExpense.categoryId,
            amount: foundExpense.amount,
            date: foundExpense.date,
            description: foundExpense.description || ''
          });
        } else {
          router.push('/expenses');
        }
      } catch (error) {
        console.error('Error loading expense:', error);
        router.push('/expenses');
      }
      
      setIsLoading(false);
    };

    loadExpense();
  }, [id, router, session]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.categoryId) {
      newErrors.categoryId = 'Veuillez sélectionner une catégorie';
    }

    if (!formData.amount || parseFloat(formData.amount.toString()) <= 0) {
      newErrors.amount = 'Veuillez entrer un montant valide';
    }

    if (!formData.date) {
      newErrors.date = 'Veuillez sélectionner une date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !expense || !session?.user?.email) {
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedCategory = EXPENSE_CATEGORIES.find((cat: ExpenseCategory) => cat.id === formData.categoryId);
      
      if (!selectedCategory) {
        setErrors({ categoryId: 'Catégorie non trouvée' });
        return;
      }

      const updatedExpense: Expense = {
        ...expense,
        categoryId: formData.categoryId,
        categoryName: selectedCategory.name,
        amount: formData.amount,
        date: formData.date,
        description: formData.description || undefined
      };

      const userEmail = session.user.email;
      const success = await updateExpense(expense.id, updatedExpense, userEmail);
      
      if (success) {
        router.push('/history');
      } else {
        setErrors({ submit: 'Erreur lors de la modification de la dépense' });
      }
    } catch (error) {
      console.error('Erreur lors de la modification de la dépense:', error);
      setErrors({ submit: 'Une erreur est survenue lors de la modification de la dépense' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Dépense non trouvée</h1>
        <Link
          href="/history"
          className="text-pink-600 hover:text-pink-700"
        >
          Retour à l&apos;historique
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          href="/history"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Modifier la Dépense</h1>
          <p className="text-gray-600">Modifier les détails de la dépense</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Date de la dépense *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                errors.date ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date}</p>
            )}
          </div>

          {/* Category Selection */}
          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie de dépense *
            </label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                errors.categoryId ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Sélectionner une catégorie</option>
              {EXPENSE_CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Montant (€) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Euro className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                placeholder="0.00"
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                  errors.amount ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description (optionnelle)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Ajouter une description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/history"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>{isSubmitting ? 'Enregistrement...' : 'Enregistrer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditExpense; 