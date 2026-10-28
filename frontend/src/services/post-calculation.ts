import { API_BASE_URL } from "@/constants/config";
import { httpErrorMessage } from "@/lib/errors";
import { joinUrl } from "@/lib/url";
import type { CalculationResponse } from "@/types/api";

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
  const { result, error } = body;

  if (!response.ok || result === undefined) {
    throw new Error(error ?? httpErrorMessage(endpoint, response.status));
  }

  return result;
}
