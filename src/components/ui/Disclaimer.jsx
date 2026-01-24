import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Disclaimer({ compact = false }) {
  if (compact) {
    return (
      <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex items-start gap-2">
        <AlertTriangle className="h-3.5 w-3.5 mt-0.5 text-amber-500 flex-shrink-0" />
        <span>
          Mega-Sena é um jogo de azar. Resultados passados não influenciam sorteios futuros. 
          Este app oferece análises estatísticas, não previsões.
        </span>
      </div>
    );
  }

  return (
    <Alert className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
      <AlertTriangle className="h-5 w-5 text-amber-600" />
      <AlertTitle className="text-amber-800 font-semibold">Aviso Importante</AlertTitle>
      <AlertDescription className="text-amber-700 mt-2 space-y-2">
        <p>
          <strong>Mega-Sena é um jogo de azar.</strong> Cada sorteio é um evento independente 
          e aleatório — resultados passados não influenciam sorteios futuros.
        </p>
        <p>
          Este aplicativo fornece <strong>análises estatísticas e insights exploratórios</strong>, 
          não previsões ou garantias de acerto. As sugestões são baseadas em dados históricos 
          e modelos probabilísticos para fins educacionais e de entretenimento.
        </p>
        <p className="text-sm italic">
          Jogue com responsabilidade. Nunca aposte mais do que pode perder.
        </p>
      </AlertDescription>
    </Alert>
  );
}