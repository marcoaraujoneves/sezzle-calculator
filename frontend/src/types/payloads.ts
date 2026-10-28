import type { z } from "zod";
import type {
  advancedCalculationSchema,
  exponentiationSchema,
  percentageSchema,
} from "@/schemas/advanced-calculations";
import type { basicCalculationSchema } from "@/schemas/basic-calculations";

export type BasicCalculationPayload = z.output<typeof basicCalculationSchema>;

export type AdvancedCalculationPayload = z.output<
  typeof advancedCalculationSchema
>;

export type ExponentiationPayload = z.output<typeof exponentiationSchema>;

export type PercentagePayload = z.output<typeof percentageSchema>;
