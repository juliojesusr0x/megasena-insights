import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#10b981', '#059669', '#047857', '#065f46', '#064e3b', '#022c22'];

export default function DistributionChart({ data, title, xLabel = "Categoria", yLabel = "Frequência" }) {
  const chartData = Object.entries(data)
    .map(([key, value]) => ({
      name: key,
      value: value
    }))
    .sort((a, b) => {
      // Sort by numeric order if possible
      const aNum = parseInt(a.name);
      const bNum = parseInt(b.name);
      if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
      return b.value - a.value;
    });

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-4">
      {title && <h3 className="font-semibold text-slate-800">{title}</h3>}
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={{ stroke: '#cbd5e1' }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={{ stroke: '#cbd5e1' }}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
                      <div className="font-semibold text-slate-800">{item.name}</div>
                      <div className="text-emerald-600">{item.value} ocorrências</div>
                      <div className="text-slate-500 text-sm">
                        {((item.value / total) * 100).toFixed(1)}% do total
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}