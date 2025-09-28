// Conversão manual de moedas para Euro
// Taxas de câmbio fixas (exemplo): 1 USD = 0.90 EUR, 1 BRL = 0.18 EUR
export function toEuro(valor: number, moeda: string): number {
  if (!valor || !Number.isFinite(valor)) return 0;
  const m = (moeda || '').toLowerCase();
  // Normalize common labels
  const isEUR = ['euro', 'eur', '€'].includes(m);
  const isUSD = ['dolar', 'dólar', 'usd', 'us$', '$'].includes(m);
  const isBRL = ['real', 'brl', 'r$', 'reais'].includes(m);
  const isGBP = ['libra', 'libras', 'gbp', '£'].includes(m);

  if (isEUR) return valor;
  // Simple static rates: adjust if you later want dynamic
  if (isUSD) return valor * 0.90; // 1 USD -> 0.90 EUR
  if (isBRL) return valor * 0.18; // 1 BRL -> 0.18 EUR
  if (isGBP) return valor * 1.15; // 1 GBP -> 1.15 EUR
  // Fallback: try matching original labels
  if (moeda === 'Euro') return valor;
  if (moeda === 'Dolar') return valor * 0.90;
  if (moeda === 'Real') return valor * 0.18;
  return 0;
}

// Conversão manual de moedas para Real (BRL)
// Coerente com as taxas de toEuro: 1 BRL = 0.18 EUR => 1 EUR = 5.555...
export function toBRL(valor: number, moeda: string): number {
  if (!valor || !Number.isFinite(valor)) return 0;
  const m = (moeda || '').toLowerCase();
  const isEUR = ['euro', 'eur', '€'].includes(m);
  const isUSD = ['dolar', 'dólar', 'usd', 'us$', '$'].includes(m);
  const isBRL = ['real', 'brl', 'r$', 'reais'].includes(m);
  const isGBP = ['libra', 'libras', 'gbp', '£'].includes(m);

  const EUR_TO_BRL = 1 / 0.18; // ~5.5555
  if (isBRL) return valor;
  if (isEUR) return valor * EUR_TO_BRL;
  if (isUSD) return valor * (0.90 * EUR_TO_BRL); // USD->EUR->BRL
  if (isGBP) return valor * (1.15 * EUR_TO_BRL); // GBP->EUR->BRL
  if (moeda === 'Real') return valor;
  if (moeda === 'Euro') return valor * EUR_TO_BRL;
  if (moeda === 'Dolar') return valor * (0.90 * EUR_TO_BRL);
  return 0;
}
