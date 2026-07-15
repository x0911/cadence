"use client";

import { useEffect, useState } from "react";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Globe, Eye, Mail, User, Loader2 } from "lucide-react";
import Link from "next/link";

// Common timezones to choose from
const POPULAR_TIMEZONES = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "Europe/London", label: "Europe/London (GMT/BST)" },
  { value: "Europe/Paris", label: "Europe/Paris (CET/CEST)" },
  { value: "Europe/Moscow", label: "Europe/Moscow (MSK)" },
  { value: "America/New_York", label: "America/New_York (EST/EDT)" },
  { value: "America/Chicago", label: "America/Chicago (CST/CDT)" },
  { value: "America/Denver", label: "America/Denver (MST/MDT)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (PST/PDT)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (JST)" },
  { value: "Asia/Shanghai", label: "Asia/Shanghai (CST)" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (GST)" },
  { value: "Australia/Sydney", label: "Australia/Sydney (AEST/AEDT)" },
];

export default function SettingsPage() {
  const { toast } = useToast();
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();

  // Form State
  const [displayName, setDisplayName] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [visuals3d, setVisuals3d] = useState(true);
  const [weeklyEmail, setWeeklyEmail] = useState(true);

  // Sync state with loaded profile
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setTimezone(profile.timezone || "UTC");
      setVisuals3d(profile.visuals_3d_enabled);
      setWeeklyEmail(profile.weekly_email_enabled);
    }
  }, [profile]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    updateProfile(
      {
        display_name: displayName.trim() || null,
        timezone,
        visuals_3d_enabled: visuals3d,
        weekly_email_enabled: weeklyEmail,
      },
      {
        onSuccess: () => {
          toast({
            title: "Settings Saved",
            description: "Your customization preferences have been updated.",
          });
        },
        onError: (err) => {
          toast({
            title: "Save Failed",
            description: err.message || "Failed to update profile settings.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleAutodetectTimezone = () => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) {
      setTimezone(tz);
      toast({
        title: "Timezone Detected",
        description: `Set to: ${tz}`,
      });
    }
  };

  if (isProfileLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] pb-16">
        <header className="border-b border-border/80 bg-white/80 backdrop-blur-md py-4 px-4">
          <div className="mx-auto max-w-2xl flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="font-heading text-lg font-bold">Loading Settings...</span>
          </div>
        </header>
        <main className="mx-auto max-w-2xl px-4 pt-8">
          <Card className="border-border">
            <CardHeader className="space-y-2">
              <div className="h-6 w-1/3 bg-muted rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-10 w-full bg-muted rounded animate-pulse" />
              <div className="h-10 w-full bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-16">
      {/* Settings Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to Dashboard</span>
            </Button>
          </Link>
          <span className="font-heading text-lg font-bold tracking-tight text-foreground">
            Settings & Account
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-8">
        <form onSubmit={handleSave}>
          <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden font-body">
            <CardHeader>
              <CardTitle className="font-heading text-2xl font-bold tracking-tight">
                Profile Customization
              </CardTitle>
              <CardDescription>
                Customize display names, timezone metrics, and visuals of your Streak Orb.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="display-name" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <User className="h-4 w-4 text-muted-foreground/80" />
                  Display Name
                </Label>
                <Input
                  id="display-name"
                  placeholder="e.g. Alex"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={isUpdating}
                  maxLength={50}
                  className="rounded-xl border-border/80"
                />
              </div>

              {/* Timezone Selector */}
              <div className="space-y-2">
                <Label htmlFor="timezone" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-muted-foreground/80" />
                  Timezone
                </Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select value={timezone} onValueChange={setTimezone} disabled={isUpdating}>
                      <SelectTrigger id="timezone" className="rounded-xl border-border/80">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl font-body">
                        {/* Fallback to render custom timezone if not in popular list */}
                        {!POPULAR_TIMEZONES.some((tz) => tz.value === timezone) && (
                          <SelectItem value={timezone}>{timezone}</SelectItem>
                        )}
                        {POPULAR_TIMEZONES.map((tz) => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAutodetectTimezone}
                    disabled={isUpdating}
                    className="rounded-xl border-border/80 hover:bg-muted font-semibold"
                  >
                    Autodetect
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Timezone selection regulates the cutoff boundaries of your daily checking streaks.
                </p>
              </div>

              <div className="border-t border-border/60 my-4" />

              {/* 3D Visuals Switch */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="visuals-3d" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Eye className="h-4 w-4 text-muted-foreground/80" />
                    Premium 3D Visuals
                  </Label>
                  <p className="text-xs text-muted-foreground max-w-[420px]">
                    Turn on the 3D rendering of the Streak Orb. If turned off, falls back to a clean vector shape. Disable on older devices to save battery.
                  </p>
                </div>
                <Switch
                  id="visuals-3d"
                  checked={visuals3d}
                  onCheckedChange={setVisuals3d}
                  disabled={isUpdating}
                />
              </div>

              <div className="border-t border-border/60 my-4" />

              {/* Weekly Email Switch */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="weekly-email" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-muted-foreground/80" />
                    Weekly Progress Emails
                  </Label>
                  <p className="text-xs text-muted-foreground max-w-[420px]">
                    Receive an email recap every Sunday summarizing completions, milestones achieved, and focus sessions completed.
                  </p>
                </div>
                <Switch
                  id="weekly-email"
                  checked={weeklyEmail}
                  onCheckedChange={setWeeklyEmail}
                  disabled={isUpdating}
                />
              </div>
            </CardContent>

            <CardFooter className="bg-muted/30 border-t border-border/60 px-6 py-4 flex justify-end">
              <Button
                type="submit"
                disabled={isUpdating}
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-xl flex items-center gap-1.5"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Preferences</span>
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </main>
    </div>
  );
}
