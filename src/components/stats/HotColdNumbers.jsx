import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Snowflake } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function HotColdNumbers({ hotCold, totalDraws }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Hot Numbers */}
      <Card className="border-slate-200 overflow-hidden">
        <CardHeader className="pb-2 bg-gradient-to-r from-orange-50 to-red-50">
          <CardTitle className="text-base flex items-center gap-2 text-orange-700">
            <Flame className="h-5 w-5" />
            Números Quentes
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-xs text-slate-500 mb-4">
            Números que mais apareceram historicamente
          </p>
          <div className="space-y-2">
            {hotCold.hot.map((item, index) => (
              <div 
                key={item.number}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div 
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold",
                    index < 3 
                      ? "bg-gradient-to-br from-orange-400 to-red-500 text-white" 
                      : "bg-orange-100 text-orange-700"
                  )}
                >
                  {item.number.toString().padStart(2, '0')}
                </div>
                <div className="flex-1">
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
                      style={{ width: `${(item.frequency / hotCold.hot[0].frequency) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-slate-800">{item.frequency}x</div>
                  <div className="text-xs text-slate-500">
                    {((item.frequency / totalDraws) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cold Numbers */}
      <Card className="border-slate-200 overflow-hidden">
        <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardTitle className="text-base flex items-center gap-2 text-blue-700">
            <Snowflake className="h-5 w-5" />
            Números Frios
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-xs text-slate-500 mb-4">
            Números que menos apareceram historicamente
          </p>
          <div className="space-y-2">
            {hotCold.cold.map((item, index) => (
              <div 
                key={item.number}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div 
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold",
                    index < 3 
                      ? "bg-gradient-to-br from-blue-400 to-cyan-500 text-white" 
                      : "bg-blue-100 text-blue-700"
                  )}
                >
                  {item.number.toString().padStart(2, '0')}
                </div>
                <div className="flex-1">
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full"
                      style={{ width: `${(item.frequency / hotCold.hot[0].frequency) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-slate-800">{item.frequency}x</div>
                  <div className="text-xs text-slate-500">
                    {((item.frequency / totalDraws) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}