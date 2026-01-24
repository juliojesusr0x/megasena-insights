import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Database, Calendar, TrendingUp, Hash } from 'lucide-react';

export default function StatsSummaryCards({ draws }) {
  const totalDraws = draws.length;
  
  const sortedDraws = [...draws].sort((a, b) => new Date(b.draw_date) - new Date(a.draw_date));
  const latestDraw = sortedDraws[0];
  const oldestDraw = sortedDraws[sortedDraws.length - 1];
  
  // Calculate unique numbers drawn
  const allNumbers = new Set();
  draws.forEach(draw => {
    if (draw.numbers) {
      draw.numbers.forEach(n => allNumbers.add(n));
    }
  });

  const cards = [
    {
      icon: Database,
      label: 'Total de Sorteios',
      value: totalDraws.toLocaleString('pt-BR'),
      color: 'text-blue-500',
      bg: 'bg-blue-50'
    },
    {
      icon: Calendar,
      label: 'Último Sorteio',
      value: latestDraw ? new Date(latestDraw.draw_date).toLocaleDateString('pt-BR') : '-',
      subvalue: latestDraw ? `Concurso ${latestDraw.draw_number}` : '',
      color: 'text-emerald-500',
      bg: 'bg-emerald-50'
    },
    {
      icon: Calendar,
      label: 'Primeiro Sorteio',
      value: oldestDraw ? new Date(oldestDraw.draw_date).toLocaleDateString('pt-BR') : '-',
      subvalue: oldestDraw ? `Concurso ${oldestDraw.draw_number}` : '',
      color: 'text-purple-500',
      bg: 'bg-purple-50'
    },
    {
      icon: Hash,
      label: 'Números no Pool',
      value: allNumbers.size,
      subvalue: 'de 60 possíveis',
      color: 'text-orange-500',
      bg: 'bg-orange-50'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="border-slate-200 overflow-hidden">
          <CardContent className="p-4">
            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <div className="text-2xl font-bold text-slate-800">{card.value}</div>
            <div className="text-sm text-slate-500">{card.label}</div>
            {card.subvalue && (
              <div className="text-xs text-slate-400 mt-1">{card.subvalue}</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}