import {
  ChevronUp,
  Delete,
  Diff,
  Divide,
  Equal,
  Minus,
  Percent,
  Plus,
  Radical,
  X,
} from "lucide-react";
import { KEY_ID } from "@/constants/keypad";
import type { KeyIcons } from "@/types/key-icons";

export const KEY_ICONS: KeyIcons = {
  [KEY_ID.backspace]: Delete,
  [KEY_ID.sign]: Diff,
  [KEY_ID.equals]: Equal,
  sqrt: Radical,
  divide: Divide,
  multiply: X,
  subtract: Minus,
  add: Plus,
  percent: Percent,
  power: ChevronUp,
};
