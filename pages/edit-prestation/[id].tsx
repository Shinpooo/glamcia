import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { getPrestationById, deletePrestation } from '../../utils/supabase-storage';
import { Prestation, getPrestationTotal } from '../../types';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import PrestationForm from '../../components/PrestationForm';

const EditPrestationPage: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { id } = router.query;
  const [prestation, setPrestation] = useState<Prestation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!id || !session?.user?.email) return;

    const loadPrestation = async () => {
      try {
        const userEmail = session.user!.email!;
        const foundPrestation = await getPrestationById(Number(id), userEmail);
        
        if (foundPrestation) {
          setPrestation(foundPrestation);
        } else {
          router.push('/prestations');
        }
      } catch (error) {
        console.error('Error loading prestation:', error);
        router.push('/prestations');
      }
      
      setIsLoading(false);
    };

    loadPrestation();
  }, [id, router, session]);

  const handleEditSuccess = () => {
    router.push('/prestations');
  };

  const handleEditCancel = () => {
    setShowForm(false);
  };

  const handleDelete = async () => {
    if (!prestation || !session?.user?.email) return;
    
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette prestation ?')) {
      try {
        const userEmail = session.user.email;
        const success = await deletePrestation(prestation.id, userEmail);
        
        if (success) {
          router.push('/prestations');
        } else {
          alert('Erreur lors de la suppression');
        }
      } catch (error) {
        console.error('Error deleting prestation:', error);
        alert('Erreur lors de la suppression');
      }
    }
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

  if (showForm) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowForm(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Retour"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Modifier la prestation</h1>
            <p className="text-gray-600">
              Prestation du {format(new Date(prestation.date), 'dd/MM/yyyy')}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
          <PrestationForm
            prestation={prestation}
            onSuccess={handleEditSuccess}
            onCancel={handleEditCancel}
          />
        </div>
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
          <h1 className="text-3xl font-bold text-gray-900">Détails de la prestation</h1>
          <p className="text-gray-600">
            Prestation du {format(new Date(prestation.date), 'dd/MM/yyyy')}
          </p>
        </div>
      </div>

      {/* Prestation Details */}
      <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Service</label>
            <p className="text-lg font-semibold text-gray-900">{prestation.serviceName}</p>
            <p className="text-sm text-gray-600">{prestation.serviceCategory}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Montant total</label>
            <p className="text-lg font-semibold text-pink-600">{getPrestationTotal(prestation)}€</p>
            <div className="text-sm text-gray-600">
              {prestation.paymentMethod === 'cash' && 'Paiement en espèces'}
              {prestation.paymentMethod === 'card' && 'Paiement par carte'}
              {prestation.paymentMethod === 'mixed' && (
                <span>
                  {prestation.cashAmount}€ espèces + {prestation.cardAmount}€ carte
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <p className="text-lg text-gray-900">{format(new Date(prestation.date), 'dd/MM/yyyy')}</p>
          </div>

          {prestation.notes && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{prestation.notes}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => setShowForm(true)}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Modifier</span>
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>Supprimer</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPrestationPage; 