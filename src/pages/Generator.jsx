import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Database, Sparkles } from 'lucide-react';

import CombinationGenerator from '@/components/generator/CombinationGenerator';
import {
  calculateNumberFrequency,
  calculateGapAnalysis
} from '@/components/analysis/analysisUtils';

export default function Generator() {
  const { data: draws = [], isLoading } = useQuery({
    queryKey: ['draws-all'],
    queryFn: () => base44.entities.Draw.list('-draw_number', 5000),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-4 md:p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
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
            Para gerar combinações, você precisa primeiro importar os dados históricos da Mega-Sena.
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

  const frequency = calculateNumberFrequency(draws);
  const gapStats = calculateGapAnalysis(draws);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-2xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Gerador de Combinações</h1>
          </div>
          <p className="text-slate-600">
            Gere sugestões de números baseadas em análises estatísticas configuráveis
          </p>
        </div>

        {/* Generator Component */}
        <CombinationGenerator 
          frequency={frequency} 
          gapStats={gapStats} 
          totalDraws={draws.length} 
        />
      </div>
    </div>
  );
}