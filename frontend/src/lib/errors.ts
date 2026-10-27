export function httpErrorMessage(endpoint: string, status: number): string {
  return `${endpoint} responded with ${status}`;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
