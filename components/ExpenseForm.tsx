import React, { useState } from 'react';
import { format } from 'date-fns';
import { Save, FileText, Calendar, Tag } from 'lucide-react';
import { addExpense, updateExpense } from '../utils/supabase-storage';
import { EXPENSE_CATEGORIES } from '../data/expenses';
import { Expense, PaymentDetails } from '../types';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import FormTextarea from './FormTextarea';
import Button from './Button';
import ExpensePaymentSelector from './ExpensePaymentSelector';
import { useSession } from 'next-auth/react';

interface ExpenseFormProps {
  expense?: Expense;
  onSuccess: () => void;
  onCancel: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ 
  expense, 
  onSuccess, 
  onCancel 
}) => {
  const { data: session } = useSession();
  const [categoryId, setCategoryId] = useState<string>(expense?.categoryId || '');
  const [date, setDate] = useState<string>(expense?.date || format(new Date(), 'yyyy-MM-dd'));
  const [description, setDescription] = useState<string>(expense?.description || '');
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    method: expense?.paymentMethod || 'cash',
    cashAmount: expense?.cashAmount || expense?.amount || 0, // Fallback for old data
    cardAmount: expense?.cardAmount || 0
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const isEditing = !!expense;
  const totalAmount = paymentDetails.cashAmount + paymentDetails.cardAmount;

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!categoryId) {
      newErrors.category = 'Veuillez sélectionner une catégorie';
    }

    if (!date) {
      newErrors.date = 'Veuillez sélectionner une date';
    }

    // Validate payment details
    if (totalAmount <= 0) {
      newErrors.payment = 'Le montant total doit être supérieur à 0€';
    }

    if (paymentDetails.method === 'cash' && paymentDetails.cashAmount <= 0) {
      newErrors.payment = 'Le montant en espèces doit être supérieur à 0€';
    }

    if (paymentDetails.method === 'card' && paymentDetails.cardAmount <= 0) {
      newErrors.payment = 'Le montant par carte doit être supérieur à 0€';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const selectedCategory = EXPENSE_CATEGORIES.find(cat => cat.id === categoryId);
    
    if (!selectedCategory) {
      setErrors({ category: 'Catégorie non trouvée' });
      return;
    }

    if (!session?.user?.email) {
      setErrors({ submit: 'Vous devez être connecté pour ajouter une dépense' });
      return;
    }

    setIsSubmitting(true);
    
    const expenseData: Expense = {
      id: expense?.id || 0,
      categoryId,
      categoryName: selectedCategory.name,
      amount: totalAmount, // Keep for backward compatibility
      date,
      description: description.trim() || undefined,
      paymentMethod: paymentDetails.method,
      cashAmount: paymentDetails.cashAmount,
      cardAmount: paymentDetails.cardAmount
    };

    try {
      let success = false;
      if (isEditing) {
        success = await updateExpense(expense.id, expenseData, session.user.email);
      } else {
        success = await addExpense(expenseData, session.user.email);
      }
      
      if (success) {
        onSuccess();
      } else {
        setErrors({ submit: 'Erreur lors de l\'enregistrement. Vérifiez votre connexion.' });
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la dépense:', error);
      setErrors({ submit: 'Une erreur est survenue lors de l\'enregistrement' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = EXPENSE_CATEGORIES.map(category => ({
    value: category.id,
    label: category.name
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Date */}
      <FormInput
        label="Date de la dépense"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
        icon={Calendar}
        error={errors.date}
      />

      {/* Category Selection */}
      <FormSelect
        label="Catégorie de dépense"
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        options={categoryOptions}
        placeholder="Sélectionner une catégorie"
        required
        icon={Tag}
        error={errors.category}
      />

      {/* Payment Method Selector */}
      <ExpensePaymentSelector
        value={paymentDetails}
        onChange={setPaymentDetails}
        error={errors.payment}
      />

      {/* Description */}
      <FormTextarea
        label="Description (optionnelle)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Ajouter une description..."
        rows={3}
        icon={FileText}
        error={errors.description}
      />

      {/* Submit Error */}
      {errors.submit && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      {/* Submit Buttons */}
      <div className="flex space-x-4 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="flex-1"
        >
          Annuler
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
          disabled={!categoryId || totalAmount <= 0}
          icon={Save}
          className="flex-1"
        >
          {isSubmitting 
            ? 'Enregistrement...' 
            : isEditing 
              ? 'Modifier' 
              : 'Enregistrer'
          }
        </Button>
      </div>
    </form>
  );
};

export default ExpenseForm; 