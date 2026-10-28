import { BASIC_CALCULATIONS_ENDPOINT } from "@/constants/config";
import { postCalculation } from "@/services/post-calculation";
import type { BasicCalculationPayload } from "@/types/payloads";

export function calculate(payload: BasicCalculationPayload): Promise<number> {
  return postCalculation(BASIC_CALCULATIONS_ENDPOINT, payload);
}
