import type {
  AdvancedCalculationPayload,
  ExponentiationPayload,
} from "@/lib/schemas";
import { postCalculation } from "@/services/post-calculation";

export function calculateAdvanced(
  payload: AdvancedCalculationPayload | ExponentiationPayload,
): Promise<number> {
  return postCalculation("advanced-calculations", payload);
}
