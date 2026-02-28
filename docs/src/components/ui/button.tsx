import * as React from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "plain" | "card";
type ButtonSize = "icon" | "panelIcon" | "smIcon" | "smText" | "navTitle";

const variantStyles: Record<ButtonVariant, string> = {
  plain: "btn-plain",
  card: "border border-[var(--color-line-divider)] bg-[var(--color-btn-regular-bg)] text-fd-foreground/80 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] hover:bg-[var(--color-btn-regular-bg-hover)] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] active:bg-[var(--color-btn-regular-bg-active)] active:translate-y-0 active:scale-[0.98] rounded-xl",
};

const sizeStyles: Record<ButtonSize, string> = {
  icon: "h-11 w-11 rounded-lg",
  panelIcon: "h-10 w-10 rounded-lg",
  smIcon: "h-8 w-8 rounded-md",
  smText: "rounded-md px-2 py-1 text-xs",
  navTitle: "h-[3.25rem] rounded-lg px-5 font-bold text-fd-primary",
};

const pressStyles: Partial<Record<ButtonSize, string>> = {
  icon: "active:scale-90",
  navTitle: "active:scale-95",
};

type ButtonStyleOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  animated?: boolean;
  className?: string;
};

export function buttonStyles({
  variant = "plain",
  size = "icon",
  animated = true,
  className,
}: ButtonStyleOptions = {}) {
  return cn(
    "inline-flex items-center justify-center transition-all duration-200",
    variantStyles[variant],
    sizeStyles[size],
    animated && "scale-animation expand-animation",
    animated && pressStyles[size],
    className,
  );
}

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  animated?: boolean;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "plain",
      size = "icon",
      animated = true,
      className,
      type = "button",
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={buttonStyles({ variant, size, animated, className })}
        {...props}
      />
    );
  },
);
