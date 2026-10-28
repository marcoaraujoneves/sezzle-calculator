import type { AdvancedCalculationPayload } from "@/lib/schemas";
import { postCalculation } from "@/services/post-calculation";

export function calculateAdvanced(
  payload: AdvancedCalculationPayload,
): Promise<number> {
  return postCalculation("advanced-calculations", payload);
}
