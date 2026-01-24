import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function DataImport({ onImportComplete }) {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [manualData, setManualData] = useState('');
  const [file, setFile] = useState(null);

  const parseCSVData = (csvText) => {
    const lines = csvText.trim().split('\n');
    const draws = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.toLowerCase().includes('concurso') || line.toLowerCase().includes('data')) {
        continue; // Skip header or empty lines
      }
      
      // Try different CSV formats
      const parts = line.split(/[,;\t]+/);
      
      if (parts.length >= 7) {
        // Format: draw_number, date, n1, n2, n3, n4, n5, n6
        const drawNumber = parseInt(parts[0]);
        const drawDate = parts[1];
        const numbers = parts.slice(2, 8).map(n => parseInt(n.trim())).filter(n => !isNaN(n) && n >= 1 && n <= 60);
        
        if (!isNaN(drawNumber) && numbers.length === 6) {
          draws.push({
            draw_number: drawNumber,
            draw_date: formatDate(drawDate),
            numbers: numbers.sort((a, b) => a - b)
          });
        }
      } else if (parts.length >= 6) {
        // Format: n1, n2, n3, n4, n5, n6 (just numbers)
        const numbers = parts.slice(0, 6).map(n => parseInt(n.trim())).filter(n => !isNaN(n) && n >= 1 && n <= 60);
        
        if (numbers.length === 6) {
          draws.push({
            draw_number: i + 1,
            draw_date: new Date().toISOString().split('T')[0],
            numbers: numbers.sort((a, b) => a - b)
          });
        }
      }
    }
    
    return draws;
  };

  const formatDate = (dateStr) => {
    // Try to parse various date formats
    const formats = [
      /(\d{2})\/(\d{2})\/(\d{4})/, // DD/MM/YYYY
      /(\d{4})-(\d{2})-(\d{2})/,   // YYYY-MM-DD
      /(\d{2})-(\d{2})-(\d{4})/    // DD-MM-YYYY
    ];
    
    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        if (format === formats[0] || format === formats[2]) {
          // DD/MM/YYYY or DD-MM-YYYY
          return `${match[3]}-${match[2]}-${match[1]}`;
        } else {
          // YYYY-MM-DD
          return dateStr;
        }
      }
    }
    
    return new Date().toISOString().split('T')[0];
  };

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    
    setFile(uploadedFile);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setManualData(event.target.result);
    };
    reader.readAsText(uploadedFile);
  };

  const handleImport = async () => {
    if (!manualData.trim()) {
      setImportResult({ success: false, message: 'Nenhum dado para importar' });
      return;
    }
    
    setIsImporting(true);
    setImportResult(null);
    
    try {
      const draws = parseCSVData(manualData);
      
      if (draws.length === 0) {
        setImportResult({ 
          success: false, 
          message: 'Nenhum sorteio válido encontrado. Verifique o formato dos dados.' 
        });
        setIsImporting(false);
        return;
      }
      
      // Import in batches
      const batchSize = 100;
      let imported = 0;
      
      for (let i = 0; i < draws.length; i += batchSize) {
        const batch = draws.slice(i, i + batchSize);
        await base44.entities.Draw.bulkCreate(batch);
        imported += batch.length;
      }
      
      setImportResult({ 
        success: true, 
        message: `${imported} sorteios importados com sucesso!` 
      });
      
      if (onImportComplete) {
        onImportComplete();
      }
      
    } catch (error) {
      setImportResult({ 
        success: false, 
        message: `Erro ao importar: ${error.message}` 
      });
    }
    
    setIsImporting(false);
  };

  const sampleFormat = `Concurso;Data;N1;N2;N3;N4;N5;N6
2800;25/01/2025;04;12;23;34;45;58
2799;22/01/2025;07;15;28;39;42;55
2798;18/01/2025;03;11;22;33;44;59`;

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-emerald-500" />
          Importar Dados Históricos
        </CardTitle>
        <CardDescription>
          Importe os resultados históricos da Mega-Sena para análise
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="file-upload">Upload de Arquivo CSV</Label>
          <div className="flex gap-2">
            <Input
              id="file-upload"
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 
                         file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700
                         hover:file:bg-emerald-100"
            />
          </div>
          {file && (
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {file.name}
            </p>
          )}
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-500">ou cole os dados</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="manual-data">Dados em Formato CSV</Label>
          <Textarea
            id="manual-data"
            value={manualData}
            onChange={(e) => setManualData(e.target.value)}
            placeholder={sampleFormat}
            className="font-mono text-sm h-48"
          />
          <p className="text-xs text-slate-500">
            Formato aceito: Concurso; Data; N1; N2; N3; N4; N5; N6 (separado por vírgula, ponto-e-vírgula ou tab)
          </p>
        </div>

        <Button 
          onClick={handleImport} 
          disabled={isImporting || !manualData.trim()}
          className="w-full bg-emerald-500 hover:bg-emerald-600"
        >
          {isImporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Importando...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Importar Dados
            </>
          )}
        </Button>

        {importResult && (
          <Alert className={importResult.success ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}>
            {importResult.success ? (
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={importResult.success ? 'text-emerald-700' : 'text-red-700'}>
              {importResult.message}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}