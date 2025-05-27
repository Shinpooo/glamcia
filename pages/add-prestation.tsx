import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import { Save, ArrowLeft, Euro, FileText } from 'lucide-react';
import { SERVICES, getServicesByCategory, getServiceById } from '../data/services';
import { addPrestation } from '../utils/storage';
import { Prestation } from '../types';

const AddPrestation: React.FC = () => {
  const router = useRouter();
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [supplement, setSupplement] = useState<number>(0);
  const [date, setDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    // Set default date or date from query params
    const queryDate = router.query.date as string;
    const defaultDate = queryDate || format(new Date(), 'yyyy-MM-dd');
    setDate(defaultDate);
  }, [router.query.date]);

  const servicesByCategory = getServicesByCategory();
  const selectedService = getServiceById(selectedServiceId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedService) {
      alert('Veuillez sélectionner un service');
      return;
    }

    setIsSubmitting(true);

    const finalPrice = selectedService.basePrice + supplement;
    
    const newPrestation: Prestation = {
      id: Date.now().toString(),
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      serviceCategory: selectedService.category,
      basePrice: selectedService.basePrice,
      supplement,
      finalPrice,
      date,
      notes: notes.trim() || undefined
    };

    try {
      addPrestation(newPrestation);
      router.push('/');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la prestation:', error);
      alert('Erreur lors de l\'ajout de la prestation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={handleGoBack}
          className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
          aria-label="Retour"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nouvelle Prestation</h1>
          <p className="text-gray-600">Enregistrer une nouvelle prestation</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-pink-100 p-6 space-y-6">
        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
            Date de la prestation
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
            required
          />
        </div>

        {/* Service Selection */}
        <div>
          <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
            Service
          </label>
          <select
            id="service"
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
            required
          >
            <option value="">Sélectionner un service</option>
            {Object.entries(servicesByCategory).map(([category, services]) => (
              <optgroup key={category} label={category}>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - {service.basePrice}€
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Price Display */}
        {selectedService && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Prix de base:</span>
              <span className="font-medium text-gray-900">{selectedService.basePrice}€</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Supplément:</span>
              <span className="font-medium text-gray-900">{supplement}€</span>
            </div>
            <div className="border-t border-gray-200 pt-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">Prix final:</span>
                <span className="text-lg font-bold text-pink-600">
                  {selectedService.basePrice + supplement}€
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Supplement */}
        <div>
          <label htmlFor="supplement" className="block text-sm font-medium text-gray-700 mb-2">
            Supplément (€)
          </label>
          <div className="relative">
            <input
              type="number"
              id="supplement"
              value={supplement}
              onChange={(e) => setSupplement(Number(e.target.value) || 0)}
              min="0"
              step="0.01"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
              placeholder="0.00"
            />
            <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Ajoutez un supplément si nécessaire (ex: rallongement, complexité...)
          </p>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Notes (optionnel)
          </label>
          <div className="relative">
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors resize-none"
              placeholder="Ajouter des notes sur la prestation..."
            />
            <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex space-x-4 pt-4">
          <button
            type="button"
            onClick={handleGoBack}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !selectedServiceId}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Enregistrer</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPrestation; 