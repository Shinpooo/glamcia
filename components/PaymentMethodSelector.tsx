import React, { useState, useEffect } from 'react';
import { CreditCard, Banknote, Split, Euro } from 'lucide-react';
import { PaymentMethod, PaymentDetails } from '../types';

interface PaymentMethodSelectorProps {
  value: PaymentDetails;
  onChange: (paymentDetails: PaymentDetails) => void;
  error?: string;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  value,
  onChange,
  error
}) => {
  const [localCashAmount, setLocalCashAmount] = useState<string>(value.cashAmount.toString());
  const [localCardAmount, setLocalCardAmount] = useState<string>(value.cardAmount.toString());

  useEffect(() => {
    setLocalCashAmount(value.cashAmount.toString());
    setLocalCardAmount(value.cardAmount.toString());
  }, [value.cashAmount, value.cardAmount]);

  const handleMethodChange = (method: PaymentMethod) => {
    // Reset amounts when changing method
    const newPaymentDetails: PaymentDetails = {
      method,
      cashAmount: 0,
      cardAmount: 0
    };

    setLocalCashAmount('0');
    setLocalCardAmount('0');
    onChange(newPaymentDetails);
  };

  const handleCashAmountChange = (cashStr: string) => {
    setLocalCashAmount(cashStr);
    const cashAmount = parseFloat(cashStr) || 0;
    
    onChange({
      method: value.method,
      cashAmount,
      cardAmount: value.cardAmount
    });
  };

  const handleCardAmountChange = (cardStr: string) => {
    setLocalCardAmount(cardStr);
    const cardAmount = parseFloat(cardStr) || 0;
    
    onChange({
      method: value.method,
      cashAmount: value.cashAmount,
      cardAmount
    });
  };

  const totalAmount = value.cashAmount + value.cardAmount;

  return (
    <div className="space-y-6">
      {/* Step 1: Payment Method Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          1. Sélectionnez le mode de paiement *
        </label>

        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => handleMethodChange('cash')}
            className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
              value.method === 'cash'
                ? 'border-green-500 bg-green-50 text-green-700 shadow-md'
                : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Banknote className="h-6 w-6 mb-2" />
            <span className="text-sm font-medium">Espèces</span>
          </button>

          <button
            type="button"
            onClick={() => handleMethodChange('card')}
            className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
              value.method === 'card'
                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <CreditCard className="h-6 w-6 mb-2" />
            <span className="text-sm font-medium">Carte</span>
          </button>

          <button
            type="button"
            onClick={() => handleMethodChange('mixed')}
            className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
              value.method === 'mixed'
                ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-md'
                : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Split className="h-6 w-6 mb-2" />
            <span className="text-sm font-medium">Mixte</span>
          </button>
        </div>
      </div>

      {/* Step 2: Amount Entry */}
      {value.method && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            2. Saisissez le{value.method === 'mixed' ? 's' : ''} montant{value.method === 'mixed' ? 's' : ''} *
          </label>

          <div className="space-y-4">
            {/* Cash Amount - Show for cash and mixed */}
            {(value.method === 'cash' || value.method === 'mixed') && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Montant en espèces
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={localCashAmount}
                    onChange={(e) => handleCashAmountChange(e.target.value)}
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg font-medium"
                    placeholder="0.00"
                  />
                  <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
            )}

            {/* Card Amount - Show for card and mixed */}
            {(value.method === 'card' || value.method === 'mixed') && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Montant par carte
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={localCardAmount}
                    onChange={(e) => handleCardAmountChange(e.target.value)}
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium"
                    placeholder="0.00"
                  />
                  <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
            )}

            {/* Total Display for Mixed Payments */}
            {value.method === 'mixed' && (
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Split className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">Total de la prestation</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-purple-900">{totalAmount.toFixed(2)}€</p>
                    <p className="text-xs text-purple-700">
                      {value.cashAmount.toFixed(2)}€ espèces + {value.cardAmount.toFixed(2)}€ carte
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Total Display for Single Payment Methods */}
            {value.method !== 'mixed' && totalAmount > 0 && (
              <div className={`rounded-xl p-4 border ${
                value.method === 'cash' 
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                  : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {value.method === 'cash' ? (
                      <Banknote className="h-5 w-5 text-green-600" />
                    ) : (
                      <CreditCard className="h-5 w-5 text-blue-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      value.method === 'cash' ? 'text-green-900' : 'text-blue-900'
                    }`}>
                      Total de la prestation
                    </span>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${
                      value.method === 'cash' ? 'text-green-900' : 'text-blue-900'
                    }`}>
                      {totalAmount.toFixed(2)}€
                    </p>
                    <p className={`text-xs ${
                      value.method === 'cash' ? 'text-green-700' : 'text-blue-700'
                    }`}>
                      Paiement par {value.method === 'cash' ? 'espèces' : 'carte'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector; 