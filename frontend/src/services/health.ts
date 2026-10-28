import { API_BASE_URL, HEALTH_ENDPOINT } from "@/constants/config";
import { httpErrorMessage } from "@/lib/errors";
import { joinUrl } from "@/lib/url";
import type { HealthResponse } from "@/types/api";

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch(joinUrl(API_BASE_URL, `/${HEALTH_ENDPOINT}`));

  if (!response.ok) {
    throw new Error(httpErrorMessage(HEALTH_ENDPOINT, response.status));
  }

  return response.json();
}
