import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Sparkles } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Pages publiques qui ne nécessitent pas d'authentification
  const publicPages = ['/auth/signin', '/auth/error'];
  const isPublicPage = publicPages.includes(router.pathname);

  useEffect(() => {
    if (status === 'loading') return; // Encore en cours de chargement

    // Si pas de session et pas sur une page publique, rediriger vers la connexion
    if (!session && !isPublicPage) {
      router.push('/auth/signin');
      return;
    }

    // Si session existe et sur une page publique, rediriger vers l'accueil
    if (session && isPublicPage) {
      router.push('/');
      return;
    }
  }, [session, status, router, isPublicPage]);

  // Afficher un loader pendant le chargement de la session
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl mb-4 shadow-lg animate-pulse">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Glamcia</h2>
          <p className="text-gray-600">Chargement...</p>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Si pas de session et pas sur une page publique, ne rien afficher (redirection en cours)
  if (!session && !isPublicPage) {
    return null;
  }

  // Si session existe et sur une page publique, ne rien afficher (redirection en cours)
  if (session && isPublicPage) {
    return null;
  }

  // Afficher le contenu si tout est OK
  return <>{children}</>;
};

export default AuthGuard; 