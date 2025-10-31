export const monthNames: string[] = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function nthMonthOfTheYear(numberStr: string): string {
  const num = parseInt(numberStr);
  if (isNaN(num) || num < 1 || num > 12) {
    throw new Error("Invalid number for month position");
  }
  return monthNames[num - 1]!;
}
