import React from 'react';
import { CreditCard, Banknote, Split, TrendingUp } from 'lucide-react';

interface PaymentStatsCardProps {
  totalCash: number;
  totalCard: number;
  cashPayments: number;
  cardPayments: number;
  mixedPayments: number;
  totalRevenue: number;
}

const PaymentStatsCard: React.FC<PaymentStatsCardProps> = ({
  totalCash,
  totalCard,
  cashPayments,
  cardPayments,
  mixedPayments,
  totalRevenue
}) => {
  const totalPayments = cashPayments + cardPayments + mixedPayments;
  const cashPercentage = totalRevenue > 0 ? (totalCash / totalRevenue) * 100 : 0;
  const cardPercentage = totalRevenue > 0 ? (totalCard / totalRevenue) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Répartition des paiements</h3>
        <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
          <TrendingUp className="h-5 w-5 text-purple-600" />
        </div>
      </div>

      {/* Total Revenue */}
      <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{totalRevenue}€</p>
          <p className="text-sm text-gray-600">Chiffre d'affaires total</p>
        </div>
      </div>

      {/* Payment Methods Breakdown */}
      <div className="space-y-4">
        {/* Cash */}
        <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Banknote className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-900">Espèces</p>
              <p className="text-sm text-green-700">{cashPayments} transaction{cashPayments > 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-green-900">{totalCash}€</p>
            <p className="text-sm text-green-700">{cashPercentage.toFixed(1)}%</p>
          </div>
        </div>

        {/* Card */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CreditCard className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-blue-900">Carte</p>
              <p className="text-sm text-blue-700">{cardPayments} transaction{cardPayments > 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-blue-900">{totalCard}€</p>
            <p className="text-sm text-blue-700">{cardPercentage.toFixed(1)}%</p>
          </div>
        </div>

        {/* Mixed */}
        {mixedPayments > 0 && (
          <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Split className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-purple-900">Paiements mixtes</p>
                <p className="text-sm text-purple-700">{mixedPayments} transaction{mixedPayments > 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-purple-900">
                {((totalCash + totalCard) - (totalRevenue - (totalCash + totalCard))).toFixed(0)}€
              </p>
              <p className="text-sm text-purple-700">Mixte</p>
            </div>
          </div>
        )}
      </div>

      {/* Visual Progress Bars */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Répartition par montant</span>
          <span>{totalPayments} paiement{totalPayments > 1 ? 's' : ''}</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div className="h-full flex">
            {cashPercentage > 0 && (
              <div 
                className="bg-gradient-to-r from-green-400 to-green-500 h-full"
                style={{ width: `${cashPercentage}%` }}
                title={`Espèces: ${cashPercentage.toFixed(1)}%`}
              />
            )}
            {cardPercentage > 0 && (
              <div 
                className="bg-gradient-to-r from-blue-400 to-blue-500 h-full"
                style={{ width: `${cardPercentage}%` }}
                title={`Carte: ${cardPercentage.toFixed(1)}%`}
              />
            )}
          </div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500">
          <span>Espèces ({cashPercentage.toFixed(1)}%)</span>
          <span>Carte ({cardPercentage.toFixed(1)}%)</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatsCard; 