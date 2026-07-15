// supabase/functions/reset-demo-data/index.ts
//
// Deno Edge Function to reset the guest demo account.
// Reads new publishable/secret keys from JSON environment objects:
//   - SUPABASE_PUBLISHABLE_KEYS (keyed by "default")
//   - SUPABASE_SECRET_KEYS (keyed by "default")
// Keys are sent on the `apikey` header (never Authorization: Bearer).
// Custom apikey verification is done in the function (verify_jwt = false).

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.5";

Deno.serve(async (req: Request) => {
  try {
    // ── 1. Custom apikey header check (as verify_jwt = false is set in config) ──
    const incomingApiKey = req.headers.get("apikey");
    const secretKeysJson = Deno.env.get("SUPABASE_SECRET_KEYS") || "{}";
    const secretKeys = JSON.parse(secretKeysJson);
    const expectedSecretKey = secretKeys["default"] || "";

    if (!incomingApiKey || incomingApiKey !== expectedSecretKey) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";

    // ── 2. Create elevated admin client using the secret key ──
    // Note: sent on apikey header (not Bearer)
    const supabase = createClient(supabaseUrl, expectedSecretKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          apikey: expectedSecretKey,
        },
      },
    });

    const email = "demo@cadence.app";

    // ── 3. Find demo user ──
    const { data: users, error: listErr } = await supabase.auth.admin.listUsers();
    if (listErr) throw listErr;

    const demoUser = users.users.find((u) => u.email === email);
    if (!demoUser) {
      return new Response(JSON.stringify({ message: "Demo user not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ── 4. Truncate habits (cascade delete check-ins & milestones) ──
    const { error: delErr } = await supabase
      .from("habits")
      .delete()
      .eq("user_id", demoUser.id);
    if (delErr) throw delErr;

    // Today in local timezone
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/London",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .format(new Date())
      .replace(/\//g, "-");

    // Helper to offset date
    const offsetDate = (dateStr: string, days: number) => {
      const d = new Date(`${dateStr}T00:00:00Z`);
      d.setUTCDate(d.getUTCDate() + days);
      return d.toISOString().slice(0, 10);
    };

    // ── 5. Re-seed demo habits ──
    const { data: habits, error: hErr } = await supabase
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

    if (hErr) throw hErr;

    const workoutHabit = habits.find((h: any) => h.name === "Daily Workout");
    const readHabit = habits.find((h: any) => h.name === "Read 30 mins");
    const medHabit = habits.find((h: any) => h.name === "Mindful Meditation");

    // ── 6. Seed check-ins ──
    const checkInsToInsert = [];

    for (let i = 0; i < 5; i++) {
      checkInsToInsert.push({
        habit_id: workoutHabit.id,
        user_id: demoUser.id,
        checked_in_date: offsetDate(today, -i),
        focus_duration_seconds: 1800,
      });
    }

    for (let i = 0; i < 12; i++) {
      checkInsToInsert.push({
        habit_id: readHabit.id,
        user_id: demoUser.id,
        checked_in_date: offsetDate(today, -i),
      });
    }

    checkInsToInsert.push({
      habit_id: medHabit.id,
      user_id: demoUser.id,
      checked_in_date: offsetDate(today, -1),
      focus_duration_seconds: 600,
    });

    const { error: ciErr } = await supabase.from("check_ins").insert(checkInsToInsert);
    if (ciErr) throw ciErr;

    // ── 7. Seed milestone ──
    const { error: mErr } = await supabase.from("habit_milestones").insert({
      habit_id: readHabit.id,
      milestone_value: 7,
      achieved_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    });
    if (mErr) throw mErr;

    return new Response(
      JSON.stringify({ message: "Demo data reset completed successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
