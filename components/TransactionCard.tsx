import React from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Calendar, 
  Euro, 
  FileText, 
  Edit3, 
  Trash2, 
  TrendingUp, 
  TrendingDown 
} from 'lucide-react';
import { Transaction } from '../types';
import PaymentMethodDisplay from './PaymentMethodDisplay';

interface TransactionCardProps {
  transaction: Transaction;
  onDelete: (transaction: Transaction) => void;
  onEdit: (transaction: Transaction) => void;
}

const TransactionCard: React.FC<TransactionCardProps> = ({ transaction, onDelete, onEdit }) => {
  const handleDelete = () => {
    onDelete(transaction);
  };

  const handleEdit = () => {
    onEdit(transaction);
  };

  return (
    <div className="group relative bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-3 rounded-xl ${
              transaction.type === 'revenue' 
                ? 'bg-gradient-to-br from-green-100 to-emerald-100' 
                : 'bg-gradient-to-br from-red-100 to-rose-100'
            } group-hover:scale-110 transition-transform`}>
              {transaction.type === 'revenue' ? (
                <TrendingUp className="h-6 w-6 text-green-600" />
              ) : (
                <TrendingDown className="h-6 w-6 text-red-600" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-pink-700 transition-colors">
                {transaction.description}
              </h3>
              <div className="flex items-center space-x-3 mt-1">
                <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
                  transaction.type === 'revenue'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {transaction.type === 'revenue' ? 'Revenu' : 'Dépense'}
                </span>
                <span className="text-sm text-gray-500">{transaction.category}</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {format(parseISO(transaction.date), 'EEEE d MMMM', { locale: fr })}
                </p>
                <p className="text-xs text-gray-500">
                  {format(parseISO(transaction.date), 'yyyy')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
              <Euro className={`h-5 w-5 ${
                transaction.type === 'revenue' ? 'text-green-500' : 'text-red-500'
              }`} />
              <div>
                <p className={`text-lg font-bold ${
                  transaction.type === 'revenue' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'revenue' ? '+' : '-'}{transaction.amount}€
                </p>
                <p className="text-xs text-gray-500">Montant</p>
              </div>
            </div>
          </div>

          {/* Payment Method Display for All Transactions */}
          {transaction.paymentMethod && (
            <div className="mb-4">
              <PaymentMethodDisplay
                paymentMethod={transaction.paymentMethod}
                cashAmount={transaction.cashAmount || 0}
                cardAmount={transaction.cardAmount || 0}
                totalAmount={transaction.amount}
                size="md"
                showAmounts={true}
              />
            </div>
          )}

          {transaction.notes && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="flex items-start space-x-3">
                <FileText className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">Notes</p>
                  <p className="text-sm text-blue-700">{transaction.notes}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="ml-6 flex flex-col space-y-2">
          <button
            onClick={handleEdit}
            className="group/btn p-3 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110"
            aria-label={`Modifier ${transaction.type === 'revenue' ? 'la prestation' : 'la dépense'}`}
          >
            <Edit3 className="h-5 w-5" />
          </button>
          <button
            onClick={handleDelete}
            className="group/btn p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110"
            aria-label={`Supprimer ${transaction.type === 'revenue' ? 'la prestation' : 'la dépense'}`}
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Hover effect border */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-pink-200 rounded-2xl transition-colors pointer-events-none"></div>
    </div>
  );
};

export default TransactionCard; 