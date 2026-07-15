/**
 * tests/unit/streaks.test.ts — Vitest unit tests for lib/streaks.ts
 * Full suite implemented in Phase 3; this stub ensures test runner setup is valid.
 */
import { describe, it, expect } from "vitest";
import {
  computeCurrentStreak,
  computeLongestStreak,
  offsetDate,
  getMilestoneCrossed,
} from "@/lib/streaks";

describe("offsetDate", () => {
  it("advances a date by +1", () => {
    expect(offsetDate("2025-01-01", 1)).toBe("2025-01-02");
  });

  it("goes back by -1", () => {
    expect(offsetDate("2025-01-01", -1)).toBe("2024-12-31");
  });
});

describe("computeCurrentStreak", () => {
  it("returns 0 for empty check-ins", () => {
    expect(computeCurrentStreak([], "UTC")).toBe(0);
  });

  it("returns 0 when last check-in was 2 days ago", () => {
    const twoDaysAgo = offsetDate(new Date().toISOString().slice(0, 10), -2);
    expect(computeCurrentStreak([twoDaysAgo], "UTC")).toBe(0);
  });
});

describe("computeLongestStreak", () => {
  it("returns 0 for empty array", () => {
    expect(computeLongestStreak([])).toBe(0);
  });

  it("correctly finds the longest run", () => {
    expect(
      computeLongestStreak(["2025-01-01", "2025-01-02", "2025-01-03", "2025-01-10"])
    ).toBe(3);
  });
});

describe("getMilestoneCrossed", () => {
  it("detects 7-day milestone", () => {
    expect(getMilestoneCrossed(6, 7)).toBe(7);
  });

  it("returns null when not crossing", () => {
    expect(getMilestoneCrossed(5, 6)).toBeNull();
  });

  it("returns null when already above", () => {
    expect(getMilestoneCrossed(8, 9)).toBeNull();
  });
});
