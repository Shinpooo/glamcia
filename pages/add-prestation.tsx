import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import { Save, ArrowLeft, Euro, FileText } from 'lucide-react';
import { SERVICES, getServiceById } from '../data/services';
import { addPrestation } from '../utils/supabase-storage';
import { Prestation } from '../types';
import { useSession } from 'next-auth/react';

const AddPrestation: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    // Set default date or date from query params
    const queryDate = router.query.date as string;
    const defaultDate = queryDate || format(new Date(), 'yyyy-MM-dd');
    setDate(defaultDate);
  }, [router.query.date]);

  const selectedService = getServiceById(selectedServiceId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedService) {
      alert('Veuillez sélectionner un service');
      return;
    }

    if (!session?.user?.email) {
      alert('Vous devez être connecté pour ajouter une prestation');
      return;
    }

    setIsSubmitting(true);
    
    // Create a basic prestation with cash payment - user will edit payment details later
    const newPrestation: Prestation = {
      id: 0,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      serviceCategory: selectedService.category,
      date,
      notes: notes.trim() || undefined,
      paymentMethod: 'cash',
      cashAmount: 0, // Will be set in the form
      cardAmount: 0
    };

    try {
      const success = await addPrestation(newPrestation, session.user.email);
      if (success) {
        router.push('/history');
      } else {
        alert('Erreur lors de l\'ajout de la prestation');
      }
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
          <p className="text-gray-600">Utilisez plutôt le formulaire complet pour une meilleure expérience</p>
        </div>
      </div>

      {/* Recommendation Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Euro className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Recommandation
            </h3>
            <p className="text-blue-700 mb-4">
              Pour une meilleure expérience avec la gestion des paiements (espèces, carte, mixte), 
              nous recommandons d'utiliser le formulaire complet depuis le dashboard ou l'historique.
            </p>
            <button
              onClick={() => router.push('/history')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Aller à l'historique
            </button>
          </div>
        </div>
      </div>

      {/* Simplified Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-pink-100 p-6 space-y-6">
        <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-sm text-yellow-800">
            ⚠️ Ce formulaire simplifié créera une prestation avec un montant de 0€. 
            Vous devrez la modifier ensuite pour ajouter le montant et le mode de paiement.
          </p>
        </div>

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
            {SERVICES.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
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
            <Save className="h-4 w-4" />
            <span>{isSubmitting ? 'Enregistrement...' : 'Créer (à compléter)'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPrestation; 