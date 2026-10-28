import type {
  AdvancedCalculationPayload,
  ExponentiationPayload,
  PercentagePayload,
} from "@/lib/schemas";
import { postCalculation } from "@/services/post-calculation";

export function calculateAdvanced(
  payload:
    AdvancedCalculationPayload | ExponentiationPayload | PercentagePayload,
): Promise<number> {
  return postCalculation("advanced-calculations", payload);
}
