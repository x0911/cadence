// supabase/functions/weekly-summary/index.ts
//
// Deno Edge Function to aggregate weekly habit stats and dispatch summaries.
// Reads new credentials from:
//   - SUPABASE_SECRET_KEYS (keyed by "default")
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

    // ── 3. Fetch profiles opting in for weekly emails ──
    const { data: profiles, error: pErr } = await supabase
      .from("profiles")
      .select("id, display_name, timezone")
      .eq("weekly_email_enabled", true);

    if (pErr) throw pErr;
    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ message: "No active users opted in for reports" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Past 7 days window calculation
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().slice(0, 10);

    const reportsProcessed = [];

    for (const profile of profiles) {
      // Fetch user email from admin console
      const { data: userData, error: uErr } = await supabase.auth.admin.getUserById(profile.id);
      if (uErr || !userData.user || !userData.user.email) continue;
      const userEmail = userData.user.email;

      // Fetch active habits
      const { data: habits, error: hErr } = await supabase
        .from("habits")
        .select("id, name")
        .eq("user_id", profile.id)
        .is("archived_at", null);

      if (hErr || !habits || habits.length === 0) continue;

      const habitIds = habits.map((h) => h.id);

      // Fetch check-ins
      const { data: checkIns, error: cErr } = await supabase
        .from("check_ins")
        .select("habit_id, checked_in_date, focus_duration_seconds")
        .in("habit_id", habitIds)
        .gte("checked_in_date", sevenDaysAgoStr);

      if (cErr) continue;

      const checkInsList = checkIns || [];
      const totalCheckIns = checkInsList.length;
      let totalFocusSeconds = 0;
      checkInsList.forEach((ci) => {
        if (ci.focus_duration_seconds) {
          totalFocusSeconds += ci.focus_duration_seconds;
        }
      });

      const totalFocusHours = (totalFocusSeconds / 3600).toFixed(1);

      // Formulate simple JSON summary
      reportsProcessed.push({
        email: userEmail,
        display_name: profile.display_name || userEmail.split("@")[0],
        totalCheckIns,
        totalFocusHours,
        habitsCount: habits.length,
      });

      // Dispatch to Resend API if config is present
      const resendApiKey = Deno.env.get("RESEND_API_KEY");
      if (resendApiKey) {
        try {
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: "Cadence Tracker <updates@resend.dev>",
              to: userEmail,
              subject: "Weekly Summary Report",
              html: `
                <p>Hello ${profile.display_name || "User"},</p>
                <p>Here is your weekly summary report from Cadence:</p>
                <ul>
                  <li>Completions: ${totalCheckIns}</li>
                  <li>Focused Time: ${totalFocusHours} hours</li>
                  <li>Active Habits: ${habits.length}</li>
                </ul>
              `,
            }),
          });
          if (!res.ok) {
            console.error(`Resend API dispatch error for ${userEmail}:`, await res.text());
          }
        } catch (mailErr) {
          console.error(`Mail dispatch failed for ${userEmail}:`, mailErr);
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: `Processed weekly reports for ${reportsProcessed.length} users.`,
        processed: reportsProcessed,
      }),
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
