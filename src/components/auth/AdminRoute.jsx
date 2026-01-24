import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AdminRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await base44.auth.isAuthenticated();
        if (!authenticated) {
          base44.auth.redirectToLogin(window.location.pathname);
          return;
        }
        
        const userData = await base44.auth.me();
        if (userData.role !== 'admin') {
          setUser(userData);
          setLoading(false);
          return;
        }
        
        setUser(userData);
        setLoading(false);
      } catch (error) {
        base44.auth.redirectToLogin(window.location.pathname);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-slate-600">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Acesso Restrito</h2>
          <p className="text-slate-600 mb-8">
            Esta área é restrita apenas para administradores do sistema. 
            Apenas administradores podem gerenciar e fazer upload de dados.
          </p>
          <Link to={createPageUrl('Home')}>
            <Button className="bg-emerald-500 hover:bg-emerald-600">
              Voltar ao Início
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return children;
}