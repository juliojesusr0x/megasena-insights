import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Home, BarChart3, Sparkles, Database, Menu, X, 
  TrendingUp, AlertTriangle 
} from 'lucide-react';

const navigation = [
  { name: 'Início', href: 'Home', icon: Home },
  { name: 'Análises', href: 'Analysis', icon: BarChart3 },
  { name: 'Gerador', href: 'Generator', icon: Sparkles },
  { name: 'Dados', href: 'Data', icon: Database },
];

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (pageName) => {
    const pageUrl = createPageUrl(pageName);
    return location.pathname === pageUrl || 
           (location.pathname === '/' && pageName === 'Home');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <nav className="max-w-6xl mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-slate-900">MegaStats</span>
                <span className="text-xs text-slate-500 block -mt-1">Análise Estatística</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navigation.map((item) => (
                <Link key={item.name} to={createPageUrl(item.href)}>
                  <Button
                    variant={isActive(item.href) ? "default" : "ghost"}
                    className={cn(
                      "gap-2",
                      isActive(item.href) 
                        ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-200">
              <div className="flex flex-col gap-2">
                {navigation.map((item) => (
                  <Link 
                    key={item.name} 
                    to={createPageUrl(item.href)}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant={isActive(item.href) ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3",
                        isActive(item.href) 
                          ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
                          : "text-slate-600"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-slate-600">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="text-sm">
                Apenas para fins educacionais e de entretenimento. Jogue com responsabilidade.
              </span>
            </div>
            <div className="text-sm text-slate-500">
              MegaStats © {new Date().getFullYear()} - Análise Estatística
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}