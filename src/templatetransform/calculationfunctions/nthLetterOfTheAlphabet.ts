export function nthLetterOfTheAlphabet(numberStr: string): string {
  const num = parseInt(numberStr);
  if (isNaN(num) || num < 1 || num > 26) {
    throw new Error("Invalid number for alphabet position");
  }
  return String.fromCharCode(num + 96);
}
