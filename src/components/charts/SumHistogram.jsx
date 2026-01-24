import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function SumHistogram({ sumData }) {
  const { sums, avg, min, max } = sumData;
  
  if (!sums || sums.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500">
        Dados insuficientes para gerar o histograma
      </div>
    );
  }

  // Create histogram bins
  const binSize = 15;
  const bins = {};
  
  sums.forEach(sum => {
    const binStart = Math.floor(sum / binSize) * binSize;
    const binKey = binStart;
    bins[binKey] = (bins[binKey] || 0) + 1;
  });

  const chartData = Object.entries(bins)
    .map(([bin, count]) => ({
      range: `${bin}-${parseInt(bin) + binSize - 1}`,
      bin: parseInt(bin) + binSize / 2,
      count: count,
      percentage: ((count / sums.length) * 100).toFixed(1)
    }))
    .sort((a, b) => a.bin - b.bin);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-slate-800">{min}</div>
          <div className="text-xs text-slate-500">Soma Mínima</div>
        </div>
        <div className="bg-emerald-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-emerald-600">{avg.toFixed(0)}</div>
          <div className="text-xs text-emerald-600">Soma Média</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-slate-800">{max}</div>
          <div className="text-xs text-slate-500">Soma Máxima</div>
        </div>
      </div>
      
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSum" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="bin" 
              tick={{ fontSize: 10, fill: '#64748b' }}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <YAxis 
              tick={{ fontSize: 10, fill: '#64748b' }}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <ReferenceLine x={avg} stroke="#059669" strokeDasharray="5 5" />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
                      <div className="font-semibold text-slate-800">Soma: {item.range}</div>
                      <div className="text-emerald-600">{item.count} sorteios</div>
                      <div className="text-slate-500 text-sm">{item.percentage}% do total</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area 
              type="monotone" 
              dataKey="count" 
              stroke="#10b981" 
              fillOpacity={1} 
              fill="url(#colorSum)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <p className="text-xs text-slate-500 text-center">
        A linha tracejada indica a soma média ({avg.toFixed(0)}). 
        Combinações com soma próxima à média são estatisticamente mais comuns.
      </p>
    </div>
  );
}