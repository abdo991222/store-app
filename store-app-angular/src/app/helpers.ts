export const money = (n: number): string => `${Number(n).toFixed(2)} ر.س`;

export const genId = (p = 'id'): string =>
  `${p}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

export const isValidSaudiPhone = (v: string): boolean =>
  /^(?:\+?966|0)?5\d{8}$/.test(String(v).replace(/\s|-/g, ''));
