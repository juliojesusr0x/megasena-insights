import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Database, Trash2, RefreshCw, Calendar, Hash, AlertCircle, 
  CheckCircle, ExternalLink 
} from 'lucide-react';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import DataImport from '@/components/data/DataImport';

export default function Data() {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: draws = [], isLoading, refetch } = useQuery({
    queryKey: ['draws-list'],
    queryFn: () => base44.entities.Draw.list('-draw_number', 100),
  });

  const { data: allDraws = [] } = useQuery({
    queryKey: ['draws-count-all'],
    queryFn: () => base44.entities.Draw.list('-draw_number', 5000),
  });

  const handleImportComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['draws-list'] });
    queryClient.invalidateQueries({ queryKey: ['draws-count-all'] });
    queryClient.invalidateQueries({ queryKey: ['draws-all'] });
    queryClient.invalidateQueries({ queryKey: ['draws-count'] });
    refetch();
  };

  const handleDeleteAll = async () => {
    setIsDeleting(true);
    try {
      // Delete in batches
      for (const draw of allDraws) {
        await base44.entities.Draw.delete(draw.id);
      }
      handleImportComplete();
    } catch (error) {
      console.error('Error deleting draws:', error);
    }
    setIsDeleting(false);
  };

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
              <Database className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Gestão de Dados</h1>
          </div>
          <p className="text-slate-600">
            Importe e gerencie os dados históricos dos sorteios da Mega-Sena
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Hash className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">
                    {allDraws.length.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-sm text-slate-500">Sorteios Importados</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {allDraws.length > 0 && (
            <>
              <Card className="border-slate-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-slate-800">
                        {new Date(Math.max(...allDraws.map(d => new Date(d.draw_date)))).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="text-sm text-slate-500">Último Sorteio</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-purple-500" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-slate-800">
                        {new Date(Math.min(...allDraws.map(d => new Date(d.draw_date)))).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="text-sm text-slate-500">Primeiro Sorteio</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Data Source Info */}
        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700">
            <strong>Dica:</strong> Você pode baixar o histórico oficial da Mega-Sena no site da Caixa Econômica Federal.{' '}
            <a 
              href="https://loterias.caixa.gov.br/Paginas/Mega-Sena.aspx" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline inline-flex items-center gap-1"
            >
              Acessar site oficial <ExternalLink className="h-3 w-3" />
            </a>
          </AlertDescription>
        </Alert>

        {/* Import Component */}
        <DataImport onImportComplete={handleImportComplete} />

        {/* Delete All */}
        {allDraws.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Todos os Dados
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Isso irá excluir permanentemente todos os {allDraws.length.toLocaleString('pt-BR')} sorteios importados. 
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteAll}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Excluindo...
                    </>
                  ) : (
                    'Excluir Tudo'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Recent Draws Table */}
        {draws.length > 0 && (
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">Sorteios Recentes</CardTitle>
              <CardDescription>
                Mostrando os últimos {Math.min(draws.length, 100)} sorteios importados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20">Concurso</TableHead>
                        <TableHead className="w-28">Data</TableHead>
                        <TableHead>Números Sorteados</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {draws.slice(0, 20).map((draw) => (
                        <TableRow key={draw.id}>
                          <TableCell className="font-medium">
                            {draw.draw_number}
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {new Date(draw.draw_date).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1.5">
                              {draw.numbers?.sort((a, b) => a - b).map((num, idx) => (
                                <Badge 
                                  key={idx} 
                                  variant="secondary"
                                  className="bg-emerald-100 text-emerald-700 font-semibold min-w-[2rem] justify-center"
                                >
                                  {num.toString().padStart(2, '0')}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </ProtectedRoute>
  );
}