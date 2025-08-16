import { ExpenseCategory } from '../types';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  {
    id: 'fournisseur-ongle',
    name: 'Fournisseur ongle'
  },
  {
    id: 'fournisseur-cheveux',
    name: 'Fournisseur cheveux'
  },
  {
    id: 'fournisseur-spray-tan',
    name: 'Fournisseur spray tan'
  },
  {
    id: 'fournisseur-blanchiment',
    name: 'Fournisseur blanchiment'
  },
  {
    id: 'amenagement-salon',
    name: 'Aménagement du salon'
  },
  {
    id: 'formation-ongles',
    name: 'Formation ongles'
  },
  {
    id: 'formation-spray-tan',
    name: 'Formation spray tan'
  },
  {
    id: 'formation-soin-lissage',
    name: 'Formation soin-lissage'
  },
  {
    id: 'formation-blanchiment-dentaire',
    name: 'Formation blanchiment dentaire'
  },
  {
    id: 'produits',
    name: 'Produits'
  },
  {
    id: 'divers',
    name: 'Divers'
  }
];

export const getExpenseCategoryById = (id: string): ExpenseCategory | undefined => {
  return EXPENSE_CATEGORIES.find(category => category.id === id);
}; 