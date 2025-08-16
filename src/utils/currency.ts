// Conversão manual de moedas para Euro
// Taxas de câmbio fixas (exemplo): 1 USD = 0.90 EUR, 1 BRL = 0.18 EUR
export function toEuro(valor: number, moeda: string): number {
  if (moeda === 'Euro') return valor;
  if (moeda === 'Dolar') return valor * 0.85;
  if (moeda === 'Real') return valor * 0.15;
  return 0;
}
