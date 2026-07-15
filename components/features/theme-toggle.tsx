"use client";

import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDarkTheme = document.documentElement.classList.contains("dark");
    setIsDark(isDarkTheme);
  }, []);

  const handleToggle = (checked: boolean) => {
    setIsDark(checked);
    if (checked) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("cadence-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("cadence-theme", "light");
    }
  };

  if (!mounted) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 rounded-full bg-muted/40" />
        <Switch disabled className="opacity-50" />
        <div className="h-4 w-4 rounded-full bg-muted/40" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Sun className="h-4 w-4 text-muted-foreground" />
      <Switch
        checked={isDark}
        onCheckedChange={handleToggle}
        aria-label="Toggle dark mode"
      />
      <Moon className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}
