import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// Helper to calculate date offsets in timezone
function toLocalDateString(date: Date, timezone = "UTC") {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replace(/\//g, "-");
}

function offsetDate(dateStr: string, days: number) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return toLocalDateString(d, "UTC");
}

export async function POST(request: Request) {
  // Validate cron secret guard to protect from unauthorized hits
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any;
    const email = "demo@cadence.app";

    // 1. Fetch demo user to get ID
    const { data: users, error: listErr } = await admin.auth.admin.listUsers();
    if (listErr) throw new Error(`List users error: ${listErr.message}`);

    const demoUser = users.users.find((u: any) => u.email === email);
    if (!demoUser) {
      return NextResponse.json({ message: "Demo user not found. Seed skipped." }, { status: 404 });
    }

    console.log(`Starting scheduled nightly reset for demo user: ${demoUser.id}`);

    // 2. Clear old habits and check-ins (cascade deletes automatically)
    const { error: delErr } = await admin
      .from("habits")
      .delete()
      .eq("user_id", demoUser.id);
    if (delErr) throw new Error(`Clean old habits error: ${delErr.message}`);

    const today = toLocalDateString(new Date(), "Europe/London");

    // 3. Re-seed clean habit configuration
    const { data: habits, error: hErr } = await admin
      .from("habits")
      .insert([
        {
          user_id: demoUser.id,
          name: "Daily Workout",
          icon: "Dumbbell",
          color: "green-1",
          frequency: "daily",
          focus_mode: true,
          focus_duration_seconds: 1800,
        },
        {
          user_id: demoUser.id,
          name: "Read 30 mins",
          icon: "Book",
          color: "blue-1",
          frequency: "daily",
          focus_mode: false,
        },
        {
          user_id: demoUser.id,
          name: "Mindful Meditation",
          icon: "Brain",
          color: "violet-1",
          frequency: "daily",
          focus_mode: true,
          focus_duration_seconds: 600,
        },
      ])
      .select();

    if (hErr) throw new Error(`Insert habits error: ${hErr.message}`);

    const workoutHabit = habits.find((h: any) => h.name === "Daily Workout");
    const readHabit = habits.find((h: any) => h.name === "Read 30 mins");
    const medHabit = habits.find((h: any) => h.name === "Mindful Meditation");

    if (!workoutHabit || !readHabit || !medHabit) {
      throw new Error("Failed to retrieve seeded habits from database");
    }

    // 4. Seed check-ins history
    const checkInsToInsert = [];

    // Workout streak: 5 days
    for (let i = 0; i < 5; i++) {
      checkInsToInsert.push({
        habit_id: workoutHabit.id,
        user_id: demoUser.id,
        checked_in_date: offsetDate(today, -i),
        focus_duration_seconds: 1800,
      });
    }

    // Read streak: 12 days
    for (let i = 0; i < 12; i++) {
      checkInsToInsert.push({
        habit_id: readHabit.id,
        user_id: demoUser.id,
        checked_in_date: offsetDate(today, -i),
      });
    }

    // Meditation streak: 2 days (yesterday and today)
    checkInsToInsert.push({
      habit_id: medHabit.id,
      user_id: demoUser.id,
      checked_in_date: offsetDate(today, -1),
      focus_duration_seconds: 600,
    });

    const { error: ciErr } = await admin.from("check_ins").insert(checkInsToInsert);
    if (ciErr) throw new Error(`Insert check-ins error: ${ciErr.message}`);

    // 5. Re-seed milestones
    const { error: mErr } = await admin.from("habit_milestones").insert({
      habit_id: readHabit.id,
      milestone_value: 7,
      achieved_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    });
    if (mErr) throw new Error(`Insert milestones error: ${mErr.message}`);

    console.log(`Scheduled nightly reset complete for user ${demoUser.id}`);
    return NextResponse.json({ message: "Nightly reset successfully processed." });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    console.error("Cron reset demo error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Allow GET for testing if no cron secret is configured, else protect it
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    return new NextResponse("Method Not Allowed", { status: 405 });
  }
  return POST(request);
}
