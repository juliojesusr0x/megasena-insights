import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all draws from DB
    const allDraws = await base44.entities.Draw.list('draw_number', 5000);
    if (allDraws.length === 0) {
      return Response.json({ error: 'Nenhum sorteio no banco de dados' }, { status: 400 });
    }

    const mismatches = [];
    const missing = [];
    let checked = 0;

    for (const draw of allDraws) {
      try {
        const response = await fetch(
          `https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena/${draw.draw_number}`,
          { headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' } }
        );

        if (!response.ok) {
          missing.push(draw.draw_number);
          continue;
        }

        const data = await response.json();
        if (!data || !data.listaDezenas || data.listaDezenas.length === 0) {
          missing.push(draw.draw_number);
          continue;
        }

        const officialNumbers = data.listaDezenas.map(n => parseInt(n)).sort((a, b) => a - b);
        const dbNumbers = [...draw.numbers].sort((a, b) => a - b);

        const match = officialNumbers.length === dbNumbers.length &&
          officialNumbers.every((n, i) => n === dbNumbers[i]);

        if (!match) {
          mismatches.push({
            draw_number: draw.draw_number,
            draw_date: draw.draw_date,
            db: dbNumbers,
            official: officialNumbers,
          });

          // Fix the mismatch automatically
          const officialDate = data.dataApuracao
            ? data.dataApuracao.split('/').reverse().join('-')
            : draw.draw_date;

          await base44.entities.Draw.update(draw.id, {
            numbers: officialNumbers,
            draw_date: officialDate,
          });
        }

        checked++;
      } catch (err) {
        missing.push(draw.draw_number);
      }
    }

    return Response.json({
      success: true,
      total: allDraws.length,
      checked,
      mismatches: mismatches.length,
      mismatchDetails: mismatches,
      unreachable: missing.length,
      unreachableDraws: missing,
      message: mismatches.length === 0
        ? `Todos os ${checked} sorteios verificados batem com os dados oficiais da Caixa!`
        : `${mismatches.length} divergência(s) encontrada(s) e corrigida(s) automaticamente.`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});