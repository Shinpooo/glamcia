import React, { useState } from 'react';
import { format } from 'date-fns';
import { Save, FileText, Calendar, Tag } from 'lucide-react';
import { SERVICE_CATEGORIES } from '../data/services';
import { addPrestation, updatePrestation } from '../utils/supabase-storage';
import { Prestation, PaymentDetails } from '../types';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import FormTextarea from './FormTextarea';
import Button from './Button';
import PaymentMethodSelector from './PaymentMethodSelector';
import { useSession } from 'next-auth/react';

interface PrestationFormProps {
  prestation?: Prestation;
  onSuccess: () => void;
  onCancel: () => void;
}

const PrestationForm: React.FC<PrestationFormProps> = ({ 
  prestation, 
  onSuccess, 
  onCancel 
}) => {
  const { data: session } = useSession();
  const [selectedServiceCategory, setSelectedServiceCategory] = useState<string>(prestation?.serviceCategory || '');
  const [date, setDate] = useState<string>(prestation?.date || format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState<string>(prestation?.notes || '');
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    method: prestation?.paymentMethod || 'cash',
    cashAmount: prestation?.cashAmount || 0,
    cardAmount: prestation?.cardAmount || 0
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const isEditing = !!prestation;
  const totalAmount = paymentDetails.cashAmount + paymentDetails.cardAmount;

  // Convert SERVICE_CATEGORIES to FormSelect format
  const serviceOptions = SERVICE_CATEGORIES.map(category => ({
    value: category,
    label: category
  }));

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!selectedServiceCategory) {
      newErrors.service = 'Veuillez sélectionner une catégorie de service';
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

    if (paymentDetails.method === 'mixed' && (paymentDetails.cashAmount <= 0 || paymentDetails.cardAmount <= 0)) {
      newErrors.payment = 'Pour un paiement mixte, les montants en espèces et par carte doivent être supérieurs à 0€';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!session?.user?.email) {
      setErrors({ submit: 'Vous devez être connecté pour ajouter une prestation' });
      return;
    }

    setIsSubmitting(true);
    
    const prestationData: Prestation = {
      id: prestation?.id || 0,
      serviceCategory: selectedServiceCategory,
      date,
      notes: notes.trim() || undefined,
      paymentMethod: paymentDetails.method,
      cashAmount: paymentDetails.cashAmount,
      cardAmount: paymentDetails.cardAmount
    };

    try {
      let success = false;
      if (isEditing) {
        success = await updatePrestation(prestation.id, prestationData, session.user.email);
      } else {
        success = await addPrestation(prestationData, session.user.email);
      }
      
      if (success) {
        onSuccess();
      } else {
        setErrors({ submit: 'Erreur lors de l\'enregistrement. Vérifiez votre connexion.' });
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la prestation:', error);
      setErrors({ submit: 'Une erreur est survenue lors de l\'enregistrement' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Date */}
      <FormInput
        label="Date de la prestation"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
        icon={Calendar}
        error={errors.date}
      />

      {/* Service Selection */}
      <FormSelect
        label="Catégorie de service"
        value={selectedServiceCategory}
        onChange={(e) => setSelectedServiceCategory(e.target.value)}
        options={serviceOptions}
        placeholder="Sélectionner une catégorie de service"
        required
        icon={Tag}
        error={errors.service}
      />

      {/* Payment Method Selector */}
      <PaymentMethodSelector
        value={paymentDetails}
        onChange={setPaymentDetails}
        error={errors.payment}
      />

      {/* Notes */}
      <FormTextarea
        label="Notes (optionnel)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Ajouter des notes sur la prestation..."
        rows={3}
        icon={FileText}
        error={errors.notes}
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
          disabled={!selectedServiceCategory || totalAmount <= 0}
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

export default PrestationForm; 