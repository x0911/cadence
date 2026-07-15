/**
 * lib/palette.ts — constrained icon + color tokens for habits
 *
 * A fixed palette of 8 accent colors (WCAG AA compliant against #FFFFFF surface)
 * and ~20 Lucide icon keys.
 *
 * Components must only use these token keys — never raw hex or arbitrary icon names.
 */

export const HABIT_COLORS = [
  { token: "green-1",  hex: "#059669", label: "Emerald"   },
  { token: "blue-1",   hex: "#2563EB", label: "Blue"      },
  { token: "violet-1", hex: "#7C3AED", label: "Violet"    },
  { token: "pink-1",   hex: "#DB2777", label: "Pink"      },
  { token: "orange-1", hex: "#EA580C", label: "Orange"    },
  { token: "yellow-1", hex: "#D97706", label: "Amber"     },
  { token: "red-1",    hex: "#DC2626", label: "Red"       },
  { token: "teal-1",   hex: "#0D9488", label: "Teal"      },
] as const;

export type HabitColorToken = (typeof HABIT_COLORS)[number]["token"];

export const HABIT_ICONS = [
  "Dumbbell",
  "Droplets",
  "Book",
  "Moon",
  "Brain",
  "Heart",
  "Leaf",
  "Music",
  "Pencil",
  "Coffee",
  "Bike",
  "Run",
  "Pill",
  "Sun",
  "Zap",
  "Smile",
  "Target",
  "Timer",
  "Flame",
  "Star",
] as const;

export type HabitIconKey = (typeof HABIT_ICONS)[number];

export const MILESTONE_VALUES = [7, 30, 100, 365] as const;
export type MilestoneValue = (typeof MILESTONE_VALUES)[number];

/** Resolve a palette token to its hex value (safe fallback to accent) */
export function resolveColor(token: HabitColorToken): string {
  return HABIT_COLORS.find((c) => c.token === token)?.hex ?? "#059669";
}
