export function parseDDMMYYYY(dateStr: string): Date {
  const [day, month, year] = dateStr.split("-");
  return new Date(`${year}-${month}-${day}T00:00:00Z`);
}