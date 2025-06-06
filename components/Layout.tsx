import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import { Calendar, Plus, BarChart3, History, Sparkles, Minus, X, LogOut, User } from 'lucide-react';
import Modal from './Modal';
import PrestationForm from './PrestationForm';
import ExpenseForm from './ExpenseForm';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isPrestationModalOpen, setIsPrestationModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const navigation = [
    { name: 'Tableau de bord', href: '/', icon: BarChart3 },
    { name: 'Historique', href: '/history', icon: History },
    { name: 'Calendrier', href: '/calendar', icon: Calendar },
  ];

  const isActive = (href: string) => {
    return router.pathname === href;
  };

  const handlePrestationSuccess = () => {
    setIsPrestationModalOpen(false);
    setIsMenuOpen(false);
    // Refresh the page to show updated data
    router.reload();
  };

  const handleExpenseSuccess = () => {
    setIsExpenseModalOpen(false);
    setIsMenuOpen(false);
    // Refresh the page to show updated data
    router.reload();
  };

  const handlePrestationClick = () => {
    setIsMenuOpen(false);
    setIsPrestationModalOpen(true);
  };

  const handleExpenseClick = () => {
    setIsMenuOpen(false);
    setIsExpenseModalOpen(true);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isMenuOpen || isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, isUserMenuOpen]);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl group-hover:scale-105 transition-transform">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Glamcia</h1>
                <p className="text-xs text-gray-500">Salon d&apos;esthétique</p>
              </div>
            </Link>
            {session && (
              <div className="flex items-center space-x-4">
                <nav className="hidden md:flex items-center space-x-1">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          isActive(item.href)
                            ? 'bg-pink-100 text-pink-700 shadow-sm'
                            : 'text-gray-600 hover:text-pink-600 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>

                {/* User Menu */}
                <div ref={userMenuRef} className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-pink-600 hover:bg-gray-100 transition-all"
                  >
                    {session.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt="Profile"
                        width={24}
                        height={24}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">{session.user?.name?.split(' ')[0]}</span>
                  </button>

                  {/* User Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                        <p className="text-xs text-gray-500">{session.user?.email}</p>
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors w-full text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Se déconnecter</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      {session && (
        <nav className="md:hidden bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex space-x-1 py-2 overflow-x-auto">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all min-w-0 ${
                      isActive(item.href)
                        ? 'bg-pink-100 text-pink-700'
                        : 'text-gray-600 hover:text-pink-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Floating Action Button */}
      {session && (
        <div className="fixed bottom-6 right-6 z-50">
          <div ref={menuRef} className="relative">
            {/* Quick Actions Menu */}
            {isMenuOpen && (
              <div className="absolute bottom-16 right-0 mb-2 animate-in slide-in-from-bottom-2 fade-in duration-200">
                <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-2 min-w-[200px]">
                  <button
                    onClick={handlePrestationClick}
                    className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-700 rounded-lg transition-colors w-full text-left"
                  >
                    <div className="p-2 bg-pink-100 rounded-lg">
                      <Plus className="h-4 w-4 text-pink-600" />
                    </div>
                    <span className="font-medium">Nouvelle Prestation</span>
                  </button>
                  <button
                    onClick={handleExpenseClick}
                    className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 rounded-lg transition-colors w-full text-left"
                  >
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Minus className="h-4 w-4 text-orange-600" />
                    </div>
                    <span className="font-medium">Nouvelle Dépense</span>
                  </button>
                </div>
              </div>
            )}
            
            <button 
              onClick={toggleMenu}
              className={`bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${
                isMenuOpen ? 'rotate-45' : ''
              }`}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Plus className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <Modal
        isOpen={isPrestationModalOpen}
        onClose={() => setIsPrestationModalOpen(false)}
        title="Nouvelle Prestation"
        size="lg"
      >
        <PrestationForm
          onSuccess={handlePrestationSuccess}
          onCancel={() => setIsPrestationModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="Nouvelle Dépense"
        size="lg"
      >
        <ExpenseForm
          onSuccess={handleExpenseSuccess}
          onCancel={() => setIsExpenseModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default Layout; 