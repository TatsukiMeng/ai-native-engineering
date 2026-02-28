"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";

type ThemeToggleProps = {
  size?: ButtonProps["size"];
  animated?: boolean;
  className?: string;
};

export function ThemeToggle({
  size = "icon",
  animated = true,
  className,
}: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    if (size === "smIcon") return <div className="h-8 w-8" />;
    if (size === "panelIcon") return <div className="h-10 w-10" />;
    return <div className="h-11 w-11" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      size={size}
      animated={animated}
      className={className}
      aria-label="切换主题"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </Button>
  );
}
