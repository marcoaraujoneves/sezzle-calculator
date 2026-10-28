import type {
  ADVANCED_OPERATIONS,
  EXPONENTIATION,
  OPERATIONS,
  PERCENTAGE,
} from "@/constants/operations";

export type Operation = (typeof OPERATIONS)[number];

export type AdvancedOperation = (typeof ADVANCED_OPERATIONS)[number];

export type SelectableOperation =
  Operation | typeof EXPONENTIATION | typeof PERCENTAGE;
