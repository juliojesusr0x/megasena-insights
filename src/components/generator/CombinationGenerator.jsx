import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Dice6, TrendingUp, Settings2, RefreshCw, Copy, Check } from 'lucide-react';
import { toast } from "sonner";
import {
  monteCarloGeneration,
  generateBalancedCombination,
  generateOverdueCombination
} from '../analysis/analysisUtils';
import Disclaimer from '../ui/Disclaimer';

export default function CombinationGenerator({ frequency, gapStats, totalDraws }) {
  const [method, setMethod] = useState('balanced');
  const [numCombinations, setNumCombinations] = useState(5);
  const [combinations, setCombinations] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  
  // Balanced options
  const [evenOdd, setEvenOdd] = useState('3/3');
  const [lowHigh, setLowHigh] = useState('3/3');
  const [sumRange, setSumRange] = useState([150, 220]);
  const [useFrequencyBias, setUseFrequencyBias] = useState(true);

  const evenOddOptions = ['0/6', '1/5', '2/4', '3/3', '4/2', '5/1', '6/0'];
  const lowHighOptions = ['0/6', '1/5', '2/4', '3/3', '4/2', '5/1', '6/0'];

  const handleGenerate = () => {
    setIsGenerating(true);
    setCombinations([]);

    setTimeout(() => {
      let results = [];
      
      const [even, odd] = evenOdd.split('/').map(Number);
      const [low, high] = lowHigh.split('/').map(Number);

      for (let i = 0; i < numCombinations; i++) {
        let combo;
        
        switch (method) {
          case 'montecarlo':
            const mcResults = monteCarloGeneration(frequency, 5000, 1);
            combo = mcResults[0];
            break;
          
          case 'overdue':
            combo = generateOverdueCombination(gapStats, 6);
            break;
          
          case 'balanced':
          default:
            combo = generateBalancedCombination({
              evenOddRatio: [even, odd],
              lowHighRatio: [low, high],
              sumRange: sumRange,
              excludeNumbers: [],
              preferNumbers: []
            });
            break;
        }
        
        if (combo) {
          results.push({
            ...combo,
            id: i + 1,
            sum: combo.numbers.reduce((a, b) => a + b, 0),
            evenCount: combo.numbers.filter(n => n % 2 === 0).length,
            lowCount: combo.numbers.filter(n => n <= 30).length
          });
        }
      }
      
      setCombinations(results);
      setIsGenerating(false);
    }, 500);
  };

  const copyToClipboard = (combo, index) => {
    const text = combo.numbers.map(n => n.toString().padStart(2, '0')).join(' - ');
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success('Combinação copiada!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      <Disclaimer compact />
      
      <Tabs value={method} onValueChange={setMethod}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="balanced" className="gap-2">
            <Settings2 className="h-4 w-4" />
            Balanceado
          </TabsTrigger>
          <TabsTrigger value="montecarlo" className="gap-2">
            <Dice6 className="h-4 w-4" />
            Monte Carlo
          </TabsTrigger>
          <TabsTrigger value="overdue" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Atrasados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="balanced" className="space-y-4 mt-4">
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Configurações de Balanceamento</CardTitle>
              <CardDescription>
                Gere combinações seguindo restrições estatísticas comuns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pares / Ímpares</Label>
                  <Select value={evenOdd} onValueChange={setEvenOdd}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {evenOddOptions.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Baixos (1-30) / Altos (31-60)</Label>
                  <Select value={lowHigh} onValueChange={setLowHigh}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {lowHighOptions.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-3">
                <Label>Faixa de Soma: {sumRange[0]} - {sumRange[1]}</Label>
                <Slider
                  value={sumRange}
                  onValueChange={setSumRange}
                  min={21}
                  max={345}
                  step={5}
                  className="py-2"
                />
                <p className="text-xs text-slate-500">
                  A soma dos 6 números. Valores típicos ficam entre 150-220.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="montecarlo" className="mt-4">
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Simulação Monte Carlo</CardTitle>
              <CardDescription>
                Gera combinações usando seleção ponderada pela frequência histórica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Este método simula milhares de sorteios virtuais, dando peso maior aos números 
                que apareceram com mais frequência historicamente. 
                <br /><br />
                <strong>Nota:</strong> Maior frequência passada não indica maior probabilidade futura.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue" className="mt-4">
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Números Atrasados</CardTitle>
              <CardDescription>
                Prioriza números que não aparecem há mais tempo que sua média
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Seleciona números cuja ausência atual excede seu intervalo médio histórico.
                <br /><br />
                <strong>Atenção:</strong> Estatisticamente, números "atrasados" não têm maior chance 
                de sair - cada sorteio é independente (falácia do jogador).
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4">
        <div className="space-y-1">
          <Label>Quantidade de Combinações</Label>
          <p className="text-xs text-slate-500">Gerar de 1 a 10 sugestões</p>
        </div>
        <Select value={numCombinations.toString()} onValueChange={(v) => setNumCombinations(parseInt(v))}>
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
              <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button 
        onClick={handleGenerate} 
        disabled={isGenerating}
        className="w-full h-12 text-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
      >
        {isGenerating ? (
          <>
            <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
            Gerando...
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5 mr-2" />
            Gerar Combinações
          </>
        )}
      </Button>

      {/* Results */}
      {combinations.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            Sugestões Geradas
          </h3>
          
          {combinations.map((combo, index) => (
            <Card key={combo.id} className="border-slate-200 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" className="text-xs">
                    {combo.method}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(combo, index)}
                    className="h-8"
                  >
                    {copiedIndex === index ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {combo.numbers.map((num, i) => (
                    <div
                      key={i}
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 
                                 text-white font-bold text-lg flex items-center justify-center shadow-md"
                    >
                      {num.toString().padStart(2, '0')}
                    </div>
                  ))}
                </div>
                
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="secondary">Soma: {combo.sum}</Badge>
                  <Badge variant="secondary">{combo.evenCount}P/{6-combo.evenCount}I</Badge>
                  <Badge variant="secondary">{combo.lowCount}B/{6-combo.lowCount}A</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}