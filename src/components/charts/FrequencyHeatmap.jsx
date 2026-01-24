import React from 'react';
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function FrequencyHeatmap({ frequency, totalDraws }) {
  const maxFreq = Math.max(...Object.values(frequency));
  const minFreq = Math.min(...Object.values(frequency));
  const avgFreq = Object.values(frequency).reduce((a, b) => a + b, 0) / 60;

  const getIntensity = (freq) => {
    const normalized = (freq - minFreq) / (maxFreq - minFreq);
    return normalized;
  };

  const getColor = (freq) => {
    const intensity = getIntensity(freq);
    if (intensity > 0.8) return 'bg-emerald-500 text-white';
    if (intensity > 0.6) return 'bg-emerald-400 text-white';
    if (intensity > 0.4) return 'bg-emerald-300 text-emerald-900';
    if (intensity > 0.2) return 'bg-emerald-200 text-emerald-800';
    return 'bg-emerald-100 text-emerald-700';
  };

  const rows = [];
  for (let i = 0; i < 6; i++) {
    const rowNumbers = [];
    for (let j = 1; j <= 10; j++) {
      const num = i * 10 + j;
      rowNumbers.push(num);
    }
    rows.push(rowNumbers);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>Menor: {minFreq}x</span>
        <span>Média: {avgFreq.toFixed(1)}x</span>
        <span>Maior: {maxFreq}x</span>
      </div>
      
      <TooltipProvider>
        <div className="grid gap-1.5">
          {rows.map((row, rowIdx) => (
            <div key={rowIdx} className="grid grid-cols-10 gap-1.5">
              {row.map((num) => (
                <Tooltip key={num}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "aspect-square rounded-lg flex items-center justify-center",
                        "font-semibold text-sm cursor-pointer transition-all duration-200",
                        "hover:scale-110 hover:shadow-lg hover:z-10",
                        getColor(frequency[num])
                      )}
                    >
                      {num.toString().padStart(2, '0')}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-slate-900 text-white">
                    <div className="text-center">
                      <div className="font-bold">Número {num}</div>
                      <div>Frequência: {frequency[num]}x</div>
                      <div className="text-slate-300 text-xs">
                        ({((frequency[num] / totalDraws) * 100).toFixed(1)}% dos sorteios)
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          ))}
        </div>
      </TooltipProvider>

      <div className="flex items-center justify-center gap-2 mt-4">
        <span className="text-xs text-slate-500">Menos frequente</span>
        <div className="flex gap-0.5">
          <div className="w-6 h-3 rounded bg-emerald-100"></div>
          <div className="w-6 h-3 rounded bg-emerald-200"></div>
          <div className="w-6 h-3 rounded bg-emerald-300"></div>
          <div className="w-6 h-3 rounded bg-emerald-400"></div>
          <div className="w-6 h-3 rounded bg-emerald-500"></div>
        </div>
        <span className="text-xs text-slate-500">Mais frequente</span>
      </div>
    </div>
  );
}