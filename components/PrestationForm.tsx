import React, { useState } from 'react';
import { format } from 'date-fns';
import { Save, Euro, FileText, Calendar, Tag } from 'lucide-react';
import { SERVICES, getServiceById } from '../data/services';
import { addPrestation, updatePrestation } from '../utils/storage';
import { Prestation } from '../types';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import FormTextarea from './FormTextarea';
import Button from './Button';

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
  const [selectedServiceId, setSelectedServiceId] = useState<string>(prestation?.serviceId || '');
  const [price, setPrice] = useState<number>(prestation?.price || 0);
  const [date, setDate] = useState<string>(prestation?.date || format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState<string>(prestation?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const selectedService = getServiceById(selectedServiceId);
  const isEditing = !!prestation;

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!selectedServiceId) {
      newErrors.service = 'Veuillez sélectionner un service';
    }

    if (!price || price <= 0) {
      newErrors.price = 'Veuillez entrer un prix valide';
    }

    if (!date) {
      newErrors.date = 'Veuillez sélectionner une date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!selectedService) {
      setErrors({ service: 'Service non trouvé' });
      return;
    }

    setIsSubmitting(true);
    
    const prestationData: Prestation = {
      id: prestation?.id || Date.now().toString(),
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      serviceCategory: selectedService.category,
      price,
      date,
      notes: notes.trim() || undefined
    };

    try {
      if (isEditing) {
        updatePrestation(prestation.id, prestationData);
      } else {
        addPrestation(prestationData);
      }
      onSuccess();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la prestation:', error);
      setErrors({ submit: 'Une erreur est survenue lors de l\'enregistrement' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const serviceOptions = SERVICES.map(service => ({
    value: service.id,
    label: service.name
  }));

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
        label="Service"
        value={selectedServiceId}
        onChange={(e) => setSelectedServiceId(e.target.value)}
        options={serviceOptions}
        placeholder="Sélectionner un service"
        required
        icon={Tag}
        error={errors.service}
      />

      {/* Price */}
      <FormInput
        label="Prix (€)"
        type="number"
        value={price || ''}
        onChange={(e) => setPrice(Number(e.target.value) || 0)}
        placeholder="0.00"
        required
        icon={Euro}
        error={errors.price}
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
          disabled={!selectedServiceId || price <= 0}
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