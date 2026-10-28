import { ADVANCED_CALCULATIONS_ENDPOINT } from "@/constants/config";
import { postCalculation } from "@/services/post-calculation";
import type {
  AdvancedCalculationPayload,
  ExponentiationPayload,
  PercentagePayload,
} from "@/types/payloads";

export function calculateAdvanced(
  payload:
    AdvancedCalculationPayload | ExponentiationPayload | PercentagePayload,
): Promise<number> {
  return postCalculation(ADVANCED_CALCULATIONS_ENDPOINT, payload);
}
