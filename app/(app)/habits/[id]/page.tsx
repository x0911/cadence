import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Habit ${id}`,
  };
}

/**
 * Habit detail page stub — full implementation in Phase 4.
 */
export default async function HabitDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="p-8">
      <h1 className="font-heading text-3xl font-bold text-foreground">
        Habit Detail
      </h1>
      <p className="mt-2 font-body text-muted-foreground">
        Habit <code className="font-mono text-sm">{id}</code> — heatmap and focus timer coming in Phase 4.
      </p>
    </div>
  );
}
