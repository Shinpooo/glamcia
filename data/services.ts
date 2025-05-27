import { Service } from '../types';

export const SERVICES: Service[] = [
  // Ongles - Manucure
  {
    id: 'nail-mani-1',
    category: 'Ongles - Manucure',
    name: 'Vernis semi-permanent',
    basePrice: 30
  },
  {
    id: 'nail-mani-2',
    category: 'Ongles - Manucure',
    name: 'Gainage sur ongles naturels',
    basePrice: 35
  },
  {
    id: 'nail-mani-3',
    category: 'Ongles - Manucure',
    name: 'Pose en gel taille S/M',
    basePrice: 40
  },
  {
    id: 'nail-mani-4',
    category: 'Ongles - Manucure',
    name: 'Pose en gel taille M/L',
    basePrice: 45
  },
  {
    id: 'nail-mani-5',
    category: 'Ongles - Manucure',
    name: 'Dépose',
    basePrice: 10
  },
  {
    id: 'nail-mani-6',
    category: 'Ongles - Manucure',
    name: 'Retouche (2 à 3 semaines)',
    basePrice: 35
  },
  {
    id: 'nail-mani-7',
    category: 'Ongles - Manucure',
    name: 'Retouche (+ de 3 semaines)',
    basePrice: 40
  },

  // Ongles - Pédicure
  {
    id: 'nail-pedi-1',
    category: 'Ongles - Pédicure',
    name: 'Vernis semi-permanent',
    basePrice: 25
  },
  {
    id: 'nail-pedi-2',
    category: 'Ongles - Pédicure',
    name: 'Gel',
    basePrice: 30
  },
  {
    id: 'nail-pedi-3',
    category: 'Ongles - Pédicure',
    name: 'Supplément rallongement/reconstruction',
    basePrice: 10
  },
  {
    id: 'nail-pedi-4',
    category: 'Ongles - Pédicure',
    name: 'Dépose',
    basePrice: 10
  },

  // Spray Tan / Tanning
  {
    id: 'tan-1',
    category: 'Spray Tan / Tanning',
    name: 'Visage',
    basePrice: 10
  },
  {
    id: 'tan-2',
    category: 'Spray Tan / Tanning',
    name: 'Jambes complètes',
    basePrice: 20
  },
  {
    id: 'tan-3',
    category: 'Spray Tan / Tanning',
    name: 'Visage & haut du corps',
    basePrice: 30
  },
  {
    id: 'tan-4',
    category: 'Spray Tan / Tanning',
    name: 'Corps sans le visage',
    basePrice: 30
  },
  {
    id: 'tan-5',
    category: 'Spray Tan / Tanning',
    name: 'Corps et visage',
    basePrice: 35
  },

  // Maderothérapie
  {
    id: 'madero-1',
    category: 'Maderothérapie',
    name: 'Jambes & fessiers',
    basePrice: 60
  },
  {
    id: 'madero-2',
    category: 'Maderothérapie',
    name: 'Ventre complet',
    basePrice: 50
  },
  {
    id: 'madero-3',
    category: 'Maderothérapie',
    name: 'Visage',
    basePrice: 35
  },

  // Vacuslim 48
  {
    id: 'vacuslim-1',
    category: 'Vacuslim 48',
    name: 'Bas du corps (ventre, dos, fessiers, cuisses, mollets)',
    basePrice: 65
  },

  // Massage
  {
    id: 'massage-1',
    category: 'Massage',
    name: 'Massage relaxant',
    basePrice: 50
  },

  // Hair
  {
    id: 'hair-1',
    category: 'Hair',
    name: 'Lissage brésilien',
    basePrice: 150
  },
  {
    id: 'hair-2',
    category: 'Hair',
    name: 'Lissage nano indien',
    basePrice: 150
  },
  {
    id: 'hair-3',
    category: 'Hair',
    name: 'Lissage protéine de soie',
    basePrice: 140
  },
  {
    id: 'hair-4',
    category: 'Hair',
    name: 'Soin Diamond Botox',
    basePrice: 85
  },
  {
    id: 'hair-5',
    category: 'Hair',
    name: 'Lissage tanin',
    basePrice: 150
  },
  {
    id: 'hair-6',
    category: 'Hair',
    name: 'Soin Luxury Indien',
    basePrice: 85
  },

  // Blanchiment Dentaire
  {
    id: 'dental-1',
    category: 'Blanchiment Dentaire',
    name: 'Formule Ultra White',
    basePrice: 100
  },
  {
    id: 'dental-2',
    category: 'Blanchiment Dentaire',
    name: 'Formule Retouche',
    basePrice: 60
  }
];

export const getServicesByCategory = () => {
  const categories: { [key: string]: Service[] } = {};
  
  SERVICES.forEach(service => {
    if (!categories[service.category]) {
      categories[service.category] = [];
    }
    categories[service.category].push(service);
  });
  
  return categories;
};

export const getServiceById = (id: string): Service | undefined => {
  return SERVICES.find(service => service.id === id);
}; 