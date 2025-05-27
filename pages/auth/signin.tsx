import React from 'react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { signIn, getProviders } from 'next-auth/react';
import { authOptions } from '../api/auth/[...nextauth]';
import { Sparkles, Shield, Star } from 'lucide-react';
import Head from 'next/head';

interface Provider {
  id: string;
  name: string;
  type: string;
  signinUrl: string;
  callbackUrl: string;
}

interface SignInProps {
  providers: Record<string, Provider>;
}

export default function SignIn({ providers }: SignInProps) {
  return (
    <>
      <Head>
        <title>Connexion - Glamcia</title>
        <meta name="description" content="Connectez-vous à votre salon d'esthétique Glamcia" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Logo et titre */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Glamcia</h1>
            <p className="text-gray-600">Salon d&apos;Esthétique</p>
          </div>

          {/* Carte de connexion */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Connexion</h2>
              <p className="text-gray-600">Accédez à votre espace de gestion</p>
            </div>

            {/* Bouton Google */}
            {providers && providers.google && (
              <button
                onClick={() => signIn('google', { callbackUrl: '/' })}
                className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-white border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex items-center justify-center w-6 h-6">
                  <svg viewBox="0 0 24 24" className="w-6 h-6">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
                <span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                  Continuer avec Google
                </span>
              </button>
            )}

            {/* Informations de sécurité */}
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-blue-900 mb-1">Accès sécurisé</h3>
                  <p className="text-xs text-blue-700">
                    Seul votre compte Gmail autorisé peut accéder à cette application.
                  </p>
                </div>
              </div>
            </div>

            {/* Fonctionnalités */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Star className="h-4 w-4 text-pink-500" />
                <span>Gestion des prestations et revenus</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Star className="h-4 w-4 text-pink-500" />
                <span>Suivi des dépenses et bénéfices</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Star className="h-4 w-4 text-pink-500" />
                <span>Analyses et graphiques détaillés</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              © 2024 Glamcia. Application de gestion pour salon d&apos;esthétique.
            </p>
          </div>
        </div>
      </div>
    </>
      );
  }
  
  export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  // Si l'utilisateur est déjà connecté, rediriger vers la page d'accueil
  if (session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const providers = await getProviders();

  return {
    props: {
      providers: providers ?? {},
    },
  };
}; 