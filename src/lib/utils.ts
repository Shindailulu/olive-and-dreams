export function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

export function formatNaira(amount: number): string {
  return (
    "₦" +
    amount.toLocaleString("en-NG", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  );
}

export function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `OD-${year}-${rand}`;
}
