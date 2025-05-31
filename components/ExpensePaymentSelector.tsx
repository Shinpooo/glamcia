import React from 'react';
import { CreditCard, Banknote } from 'lucide-react';
import { PaymentDetails } from '../types';

interface ExpensePaymentSelectorProps {
  value: PaymentDetails;
  onChange: (details: PaymentDetails) => void;
  error?: string;
}

const ExpensePaymentSelector: React.FC<ExpensePaymentSelectorProps> = ({
  value,
  onChange,
  error
}) => {
  // Prevent mouse wheel scrolling on number inputs
  const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    e.preventDefault();
    (e.target as HTMLInputElement).blur();
  };

  const handleMethodChange = (method: 'cash' | 'card') => {
    // For expenses, only cash or card (no mixed)
    onChange({
      method,
      cashAmount: method === 'cash' ? value.cashAmount + value.cardAmount : 0,
      cardAmount: method === 'card' ? value.cashAmount + value.cardAmount : 0
    });
  };

  const handleAmountChange = (amount: number) => {
    if (value.method === 'cash') {
      onChange({
        ...value,
        cashAmount: amount,
        cardAmount: 0
      });
    } else {
      onChange({
        ...value,
        cashAmount: 0,
        cardAmount: amount
      });
    }
  };

  const totalAmount = value.cashAmount + value.cardAmount;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Mode de paiement de la dépense *
        </label>
        
        {/* Payment Method Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            type="button"
            onClick={() => handleMethodChange('cash')}
            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
              value.method === 'cash'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-green-300 hover:bg-green-50'
            }`}
          >
            <div className="flex flex-col items-center space-y-2">
              <Banknote className={`h-6 w-6 ${
                value.method === 'cash' ? 'text-green-600' : 'text-gray-400'
              }`} />
              <span className="text-sm font-medium">Espèces</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleMethodChange('card')}
            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
              value.method === 'card'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50'
            }`}
          >
            <div className="flex flex-col items-center space-y-2">
              <CreditCard className={`h-6 w-6 ${
                value.method === 'card' ? 'text-blue-600' : 'text-gray-400'
              }`} />
              <span className="text-sm font-medium">Carte</span>
            </div>
          </button>
        </div>
      </div>

      {/* Amount Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Montant (€) *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {value.method === 'cash' ? (
              <Banknote className="h-4 w-4 text-green-500" />
            ) : (
              <CreditCard className="h-4 w-4 text-blue-500" />
            )}
          </div>
          <input
            type="number"
            step="0.01"
            min="0"
            value={totalAmount || ''}
            onChange={(e) => handleAmountChange(parseFloat(e.target.value) || 0)}
            onWheel={handleWheel}
            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors ${
              error ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="0.00"
          />
        </div>
        
        {/* Payment Summary */}
        <div className="mt-2 text-sm text-gray-600">
          {value.method === 'cash' && totalAmount > 0 && (
            <span className="text-green-600">
              💵 Paiement en espèces : {totalAmount}€
            </span>
          )}
          {value.method === 'card' && totalAmount > 0 && (
            <span className="text-blue-600">
              💳 Paiement par carte : {totalAmount}€
            </span>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};

export default ExpensePaymentSelector; 