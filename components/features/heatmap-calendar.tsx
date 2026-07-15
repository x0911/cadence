"use client";

import { useEffect, useRef } from "react";
import { resolveColor, type HabitColorToken } from "@/lib/palette";
import { cn, toLocalDateString, getTodayLocal } from "@/lib/utils";
import gsap from "gsap";
import SpotlightCard from "@/components/react-bits/components/SpotlightCard";

interface HeatmapCalendarProps {
  checkedInDates: string[];
  colorToken: string;
  timezone: string;
}

export function HeatmapCalendar({ checkedInDates, colorToken, timezone }: HeatmapCalendarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const colorHex = resolveColor(colorToken as HabitColorToken);

  // Convert checkedInDates array to a Set for O(1) lookup
  const dateSet = new Set(checkedInDates);

  // Generate grid: 26 weeks (182 days) ending today.
  // 7 rows (Sunday to Saturday), 26 columns.
  const today = new Date();
  const cells: { dateStr: string; isChecked: boolean; dayName: string }[] = [];

  // Align grid to start on a Sunday 25 weeks ago.
  // 25 weeks * 7 days = 175 days + current week days.
  const dayOfWeek = today.getDay(); // 0 is Sunday, 6 is Saturday
  const totalDays = 25 * 7 + (dayOfWeek + 1); // covers 25 full weeks + current week

  const startDate = new Date(today);
  startDate.setDate(today.getDate() - totalDays + 1);

  for (let i = 0; i < totalDays; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const dateStr = toLocalDateString(currentDate, timezone);
    const isChecked = dateSet.has(dateStr);

    cells.push({
      dateStr,
      isChecked,
      dayName: currentDate.toLocaleDateString("en-US", { weekday: "short" }),
    });
  }

  // Stagger scale-in animation on mount
  useEffect(() => {
    if (containerRef.current) {
      // Clear any prior inline styles set by GSAP before animating
      const elements = containerRef.current.querySelectorAll(".heatmap-cell");
      gsap.killTweensOf(elements);

      gsap.fromTo(
        elements,
        { scale: 0.3, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.3,
          stagger: {
            grid: "auto",
            each: 0.002,
            from: "start",
          },
          ease: "power2.out",
        }
      );
    }
  }, [checkedInDates]);

  // Group cells by columns (weeks)
  const columns: (typeof cells)[] = [];
  let currentColumn: typeof cells = [];

  // Pad the first column if the start date wasn't a Sunday (though it should be)
  const startDayPadding = new Date(startDate).getDay();
  for (let p = 0; p < startDayPadding; p++) {
    currentColumn.push({ dateStr: "", isChecked: false, dayName: "" });
  }

  cells.forEach((cell) => {
    currentColumn.push(cell);
    if (currentColumn.length === 7) {
      columns.push(currentColumn);
      currentColumn = [];
    }
  });

  if (currentColumn.length > 0) {
    // Pad the last column to 7 elements
    while (currentColumn.length < 7) {
      currentColumn.push({ dateStr: "", isChecked: false, dayName: "" });
    }
    columns.push(currentColumn);
  }

  const weekdaysShort = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <SpotlightCard
      spotlightColor={`${colorHex}5`}
      className="rounded-2xl border border-border/80 bg-card p-6 font-body shadow-sm"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-heading text-lg font-bold text-foreground">Consistency Map</h3>
          <p className="text-xs text-muted-foreground">Activity history over the past 6 months.</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="h-3 w-3 rounded-sm bg-muted" />
          <div className="h-3 w-3 rounded-sm opacity-90" style={{ backgroundColor: colorHex }} />
          <span>More</span>
        </div>
      </div>

      <div ref={containerRef} className="scrollbar-thin flex gap-1.5 overflow-x-auto pb-2">
        {/* Weekday Labels Column */}
        <div className="flex shrink-0 select-none flex-col justify-between pb-2 pr-1.5 pt-1.5 text-[10px] font-semibold text-muted-foreground/60">
          {weekdaysShort.map((day, idx) => (
            <span key={idx} className="flex h-3.5 items-center leading-none">
              {idx % 2 === 1 ? day : ""}
            </span>
          ))}
        </div>

        {/* Grid Columns */}
        <div className="flex gap-1.5">
          {columns.map((column, colIdx) => (
            <div key={colIdx} className="flex shrink-0 flex-col gap-1.5">
              {column.map((cell, rowIdx) => {
                if (!cell.dateStr) {
                  // Padding cells
                  return (
                    <div
                      key={`pad-${colIdx}-${rowIdx}`}
                      className="h-3.5 w-3.5 rounded-sm bg-transparent"
                    />
                  );
                }
                const isToday = cell.dateStr === getTodayLocal(timezone);
                return (
                  <div
                    key={cell.dateStr}
                    className={cn(
                      "heatmap-cell relative h-3.5 w-3.5 cursor-help rounded-[3px] transition-colors duration-200",
                      cell.isChecked
                        ? "opacity-100 shadow-sm"
                        : "bg-muted hover:bg-muted-foreground/20",
                      isToday && "ring-1.5 ring-foreground ring-offset-1"
                    )}
                    style={{
                      backgroundColor: cell.isChecked ? colorHex : undefined,
                    }}
                    title={`${cell.isChecked ? "Checked in" : "No check-in"} on ${new Date(
                      cell.dateStr
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </SpotlightCard>
  );
}
