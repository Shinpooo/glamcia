import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Search, 
  Trash2, 
  Euro, 
  Calendar,
  FileText,
  Tag,
  ArrowUpDown,
  Edit3
} from 'lucide-react';
import { loadPrestations, deletePrestation } from '../utils/storage';
import { Prestation } from '../types';
import Link from 'next/link';

const PrestationsPage: React.FC = () => {
  const [prestations, setPrestations] = useState<Prestation[]>([]);
  const [filteredPrestations, setFilteredPrestations] = useState<Prestation[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [sortBy, setSortBy] = useState<'date' | 'price' | 'service'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      const data = loadPrestations();
      setPrestations(data);
      setFilteredPrestations(data);
      setIsLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    let filtered = [...prestations];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(prestation =>
        prestation.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prestation.serviceCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (prestation.notes && prestation.notes.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }



    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'service':
          comparison = a.serviceName.localeCompare(b.serviceName);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredPrestations(filtered);
  }, [prestations, searchTerm, sortBy, sortOrder]);

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette prestation ?')) {
      deletePrestation(id);
      const updatedPrestations = prestations.filter(p => p.id !== id);
      setPrestations(updatedPrestations);
    }
  };

  const handleSort = (newSortBy: 'date' | 'price' | 'service') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const totalRevenue = filteredPrestations.reduce((sum, p) => sum + p.price, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Historique des Prestations</h1>
        <p className="text-gray-600">
          {filteredPrestations.length} prestation{filteredPrestations.length > 1 ? 's' : ''} 
          {filteredPrestations.length > 0 && ` • ${totalRevenue}€ de revenus`}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
            />
          </div>



          {/* Sort */}
          <div className="flex space-x-2">
            <button
              onClick={() => handleSort('date')}
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'date' 
                  ? 'bg-pink-100 text-pink-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Date</span>
              {sortBy === 'date' && <ArrowUpDown className="h-3 w-3" />}
            </button>
            <button
              onClick={() => handleSort('price')}
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'price' 
                  ? 'bg-pink-100 text-pink-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Euro className="h-4 w-4" />
              <span>Prix</span>
              {sortBy === 'price' && <ArrowUpDown className="h-3 w-3" />}
            </button>
            <button
              onClick={() => handleSort('service')}
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'service' 
                  ? 'bg-pink-100 text-pink-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Tag className="h-4 w-4" />
              <span>Service</span>
              {sortBy === 'service' && <ArrowUpDown className="h-3 w-3" />}
            </button>
          </div>
        </div>
      </div>

      {/* Prestations List */}
      {filteredPrestations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-12 text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">
            {prestations.length === 0 
              ? 'Aucune prestation enregistrée' 
              : 'Aucune prestation ne correspond à vos critères'
            }
          </p>
          {searchTerm ? (
            <button
              onClick={() => {
                setSearchTerm('');
              }}
              className="text-pink-600 hover:text-pink-700 font-medium"
            >
              Effacer les filtres
            </button>
          ) : null}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPrestations.map((prestation) => (
            <div
              key={prestation.id}
              className="bg-white rounded-xl shadow-sm border border-pink-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {prestation.serviceName}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(parseISO(prestation.date), 'EEEE d MMMM yyyy', { locale: fr })}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Euro className="h-4 w-4" />
                      <span className="text-lg font-bold text-pink-600">
                        {prestation.price}€
                      </span>
                    </div>
                  </div>

                  {prestation.notes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                        <p className="text-sm text-gray-700">{prestation.notes}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="ml-4 flex space-x-2">
                  <Link
                    href={`/edit-prestation/${prestation.id}`}
                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    aria-label="Modifier la prestation"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(prestation.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Supprimer la prestation"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PrestationsPage; 