import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the latest draw stored in DB
    const existingDraws = await base44.entities.Draw.list('-draw_number', 1);
    const lastDrawNumber = existingDraws.length > 0 ? existingDraws[0].draw_number : 0;

    const imported = [];
    const errors = [];
    let drawNumber = lastDrawNumber + 1;
    let consecutiveErrors = 0;

    while (consecutiveErrors < 3) {
      try {
        const response = await fetch(
          `https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena/${drawNumber}`,
          {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Mozilla/5.0',
            }
          }
        );

        if (!response.ok) {
          consecutiveErrors++;
          drawNumber++;
          continue;
        }

        const data = await response.json();

        if (!data || !data.listaDezenas || data.listaDezenas.length === 0) {
          consecutiveErrors++;
          drawNumber++;
          continue;
        }

        consecutiveErrors = 0;

        const numbers = data.listaDezenas.map(n => parseInt(n));
        const drawDate = data.dataApuracao
          ? data.dataApuracao.split('/').reverse().join('-')
          : new Date().toISOString().split('T')[0];

        await base44.entities.Draw.create({
          draw_number: drawNumber,
          draw_date: drawDate,
          numbers: numbers,
          prize_pool: data.valorArrecadado || null,
          winners_6: data.listaRateioPremio?.[0]?.numeroDeGanhadores || 0,
        });

        imported.push(drawNumber);
        drawNumber++;
      } catch (err) {
        consecutiveErrors++;
        drawNumber++;
      }
    }

    return Response.json({
      success: true,
      imported: imported.length,
      drawNumbers: imported,
      lastChecked: drawNumber - 1,
      message: imported.length > 0
        ? `${imported.length} novo(s) sorteio(s) importado(s)`
        : 'Nenhum sorteio novo encontrado',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});