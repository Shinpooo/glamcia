import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { getPrestationById, updatePrestation, deletePrestation } from '../../utils/storage';
import { SERVICES } from '../../data/services';
import { Prestation, Service } from '../../types';

const EditPrestationPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [prestation, setPrestation] = useState<Prestation | null>(null);
  const [formData, setFormData] = useState({
    serviceId: '',
    serviceName: '',
    serviceCategory: '',
    price: 0,
    date: '',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (id && typeof id === 'string') {
      const foundPrestation = getPrestationById(id);
      if (foundPrestation) {
        setPrestation(foundPrestation);
        setFormData({
          serviceId: foundPrestation.serviceId,
          serviceName: foundPrestation.serviceName,
          serviceCategory: foundPrestation.serviceCategory,
          price: foundPrestation.price,
          date: foundPrestation.date,
          notes: foundPrestation.notes || ''
        });
      } else {
        router.push('/prestations');
      }
      setIsLoading(false);
    }
  }, [id, router]);

  const handleServiceChange = (serviceId: string) => {
    const selectedService = SERVICES.find((s: Service) => s.id === serviceId);
    if (selectedService) {
      setFormData(prev => ({
        ...prev,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        serviceCategory: selectedService.category
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prestation) return;

    if (formData.price <= 0) {
      alert('Veuillez entrer un prix valide');
      return;
    }

    setIsSaving(true);
    
    const updatedPrestation: Prestation = {
      ...prestation,
      serviceId: formData.serviceId,
      serviceName: formData.serviceName,
      serviceCategory: formData.serviceCategory,
      price: formData.price,
      date: formData.date,
      notes: formData.notes
    };

    updatePrestation(prestation.id, updatedPrestation);
    
    setTimeout(() => {
      router.push('/prestations');
    }, 500);
  };

  const handleDelete = () => {
    if (!prestation) return;
    
    deletePrestation(prestation.id);
    router.push('/prestations');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!prestation) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Prestation non trouvée</h1>
        <Link
          href="/prestations"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Retour à l&apos;historique</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          href="/prestations"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Retour"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Modifier la prestation</h1>
          <p className="text-gray-600">
            Prestation du {format(new Date(prestation.date), 'dd/MM/yyyy')}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Selection */}
          <div>
            <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
              Service *
            </label>
            <select
              id="service"
              value={formData.serviceId}
              onChange={(e) => handleServiceChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              required
            >
              <option value="">Sélectionner un service</option>
              {SERVICES.map((service: Service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
              Prix (€) *
            </label>
            <div className="relative">
              <input
                type="number"
                id="price"
                value={formData.price || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent pr-8"
                min="0"
                step="0.01"
                required
              />
              <span className="absolute right-3 top-2 text-gray-500">€</span>
            </div>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optionnel)
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Ajouter des notes sur cette prestation..."
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={isSaving || formData.price <= 0}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
            </button>
            
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Supprimer</span>
            </button>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirmer la suppression
            </h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer cette prestation ? Cette action est irréversible.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditPrestationPage; 