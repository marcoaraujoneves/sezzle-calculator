import { httpErrorMessage } from "@/lib/errors";
import { joinUrl } from "@/lib/url";
import { API_BASE_URL } from "@/services/config";

export interface HealthResponse {
  status: string;
}

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch(joinUrl(API_BASE_URL, "/healthz"));
  if (!response.ok) {
    throw new Error(httpErrorMessage("healthz", response.status));
  }
  return response.json();
}
