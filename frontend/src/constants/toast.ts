import type { CSSProperties } from "react";

export const TOAST_CLASS_NAMES = {
  toast:
    "rounded-2xl! border! px-4! py-3.5! font-sans! shadow-panel! backdrop-blur",
  title: "text-sm! font-medium!",
};

export const TOAST_STYLE = {
  "--normal-bg": "#2b1f45",
  "--normal-text": "var(--color-lavender)",
  "--normal-border": "rgb(242 230 255 / 0.15)",
  "--success-bg": "#2b1f45",
  "--success-text": "var(--color-mint)",
  "--success-border": "rgb(159 244 217 / 0.4)",
  "--error-bg": "#2b1f45",
  "--error-text": "var(--color-lavender)",
  "--error-border": "rgb(255 107 129 / 0.5)",
  "--border-radius": "1rem",
} as CSSProperties;
