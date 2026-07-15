import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { Resend } from "resend";

export async function POST(request: Request) {
  // Validate cron secret guard
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.warn("RESEND_API_KEY not configured. Cron weekly summary will run in dry-run mode.");
  }

  const resend = resendKey ? new Resend(resendKey) : null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;

  try {
    // 1. Fetch all profiles opting in for weekly emails
    const { data: profiles, error: pErr } = await admin
      .from("profiles")
      .select("id, display_name, timezone")
      .eq("weekly_email_enabled", true);

    if (pErr) throw new Error(`Query profiles failed: ${pErr.message}`);
    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ message: "No active profiles configured for weekly emails." });
    }

    console.log(`Sending weekly summary report to ${profiles.length} users...`);

    // Past 7 days calculation bounds
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    const sevenDaysAgoStr = sevenDaysAgo.toISOString().slice(0, 10);

    for (const profile of profiles) {
      // 2. Fetch habits for this profile
      const { data: habits, error: hErr } = await admin
        .from("habits")
        .select("id, name, color, focus_mode")
        .eq("user_id", profile.id)
        .is("archived_at", null);

      if (hErr || !habits || habits.length === 0) continue;

      const habitIds = habits.map((h: any) => h.id);

      // 3. Fetch check-ins over the last 7 days for these habits
      const { data: checkIns, error: cErr } = await admin
        .from("check_ins")
        .select("habit_id, checked_in_date, focus_duration_seconds")
        .in("habit_id", habitIds)
        .gte("checked_in_date", sevenDaysAgoStr);

      if (cErr) continue;

      const checkInsList = checkIns || [];

      // Calculate statistics
      const totalCheckIns = checkInsList.length;
      let totalFocusSeconds = 0;
      checkInsList.forEach((ci: any) => {
        if (ci.focus_duration_seconds) {
          totalFocusSeconds += ci.focus_duration_seconds;
        }
      });

      // Group checkins by habit to display details
      const summaryList = habits.map((h: any) => {
        const hCheckins = checkInsList.filter((ci: any) => ci.habit_id === h.id);
        const count = hCheckins.length;
        const totalMin = Math.round(
          hCheckins.reduce((acc: number, curr: any) => acc + (curr.focus_duration_seconds || 0), 0) / 60
        );

        return {
          name: h.name,
          completions: count,
          minutes: totalMin,
        };
      });

      const totalFocusHours = (totalFocusSeconds / 3600).toFixed(1);

      // Fetch user email from auth admin list
      const { data: userData, error: uErr } = await admin.auth.admin.getUserById(profile.id);
      if (uErr || !userData.user || !userData.user.email) continue;

      const userEmail = userData.user.email;
      const displayName = profile.display_name || userEmail.split("@")[0];

      // Formulate premium weekly HTML layout matching project styles
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Your Weekly Cadence Summary</title>
          <style>
            body {
              background-color: #FAFAFA;
              color: #0F172A;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              margin: 0;
              padding: 40px 20px;
            }
            .container {
              background-color: #FFFFFF;
              border: 1px border #E2E8E4;
              border-radius: 16px;
              max-width: 580px;
              margin: 0 auto;
              padding: 32px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            }
            .header {
              text-align: center;
              margin-bottom: 32px;
            }
            .logo {
              background-color: #059669;
              color: #FFFFFF;
              display: inline-block;
              font-size: 24px;
              font-weight: bold;
              height: 48px;
              line-height: 48px;
              width: 48px;
              border-radius: 12px;
              margin-bottom: 12px;
            }
            h1 {
              font-size: 24px;
              font-weight: 800;
              margin: 0;
              color: #0F172A;
            }
            .subtitle {
              color: #64748B;
              font-size: 14px;
              margin-top: 4px;
            }
            .stats-grid {
              display: table;
              width: 100%;
              margin-bottom: 32px;
              border-bottom: 1px solid #E2E8E4;
              padding-bottom: 24px;
            }
            .stat-box {
              display: table-cell;
              text-align: center;
              width: 50%;
            }
            .stat-num {
              font-size: 32px;
              font-weight: 800;
              color: #059669;
            }
            .stat-label {
              font-size: 11px;
              text-transform: uppercase;
              color: #64748B;
              font-weight: 600;
              letter-spacing: 0.05em;
            }
            .habit-item {
              padding: 16px 0;
              border-bottom: 1px solid #F0F4F1;
            }
            .habit-name {
              font-weight: 600;
              font-size: 16px;
            }
            .habit-details {
              color: #64748B;
              font-size: 13px;
              margin-top: 2px;
            }
            .footer {
              text-align: center;
              color: #94A3B8;
              font-size: 12px;
              margin-top: 4px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🔥</div>
              <h1>Cadence Report</h1>
              <div class="subtitle">Weekly breakdown for ${displayName}</div>
            </div>

            <div class="stats-grid">
              <div class="stat-box">
                <div class="stat-num">${totalCheckIns}</div>
                <div class="stat-label">Completions</div>
              </div>
              <div class="stat-box" style="border-left: 1px solid #E2E8E4;">
                <div class="stat-num">${totalFocusHours}h</div>
                <div class="stat-label">Time Focused</div>
              </div>
            </div>

            <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 16px;">Ritual breakdown</h2>
            
            ${summaryList
              .map(
                (item: any) => `
              <div class="habit-item">
                <div class="habit-name">${item.name}</div>
                <div class="habit-details">
                  Completed ${item.completions} time${item.completions !== 1 ? "s" : ""}${
                    item.minutes > 0 ? ` · Focused for ${item.minutes} mins` : ""
                  }
                </div>
              </div>
            `
              )
              .join("")}

            <div style="text-align: center; margin-top: 32px;">
              <a href="${request.url.split("/api")[0]}/dashboard" 
                 style="background-color: #059669; color: #FFFFFF; text-decoration: none; padding: 12px 24px; font-weight: 600; font-size: 14px; border-radius: 12px; display: inline-block;">
                Open Dashboard
              </a>
            </div>
            
            <div class="footer" style="margin-top: 40px; border-t: 1px solid #E2E8E4; padding-top: 16px;">
              You received this because weekly emails are enabled in your Cadence settings.<br>
              <a href="${request.url.split("/api")[0]}/settings" style="color: #64748B;">Manage email settings</a>
            </div>
          </div>
        </body>
        </html>
      `;

      // 4. Dispatch Email via Resend if enabled, else dry-run log
      if (resend) {
        try {
          await resend.emails.send({
            from: "Cadence Tracker <updates@resend.dev>", // default sender for dev accounts
            to: userEmail,
            subject: "Your Weekly Cadence Summary",
            html: htmlContent,
          });
          console.log(`✅ Weekly summary email successfully sent to: ${userEmail}`);
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Mail send failed";
          console.error(`Failed to send email to ${userEmail}:`, msg);
        }
      } else {
        console.log(`[DRY-RUN] Weekly Summary for: ${userEmail}\nCompletions: ${totalCheckIns}\nFocus Time: ${totalFocusHours} hours`);
      }
    }

    return NextResponse.json({ message: "Weekly summary reports processed." });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    console.error("Cron weekly summary error:", message);
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
