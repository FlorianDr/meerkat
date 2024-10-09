export function dateDeductedMinutes(minutes: number) {
  return new Date(Date.now() - minutes * 60 * 1000);
}
