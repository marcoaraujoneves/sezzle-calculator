import type { BasicCalculationPayload } from "@/lib/schemas";
import { postCalculation } from "@/services/post-calculation";

export function calculate(payload: BasicCalculationPayload): Promise<number> {
  return postCalculation("basic-calculations", payload);
}
