"use client";

import { useState } from "react";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select as UISelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Globe, Eye, Mail, User, Loader2 } from "lucide-react";
import Link from "next/link";

// Common timezones to choose from
const POPULAR_TIMEZONES = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "Africa/Cairo", label: "Africa/Cairo (EET)" },
  { value: "Africa/Johannesburg", label: "Africa/Johannesburg (SAST)" },
  { value: "Africa/Lagos", label: "Africa/Lagos (WAT)" },
  { value: "America/New_York", label: "America/New_York (EST/EDT)" },
  { value: "America/Chicago", label: "America/Chicago (CST/CDT)" },
  { value: "America/Denver", label: "America/Denver (MST/MDT)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (PST/PDT)" },
  { value: "America/Mexico_City", label: "America/Mexico_City (CST/CDT)" },
  { value: "America/Sao_Paulo", label: "America/Sao_Paulo (BRT)" },
  { value: "America/Toronto", label: "America/Toronto (EST/EDT)" },
  { value: "America/Vancouver", label: "America/Vancouver (PST/PDT)" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
  { value: "Asia/Singapore", label: "Asia/Singapore (SGT)" },
  { value: "Asia/Hong_Kong", label: "Asia/Hong_Kong (HKT)" },
  { value: "Asia/Seoul", label: "Asia/Seoul (KST)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (JST)" },
  { value: "Asia/Shanghai", label: "Asia/Shanghai (CST)" },
  { value: "Asia/Jakarta", label: "Asia/Jakarta (WIB)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (GST)" },
  { value: "Europe/London", label: "Europe/London (GMT/BST)" },
  { value: "Europe/Paris", label: "Europe/Paris (CET/CEST)" },
  { value: "Europe/Berlin", label: "Europe/Berlin (CET/CEST)" },
  { value: "Europe/Rome", label: "Europe/Rome (CET/CEST)" },
  { value: "Europe/Madrid", label: "Europe/Madrid (CET/CEST)" },
  { value: "Europe/Moscow", label: "Europe/Moscow (MSK)" },
  { value: "Europe/Istanbul", label: "Europe/Istanbul (TRT)" },
  { value: "Australia/Sydney", label: "Australia/Sydney (AEST/AEDT)" },
  { value: "Pacific/Auckland", label: "Pacific/Auckland (NZST/NZDT)" },
];

interface SettingsFormProps {
  profile: any;
  updateProfile: any;
  isUpdating: boolean;
}

function SettingsForm({ profile, updateProfile, isUpdating }: SettingsFormProps) {
  const { toast } = useToast();

  // Form State initialized directly from loaded profile data
  const [displayName, setDisplayName] = useState(profile.display_name || "");
  const [timezone, setTimezone] = useState(profile.timezone || "UTC");
  const [visuals3d, setVisuals3d] = useState(profile.visuals_3d_enabled ?? true);
  const [weeklyEmail, setWeeklyEmail] = useState(profile.weekly_email_enabled ?? true);

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
        onError: (err: any) => {
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
      const isSupported = POPULAR_TIMEZONES.some((item) => item.value === tz);
      if (isSupported) {
        setTimezone(tz);
        toast({
          title: "Timezone Detected",
          description: `Set to: ${tz}`,
        });
      } else {
        toast({
          title: "Unsupported Timezone",
          description: `Your local timezone (${tz}) is not in the supported list. Please select a supported timezone manually.`,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <form onSubmit={handleSave}>
      <Card className="overflow-hidden rounded-2xl border-border bg-card font-body shadow-sm">
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
            <Label
              htmlFor="display-name"
              className="flex items-center gap-1.5 text-xs font-semibold text-foreground"
            >
              <User className="text-muted-foreground/80 h-4 w-4" />
              Display Name
            </Label>
            <Input
              id="display-name"
              placeholder="e.g. Alex"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={isUpdating}
              maxLength={50}
              className="border-border/80 rounded-xl"
            />
          </div>

          {/* Timezone Selector */}
          <div className="space-y-2">
            <Label
              htmlFor="timezone"
              className="flex items-center gap-1.5 text-xs font-semibold text-foreground"
            >
              <Globe className="text-muted-foreground/80 h-4 w-4" />
              Timezone
            </Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <UISelect value={timezone} onValueChange={setTimezone} disabled={isUpdating}>
                  <SelectTrigger id="timezone" className="border-border/80 rounded-xl">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl font-body">
                    {/* Fallback to render custom timezone if not in popular list (only if value exists) */}
                    {timezone && !POPULAR_TIMEZONES.some((tz) => tz.value === timezone) && (
                      <SelectItem value={timezone}>{timezone}</SelectItem>
                    )}
                    {POPULAR_TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </UISelect>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleAutodetectTimezone}
                disabled={isUpdating}
                className="border-border/80 rounded-xl font-semibold hover:bg-muted hover:text-slate-900"
              >
                Autodetect
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Timezone selection regulates the cutoff boundaries of your daily checking streaks.
            </p>
          </div>

          <div className="border-border/60 my-4 border-t" />

          {/* 3D Visuals Switch */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label
                htmlFor="visuals-3d"
                className="flex items-center gap-1.5 text-sm font-semibold text-foreground"
              >
                <Eye className="text-muted-foreground/80 h-4 w-4" />
                Premium 3D Visuals
              </Label>
              <p className="max-w-[420px] text-xs text-muted-foreground">
                Turn on the 3D rendering of the Streak Orb. If turned off, falls back to a clean
                vector shape. Disable on older devices to save battery.
              </p>
            </div>
            <Switch
              id="visuals-3d"
              checked={visuals3d}
              onCheckedChange={setVisuals3d}
              disabled={isUpdating}
            />
          </div>

          <div className="border-border/60 my-4 border-t" />

          {/* Weekly Email Switch */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label
                htmlFor="weekly-email"
                className="flex items-center gap-1.5 text-sm font-semibold text-foreground"
              >
                <Mail className="text-muted-foreground/80 h-4 w-4" />
                Weekly Progress Emails
              </Label>
              <p className="max-w-[420px] text-xs text-muted-foreground">
                Receive an email recap every Sunday summarizing completions, milestones
                achieved, and focus sessions completed.
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

        <CardFooter className="bg-muted/30 border-border/60 flex justify-end border-t px-6 py-4">
          <Button
            type="submit"
            disabled={isUpdating}
            className="hover:bg-accent/90 flex items-center gap-1.5 rounded-xl bg-accent font-semibold text-accent-foreground"
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
  );
}

export default function SettingsPage() {
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();

  if (isProfileLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] pb-16">
        <header className="border-border/80 border-b bg-white/80 px-4 py-4 backdrop-blur-md">
          <div className="mx-auto flex max-w-2xl items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="font-heading text-lg font-bold">Loading Settings...</span>
          </div>
        </header>
        <main className="mx-auto max-w-2xl px-4 pt-8">
          <Card className="border-border">
            <CardHeader className="space-y-2">
              <div className="h-6 w-1/3 animate-pulse rounded bg-muted" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-10 w-full animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-16">
      {/* Settings Navigation Header */}
      <header className="border-border/80 sticky top-0 z-40 border-b bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
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
        {profile && (
          <SettingsForm
            profile={profile}
            updateProfile={updateProfile}
            isUpdating={isUpdating}
          />
        )}
      </main>
    </div>
  );
}
