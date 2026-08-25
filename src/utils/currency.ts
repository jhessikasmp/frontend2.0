// Conversão manual de moedas para Euro
// Taxas de câmbio fixas atualizadas
export function toEuro(valor: number, moeda: string): number {
  if (!valor || !Number.isFinite(valor)) return 0;
  const m = (moeda || '').toLowerCase();
  // Normalize common labels
  const isEUR = ['euro', 'eur', '€'].includes(m);
  const isUSD = ['dolar', 'dólar', 'usd', 'us$', '$'].includes(m);
  const isBRL = ['real', 'brl', 'r$', 'reais'].includes(m);
  const isGBP = ['libra', 'libras', 'gbp', '£'].includes(m);

  if (isEUR) return valor;
  if (isUSD) return valor * 0.90; // 1 USD -> 0.90 EUR
  if (isBRL) return valor * 0.18; // 1 BRL -> 0.18 EUR
  if (isGBP) return valor * 1.15; // 1 GBP -> 1.15 EUR
  if (moeda === 'Euro') return valor;
  if (moeda === 'Dolar') return valor * 0.90;
  if (moeda === 'Real') return valor * 0.18;
  if (moeda === 'Libra') return valor * 1.15;
  return 0;
}

// Conversão manual de moedas para Libra (GBP)
export function toGBP(valor: number, moeda: string): number {
  if (!valor || !Number.isFinite(valor)) return 0;
  const m = (moeda || '').toLowerCase();
  const isEUR = ['euro', 'eur', '€'].includes(m);
  const isUSD = ['dolar', 'dólar', 'usd', 'us$', '$'].includes(m);
  const isBRL = ['real', 'brl', 'r$', 'reais'].includes(m);
  const isGBP = ['libra', 'libras', 'gbp', '£'].includes(m);

  const EUR_TO_GBP = 1 / 1.15; // ~0.8695
  if (isGBP) return valor;
  if (isEUR) return valor * EUR_TO_GBP;
  if (isUSD) return valor * (0.90 * EUR_TO_GBP);
  if (isBRL) return valor * (0.18 * EUR_TO_GBP);
  if (moeda === 'Libra') return valor;
  if (moeda === 'Euro') return valor * EUR_TO_GBP;
  if (moeda === 'Dolar') return valor * (0.90 * EUR_TO_GBP);
  if (moeda === 'Real') return valor * (0.18 * EUR_TO_GBP);
  return 0;
}

// Conversão manual de moedas para Real (BRL)
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
  if (isUSD) return valor * (0.90 * EUR_TO_BRL);
  if (isGBP) return valor * (1.15 * EUR_TO_BRL);
  if (moeda === 'Real') return valor;
  if (moeda === 'Euro') return valor * EUR_TO_BRL;
  if (moeda === 'Dolar') return valor * (0.90 * EUR_TO_BRL);
  if (moeda === 'Libra') return valor * (1.15 * EUR_TO_BRL);
  return 0;
}

// Conversão manual de moedas para Dólar (USD)
export function toUSD(valor: number, moeda: string): number {
  if (!valor || !Number.isFinite(valor)) return 0;
  const m = (moeda || '').toLowerCase();
  const isEUR = ['euro', 'eur', '€'].includes(m);
  const isUSD = ['dolar', 'dólar', 'usd', 'us$', '$'].includes(m);
  const isBRL = ['real', 'brl', 'r$', 'reais'].includes(m);
  const isGBP = ['libra', 'libras', 'gbp', '£'].includes(m);

  const EUR_TO_USD = 1 / 0.90; // ~1.1111
  if (isUSD) return valor;
  if (isEUR) return valor * EUR_TO_USD;
  if (isBRL) return valor * (0.18 * EUR_TO_USD);
  if (isGBP) return valor * (1.15 * EUR_TO_USD);
  if (moeda === 'Dolar') return valor;
  if (moeda === 'Euro') return valor * EUR_TO_USD;
  if (moeda === 'Real') return valor * (0.18 * EUR_TO_USD);
  if (moeda === 'Libra') return valor * (1.15 * EUR_TO_USD);
  return 0;
}