import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, Sparkles, Database, TrendingUp, RefreshCw,
  Dice6, Calculator, AlertTriangle, ChevronRight 
} from 'lucide-react';
import { toast } from 'sonner';
import Disclaimer from '@/components/ui/Disclaimer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function Home() {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: draws = [], isLoading, refetch } = useQuery({
    queryKey: ['draws-count'],
    queryFn: () => base44.entities.Draw.list('-draw_number', 10),
  });

  const handleUpdateDraws = async () => {
    setIsUpdating(true);
    try {
      await refetch();
      queryClient.invalidateQueries({ queryKey: ['draws-count'] });
      queryClient.invalidateQueries({ queryKey: ['draws-all'] });
      queryClient.invalidateQueries({ queryKey: ['draws-list'] });
      queryClient.invalidateQueries({ queryKey: ['draws-count-all'] });
      toast.success('Dados atualizados com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar dados');
    }
    setIsUpdating(false);
  };

  const hasData = draws.length > 0;
  const latestDraw = hasData ? draws[0] : null;

  const features = [
    {
      icon: BarChart3,
      title: 'Análise de Frequência',
      description: 'Visualize quais números aparecem mais e menos nos sorteios históricos',
      color: 'text-blue-500',
      bg: 'bg-blue-50'
    },
    {
      icon: TrendingUp,
      title: 'Análise de Gaps',
      description: 'Identifique números "atrasados" baseado em seus intervalos médios',
      color: 'text-emerald-500',
      bg: 'bg-emerald-50'
    },
    {
      icon: Calculator,
      title: 'Distribuições',
      description: 'Explore padrões de pares/ímpares, baixos/altos e somas',
      color: 'text-purple-500',
      bg: 'bg-purple-50'
    },
    {
      icon: Dice6,
      title: 'Monte Carlo',
      description: 'Simulações probabilísticas para geração de combinações',
      color: 'text-orange-500',
      bg: 'bg-orange-50'
    }
  ];

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full blur-3xl opacity-30" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200 rounded-full blur-3xl opacity-30" />
        
        <div className="relative max-w-6xl mx-auto px-4 pt-16 pb-20">
          <div className="flex flex-wrap gap-3 mb-6">
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
              Análise Estatística • Não é previsão
            </Badge>
            {hasData && (
              <>
                <Badge variant="outline" className="bg-white">
                  {draws.length} sorteios importados
                </Badge>
                {latestDraw && (
                  <Badge variant="outline" className="bg-white">
                    Último: {new Date(latestDraw.draw_date).toLocaleDateString('pt-BR')}
                  </Badge>
                )}
              </>
            )}
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Análise Estatística da
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">
              {' '}Mega-Sena
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mb-8 leading-relaxed">
            Explore dados históricos, visualize padrões estatísticos e gere combinações 
            baseadas em análises probabilísticas. 
            <strong className="text-slate-800"> Para fins educacionais e de entretenimento.</strong>
          </p>
          
          <div className="flex flex-wrap gap-4">
            {hasData ? (
              <>
                <Link to={createPageUrl('Analysis')}>
                  <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-lg px-8 h-14">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Ver Análises
                    <ChevronRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
                <Link to={createPageUrl('Generator')}>
                  <Button size="lg" variant="outline" className="text-lg px-8 h-14 border-2">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Gerar Combinações
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={handleUpdateDraws}
                  disabled={isUpdating}
                  className="text-lg px-8 h-14 border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                >
                  {isUpdating ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      Atualizando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2" />
                      Atualizar Dados
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Link to={createPageUrl('Data')}>
                <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-lg px-8 h-14">
                  <Database className="h-5 w-5 mr-2" />
                  Importar Dados
                  <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-4">
          Ferramentas de Análise
        </h2>
        <p className="text-slate-600 text-center max-w-2xl mx-auto mb-12">
          Utilize técnicas estatísticas e probabilísticas para explorar os dados históricos
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="pt-6">
                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Disclaimer Section */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <Disclaimer />
      </div>

      {/* How It Works */}
      <div className="bg-slate-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-12">
            Como Funciona
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-emerald-600">1</span>
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Importe os Dados</h3>
              <p className="text-sm text-slate-600">
                Faça upload do histórico de sorteios da Mega-Sena em formato CSV
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-emerald-600">2</span>
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Analise Estatísticas</h3>
              <p className="text-sm text-slate-600">
                Explore frequências, distribuições, gaps e padrões históricos
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-emerald-600">3</span>
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Gere Combinações</h3>
              <p className="text-sm text-slate-600">
                Crie sugestões baseadas em parâmetros estatísticos configuráveis
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
          <AlertTriangle className="h-4 w-4" />
          <span>Este aplicativo é apenas para fins educacionais e de entretenimento.</span>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}