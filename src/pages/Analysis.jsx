import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { 
  BarChart3, Grid3X3, TrendingUp, Percent, ArrowLeftRight, 
  AlertCircle, Database, Layers 
} from 'lucide-react';

import FrequencyHeatmap from '@/components/charts/FrequencyHeatmap';
import DistributionChart from '@/components/charts/DistributionChart';
import SumHistogram from '@/components/charts/SumHistogram';
import GapAnalysisTable from '@/components/charts/GapAnalysisTable';
import StatsSummaryCards from '@/components/stats/StatsSummaryCards';
import HotColdNumbers from '@/components/stats/HotColdNumbers';
import Disclaimer from '@/components/ui/Disclaimer';

import {
  calculateNumberFrequency,
  getHotColdNumbers,
  analyzeEvenOddDistribution,
  analyzeLowHighDistribution,
  calculateGapAnalysis,
  analyzeConsecutivePatterns,
  analyzeSumDistribution,
  analyzeDecadeDistribution
} from '@/components/analysis/analysisUtils';

export default function Analysis() {
  const [activeTab, setActiveTab] = useState('frequency');

  const { data: draws = [], isLoading, error } = useQuery({
    queryKey: ['draws-all'],
    queryFn: () => base44.entities.Draw.list('-draw_number', 5000),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (draws.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-4 md:p-8">
        <div className="max-w-2xl mx-auto mt-20 text-center">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
            <Database className="h-10 w-10 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Nenhum Dado Disponível</h2>
          <p className="text-slate-600 mb-8">
            Para começar a análise, você precisa importar os dados históricos da Mega-Sena.
          </p>
          <Link to={createPageUrl('Data')}>
            <Button className="bg-emerald-500 hover:bg-emerald-600">
              <Database className="h-4 w-4 mr-2" />
              Importar Dados
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate all statistics
  const frequency = calculateNumberFrequency(draws);
  const hotCold = getHotColdNumbers(frequency);
  const evenOdd = analyzeEvenOddDistribution(draws);
  const lowHigh = analyzeLowHighDistribution(draws);
  const gaps = calculateGapAnalysis(draws);
  const consecutive = analyzeConsecutivePatterns(draws);
  const sums = analyzeSumDistribution(draws);
  const decades = analyzeDecadeDistribution(draws);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Análise Estatística</h1>
          <p className="text-slate-600">
            Explore os dados históricos e padrões estatísticos dos sorteios
          </p>
        </div>

        {/* Summary Cards */}
        <StatsSummaryCards draws={draws} />

        {/* Disclaimer */}
        <Disclaimer compact />

        {/* Main Analysis Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full h-auto gap-1 bg-slate-100 p-1">
            <TabsTrigger value="frequency" className="gap-2 py-2">
              <Grid3X3 className="h-4 w-4" />
              <span className="hidden md:inline">Frequência</span>
            </TabsTrigger>
            <TabsTrigger value="hotcold" className="gap-2 py-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden md:inline">Quentes/Frios</span>
            </TabsTrigger>
            <TabsTrigger value="distributions" className="gap-2 py-2">
              <Percent className="h-4 w-4" />
              <span className="hidden md:inline">Distribuições</span>
            </TabsTrigger>
            <TabsTrigger value="gaps" className="gap-2 py-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden md:inline">Gaps</span>
            </TabsTrigger>
            <TabsTrigger value="sums" className="gap-2 py-2">
              <Layers className="h-4 w-4" />
              <span className="hidden md:inline">Somas</span>
            </TabsTrigger>
          </TabsList>

          {/* Frequency Heatmap */}
          <TabsContent value="frequency" className="mt-6">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Grid3X3 className="h-5 w-5 text-emerald-500" />
                  Mapa de Frequência
                </CardTitle>
                <CardDescription>
                  Visualize a frequência de cada número (1-60) nos sorteios históricos. 
                  Cores mais intensas indicam números que apareceram mais vezes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FrequencyHeatmap frequency={frequency} totalDraws={draws.length} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hot/Cold Numbers */}
          <TabsContent value="hotcold" className="mt-6">
            <HotColdNumbers hotCold={hotCold} totalDraws={draws.length} />
            
            <Alert className="mt-4 bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                <strong>Nota:</strong> Números "quentes" ou "frios" refletem apenas o passado. 
                Estatisticamente, cada número tem a mesma probabilidade de sair em cada sorteio.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Distributions */}
          <TabsContent value="distributions" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-base">Pares vs Ímpares</CardTitle>
                  <CardDescription>
                    Distribuição de números pares e ímpares por sorteio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DistributionChart data={evenOdd} />
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-base">Baixos vs Altos</CardTitle>
                  <CardDescription>
                    Números baixos (1-30) vs altos (31-60) por sorteio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DistributionChart data={lowHigh} />
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-base">Números Consecutivos</CardTitle>
                  <CardDescription>
                    Quantidade de pares de números consecutivos por sorteio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DistributionChart data={consecutive} />
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-base">Distribuição por Década</CardTitle>
                  <CardDescription>
                    Frequência de números em cada faixa de 10
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DistributionChart data={decades.decades} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Gap Analysis */}
          <TabsContent value="gaps" className="mt-6">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                  Análise de Gaps (Intervalos)
                </CardTitle>
                <CardDescription>
                  Analise o intervalo entre aparições de cada número. Números "atrasados" 
                  são aqueles cujo gap atual excede sua média histórica.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GapAnalysisTable gapStats={gaps} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sum Analysis */}
          <TabsContent value="sums" className="mt-6">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-emerald-500" />
                  Distribuição de Somas
                </CardTitle>
                <CardDescription>
                  A soma dos 6 números sorteados segue uma distribuição aproximadamente normal. 
                  Combinações com soma próxima à média são estatisticamente mais frequentes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SumHistogram sumData={sums} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}