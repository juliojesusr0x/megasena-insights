import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { ArrowUpDown, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function GapAnalysisTable({ gapStats }) {
  const [sortBy, setSortBy] = useState('overdueRatio');
  const [sortOrder, setSortOrder] = useState('desc');

  const data = Object.entries(gapStats).map(([num, stats]) => ({
    number: parseInt(num),
    ...stats,
    overdueRatio: stats.currentGap / stats.averageGap
  }));

  const sortedData = [...data].sort((a, b) => {
    const multiplier = sortOrder === 'desc' ? -1 : 1;
    return (a[sortBy] - b[sortBy]) * multiplier;
  });

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const topOverdue = sortedData.filter(d => d.isOverdue).slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-red-50 rounded-xl p-4 text-center">
          <Clock className="h-5 w-5 mx-auto mb-2 text-red-500" />
          <div className="text-2xl font-bold text-red-600">
            {data.filter(d => d.isOverdue).length}
          </div>
          <div className="text-xs text-red-600">Números Atrasados</div>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 text-center">
          <TrendingUp className="h-5 w-5 mx-auto mb-2 text-emerald-500" />
          <div className="text-2xl font-bold text-emerald-600">
            {data.filter(d => !d.isOverdue).length}
          </div>
          <div className="text-xs text-emerald-600">Números em Dia</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-slate-700">
            {Math.max(...data.map(d => d.currentGap))}
          </div>
          <div className="text-xs text-slate-500">Maior Ausência Atual</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-slate-700">
            {(data.reduce((sum, d) => sum + d.averageGap, 0) / 60).toFixed(1)}
          </div>
          <div className="text-xs text-slate-500">Gap Médio Geral</div>
        </div>
      </div>

      {/* Top Overdue Numbers */}
      {topOverdue.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4">
          <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Números Mais Atrasados
          </h4>
          <div className="flex flex-wrap gap-2">
            {topOverdue.map((item) => (
              <div 
                key={item.number}
                className="bg-white rounded-lg px-3 py-2 shadow-sm border border-red-100"
              >
                <div className="font-bold text-red-600 text-lg">
                  {item.number.toString().padStart(2, '0')}
                </div>
                <div className="text-xs text-red-500">
                  {item.overdueRatio.toFixed(1)}x atrasado
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 px-3 font-medium text-slate-600">
                <Button variant="ghost" size="sm" onClick={() => toggleSort('number')}>
                  Nº <ArrowUpDown className="h-3 w-3 ml-1" />
                </Button>
              </th>
              <th className="text-left py-2 px-3 font-medium text-slate-600">
                <Button variant="ghost" size="sm" onClick={() => toggleSort('currentGap')}>
                  Gap Atual <ArrowUpDown className="h-3 w-3 ml-1" />
                </Button>
              </th>
              <th className="text-left py-2 px-3 font-medium text-slate-600">
                <Button variant="ghost" size="sm" onClick={() => toggleSort('averageGap')}>
                  Gap Médio <ArrowUpDown className="h-3 w-3 ml-1" />
                </Button>
              </th>
              <th className="text-left py-2 px-3 font-medium text-slate-600">
                <Button variant="ghost" size="sm" onClick={() => toggleSort('overdueRatio')}>
                  Razão <ArrowUpDown className="h-3 w-3 ml-1" />
                </Button>
              </th>
              <th className="text-left py-2 px-3 font-medium text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.slice(0, 20).map((item) => (
              <tr 
                key={item.number}
                className={cn(
                  "border-b border-slate-100 hover:bg-slate-50 transition-colors",
                  item.isOverdue && "bg-red-50/50"
                )}
              >
                <td className="py-2 px-3 font-bold text-slate-800">
                  {item.number.toString().padStart(2, '0')}
                </td>
                <td className="py-2 px-3 text-slate-600">{item.currentGap}</td>
                <td className="py-2 px-3 text-slate-600">{item.averageGap.toFixed(1)}</td>
                <td className="py-2 px-3">
                  <span className={cn(
                    "font-medium",
                    item.overdueRatio > 1.5 ? "text-red-600" : 
                    item.overdueRatio > 1 ? "text-orange-500" : "text-emerald-600"
                  )}>
                    {item.overdueRatio.toFixed(2)}x
                  </span>
                </td>
                <td className="py-2 px-3">
                  <Badge variant={item.isOverdue ? "destructive" : "secondary"} className="text-xs">
                    {item.isOverdue ? "Atrasado" : "Normal"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <p className="text-xs text-slate-500">
        A "Razão" indica quanto o número está atrasado em relação à sua média histórica. 
        Valores acima de 1.0 indicam atraso; quanto maior, mais atrasado.
      </p>
    </div>
  );
}