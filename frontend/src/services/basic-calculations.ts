import { httpErrorMessage } from "@/lib/errors";
import { joinUrl } from "@/lib/url";
import type { BasicCalculationPayload } from "@/lib/schemas";
import { API_BASE_URL } from "@/services/config";

interface BasicCalculationsResponse {
  result?: number;
  error?: string;
}

export async function calculate(
  payload: BasicCalculationPayload,
): Promise<number> {
  const response = await fetch(joinUrl(API_BASE_URL, "/basic-calculations"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body: BasicCalculationsResponse = await response
    .json()
    .catch(() => ({}));

  if (!response.ok || body.result === undefined) {
    throw new Error(
      body.error ?? httpErrorMessage("basic-calculations", response.status),
    );
  }
  return body.result;
}
