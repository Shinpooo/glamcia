import React from 'react';
import { CreditCard, Banknote, Split } from 'lucide-react';
import { PaymentMethod } from '../types';

interface PaymentMethodDisplayProps {
  paymentMethod: PaymentMethod;
  cashAmount: number;
  cardAmount: number;
  totalAmount: number;
  size?: 'sm' | 'md' | 'lg';
  showAmounts?: boolean;
}

const PaymentMethodDisplay: React.FC<PaymentMethodDisplayProps> = ({
  paymentMethod,
  cashAmount,
  cardAmount,
  totalAmount,
  size = 'md',
  showAmounts = true
}) => {
  const getIcon = () => {
    const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';
    
    switch (paymentMethod) {
      case 'cash':
        return <Banknote className={`${iconSize} text-green-600`} />;
      case 'card':
        return <CreditCard className={`${iconSize} text-blue-600`} />;
      case 'mixed':
        return <Split className={`${iconSize} text-purple-600`} />;
      default:
        return <Banknote className={`${iconSize} text-gray-600`} />;
    }
  };

  const getLabel = () => {
    switch (paymentMethod) {
      case 'cash':
        return 'Espèces';
      case 'card':
        return 'Carte';
      case 'mixed':
        return 'Mixte';
      default:
        return 'Inconnu';
    }
  };

  const getColors = () => {
    switch (paymentMethod) {
      case 'cash':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-700'
        };
      case 'card':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-700'
        };
      case 'mixed':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          text: 'text-purple-700'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-700'
        };
    }
  };

  const colors = getColors();
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs';
  const padding = size === 'sm' ? 'px-2 py-1' : size === 'lg' ? 'px-3 py-2' : 'px-2 py-1';

  if (paymentMethod === 'mixed' && showAmounts) {
    return (
      <div className={`inline-flex items-center space-x-1 ${padding} ${colors.bg} ${colors.border} border rounded-lg ${colors.text}`}>
        {getIcon()}
        <span className={`font-medium ${textSize}`}>{getLabel()}</span>
        <span className={`${textSize} opacity-75`}>
          ({cashAmount}€ + {cardAmount}€)
        </span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center space-x-1 ${padding} ${colors.bg} ${colors.border} border rounded-lg ${colors.text}`}>
      {getIcon()}
      <span className={`font-medium ${textSize}`}>{getLabel()}</span>
      {showAmounts && (
        <span className={`${textSize} opacity-75`}>
          {totalAmount}€
        </span>
      )}
    </div>
  );
};

export default PaymentMethodDisplay; 