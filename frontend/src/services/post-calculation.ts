import { httpErrorMessage } from "@/lib/errors";
import { joinUrl } from "@/lib/url";
import { API_BASE_URL } from "@/services/config";

interface CalculationResponse {
  result?: number;
  error?: string;
}

export async function postCalculation(
  endpoint: string,
  payload: object,
): Promise<number> {
  const response = await fetch(joinUrl(API_BASE_URL, `/${endpoint}`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body: CalculationResponse = await response.json().catch(() => ({}));

  if (!response.ok || body.result === undefined) {
    throw new Error(body.error ?? httpErrorMessage(endpoint, response.status));
  }
  return body.result;
}
