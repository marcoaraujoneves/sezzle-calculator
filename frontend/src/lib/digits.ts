// The sign and decimal point are part of the number but not of the backend's digit limit.
export function countDigits(value: string): number {
  return value.replace(/[-.]/g, "").length;
}
