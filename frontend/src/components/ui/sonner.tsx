import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react";
import { TOAST_CLASS_NAMES, TOAST_STYLE } from "@/constants/toast";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-5 text-mint" />,
        info: <InfoIcon className="size-5 text-lavender" />,
        warning: <TriangleAlertIcon className="size-5 text-amber-300" />,
        error: <OctagonXIcon className="size-5 text-[#ff6b81]" />,
        loading: <Loader2Icon className="size-5 animate-spin" />,
      }}
      style={TOAST_STYLE}
      toastOptions={{ classNames: TOAST_CLASS_NAMES }}
      {...props}
    />
  );
};

export { Toaster };
