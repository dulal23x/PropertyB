export function formatBDT(amount: number): string {
  if (amount >= 10000000) {
    const crore = amount / 10000000;
    return `${crore % 1 === 0 ? crore : crore.toFixed(2)} Crore`;
  } else if (amount >= 100000) {
    const lakh = amount / 100000;
    return `${lakh % 1 === 0 ? lakh : lakh.toFixed(2)} Lakh`;
  }
  return new Intl.NumberFormat('en-IN').format(amount);
}
