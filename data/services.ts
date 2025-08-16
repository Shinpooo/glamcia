// Liste des catégories de services
export const SERVICE_CATEGORIES: string[] = [
  'Manucure & Pédicure',
  'Spray-Tanning',
  'Blanchiment dentaire',
  'Soins & Lissages',
  'Produits',
  'Divers',
  'Formation ongles',
  'Formation spray tan',
  'Formation soin-lissage',
  'Formation blanchiment dentaire'
];

export const getServiceCategories = (): string[] => {
  return SERVICE_CATEGORIES;
};

export const isValidServiceCategory = (category: string): boolean => {
  return SERVICE_CATEGORIES.includes(category);
}; 