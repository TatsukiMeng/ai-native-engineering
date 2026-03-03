"use client";

import { Palette, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import styles from "./ThemeColorSettings.module.css";

const HUE_STORAGE_KEY = "fuwari-hue";
const DEFAULT_HUE = 250;

function clampHue(value: number) {
  if (!Number.isFinite(value)) return DEFAULT_HUE;
  return Math.max(0, Math.min(360, Math.round(value / 5) * 5));
}

export function ThemeColorSettings() {
  const [mounted, setMounted] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [hue, setHue] = useState(DEFAULT_HUE);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    const fromStorage = window.localStorage.getItem(HUE_STORAGE_KEY);
    const initial = clampHue(
      fromStorage ? Number.parseInt(fromStorage, 10) : DEFAULT_HUE,
    );

    setHue(initial);
    document.documentElement.style.setProperty("--hue", `${initial}`);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.style.setProperty("--hue", `${hue}`);
    window.localStorage.setItem(HUE_STORAGE_KEY, `${hue}`);
  }, [hue, mounted]);

  useEffect(() => {
    if (!panelOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (!rootRef.current?.contains(target)) {
        setPanelOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPanelOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [panelOpen]);

  if (!mounted) {
    return <div className="h-11 w-11" />;
  }

  return (
    <div ref={rootRef} className="relative z-50 hidden md:block">
      <Button
        aria-label="主题色设置"
        size="icon"
        className="active:scale-90"
        onClick={() => setPanelOpen((open) => !open)}
      >
        <Palette className="h-5 w-5" />
      </Button>

      <div
        className={`absolute top-11 -right-2 pt-5 transition-all ${panelOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <div className="card-base w-80 bg-(--color-float-panel-bg) px-4 py-4 shadow-(--float-panel-shadow)">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="relative ml-3 flex items-center gap-2 text-lg font-bold text-neutral-900 transition before:absolute before:-left-3 before:top-[0.33rem] before:h-4 before:w-1 before:rounded-md before:bg-(--primary) dark:text-neutral-100">
              主题色
              <button
                aria-label="重置主题色"
                type="button"
                className={`inline-flex h-7 w-7 items-center justify-center rounded-md bg-(--btn-regular-bg) text-(--btn-content) transition active:scale-90 ${hue === DEFAULT_HUE ? "pointer-events-none opacity-0" : "opacity-100"}`}
                onClick={() => setHue(DEFAULT_HUE)}
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex h-7 w-10 items-center justify-center rounded-md bg-(--btn-regular-bg) text-sm font-bold text-(--btn-content) transition">
              {hue}
            </div>
          </div>

          <div className={styles.sliderShell}>
            <input
              aria-label="主题色"
              type="range"
              min={0}
              max={360}
              step={5}
              value={hue}
              className={styles.slider}
              onChange={(event) =>
                setHue(clampHue(Number.parseInt(event.target.value, 10)))
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
