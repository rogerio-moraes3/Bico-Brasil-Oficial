export interface DestaquePlanOption {
  days: number;
  label: string;
  price: number;
}

export const destaquePlanOptions: DestaquePlanOption[] = [
  { days: 1, label: '1 dia', price: 9.90 },
  { days: 3, label: '3 dias', price: 24.90 },
  { days: 7, label: '7 dias', price: 39.90 },
  { days: 15, label: '15 dias', price: 69.90 },
  { days: 30, label: '30 dias', price: 99.90 },
];

export const destaquePriceTable: Record<number, number> = Object.fromEntries(
  destaquePlanOptions.map((option) => [option.days, option.price])
);

export const destaqueMinPrice = Math.min(...destaquePlanOptions.map((option) => option.price));
