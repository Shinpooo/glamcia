import { Service } from '../types';

export const SERVICES: Service[] = [
  {
    id: 'manicure',
    category: 'Manucure',
    name: 'Manucure'
  },
  {
    id: 'pedicure',
    category: 'Pédicure',
    name: 'Pédicure'
  },
  {
    id: 'spray-tanning',
    category: 'Spray-Tanning',
    name: 'Spray-Tanning'
  },
  {
    id: 'blanchiment-dentaire',
    category: 'Blanchiment dentaire',
    name: 'Blanchiment dentaire'
  },
  {
    id: 'soins',
    category: 'Soins',
    name: 'Soins'
  },
  {
    id: 'lissages',
    category: 'Lissages',
    name: 'Lissages'
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