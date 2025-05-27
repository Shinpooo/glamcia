import React from 'react';
import { useRouter } from 'next/router';
import { AlertTriangle, ArrowLeft, Shield } from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';

const AuthError: React.FC = () => {
  const router = useRouter();
  const { error } = router.query;

  const getErrorMessage = (error: string | string[] | undefined) => {
    switch (error) {
      case 'AccessDenied':
        return {
          title: 'Accès refusé',
          message: 'Votre compte Gmail n\'est pas dans la liste des emails autorisés.',
          description: 'Seuls les comptes Gmail autorisés peuvent accéder à cette interface de gestion du salon.'
        };
      case 'Configuration':
        return {
          title: 'Erreur de configuration',
          message: 'Il y a un problème avec la configuration de l\'authentification.',
          description: 'Veuillez contacter l\'administrateur.'
        };
      default:
        return {
          title: 'Erreur d\'authentification',
          message: 'Une erreur s\'est produite lors de la connexion.',
          description: 'Veuillez réessayer ou contacter le support.'
        };
    }
  };

  const errorInfo = getErrorMessage(error);

  return (
    <>
      <Head>
        <title>Erreur d&apos;authentification - Glamcia</title>
        <meta name="description" content="Erreur lors de la connexion à Glamcia" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Icône d'erreur */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl mb-4 shadow-lg">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Oops!</h1>
            <p className="text-gray-600">Problème d&apos;authentification</p>
          </div>

          {/* Carte d'erreur */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{errorInfo.title}</h2>
              <p className="text-gray-600 mb-4">{errorInfo.message}</p>
              <p className="text-sm text-gray-500">{errorInfo.description}</p>
            </div>

            {/* Informations de sécurité */}
            <div className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-amber-900 mb-1">Accès restreint</h3>
                  <p className="text-xs text-amber-700">
                    Cette application est réservée aux personnes autorisées du salon Glamcia. 
                    Seuls les comptes Gmail de la liste autorisée peuvent y accéder.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Link
                href="/auth/signin"
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Retour à la connexion</span>
              </Link>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
              >
                Réessayer
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              Besoin d&apos;aide ? Contactez le propriétaire du salon.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthError; 