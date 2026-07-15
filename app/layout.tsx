import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: {
    template: "%s | Cadence",
    default: "Cadence — Gamified Habit & Streak Tracker",
  },
  description:
    "Build powerful habits with Cadence. Track streaks, visualize progress with a 3D orb, and celebrate milestones. Your consistency, beautifully rendered.",
  keywords: ["habit tracker", "streak tracker", "habit building", "productivity"],
  openGraph: {
    title: "Cadence — Gamified Habit & Streak Tracker",
    description:
      "Build powerful habits with Cadence. Track streaks, visualize progress with a 3D orb, and celebrate milestones.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('cadence-theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (theme === 'dark' || (!theme && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="font-body antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
