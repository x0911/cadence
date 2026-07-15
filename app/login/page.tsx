"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Flame, Mail, Lock, Loader2, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isMagicLink, setIsMagicLink] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const supabase = createClient();
  const router = useRouter();
  const { toast } = useToast();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Missing Email",
        description: "Please enter your email address to sign in.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (isMagicLink) {
        // Sign in with Magic Link
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        toast({
          title: "Magic Link Sent!",
          description: "Check your email inbox for the sign-in link.",
        });
      } else {
        // Sign in with Email / Password
        if (!password) {
          toast({
            title: "Missing Password",
            description: "Please enter your password.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast({
          title: "Welcome Back!",
          description: "Redirecting to your dashboard...",
        });
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please check your credentials.";
      toast({
        title: "Authentication Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTryDemo = async () => {
    setDemoLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: "demo@cadence.app",
        password: "DemoPassword123!",
      });

      if (error) throw error;

      toast({
        title: "Demo Signed In!",
        description: "Welcome to the Cadence interactive playground.",
      });

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to sign into the demo account.";
      toast({
        title: "Demo Access Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#FAFAFA] px-4 py-12">
      {/* Background visual detail */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[40%] -left-[10%] h-[80%] w-[50%] rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute -bottom-[40%] -right-[10%] h-[80%] w-[50%] rounded-full bg-accent/5 blur-[120px]" />
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Confident logo design */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground shadow-md transition-transform hover:scale-105">
            <Flame className="h-6 w-6" />
          </div>
          <h1 className="font-heading text-4xl font-extrabold tracking-tight text-foreground">
            Cadence
          </h1>
          <p className="font-body text-sm text-muted-foreground max-w-xs text-balance">
            Your consistency, beautifully tracked. Establish streaks, hit milestones.
          </p>
        </div>

        <Card className="border-border bg-card shadow-lg shadow-black/[0.03] rounded-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="font-heading text-2xl font-bold tracking-tight">
              {isMagicLink ? "Sign in with Link" : "Sign In"}
            </CardTitle>
            <CardDescription className="font-body text-sm text-muted-foreground">
              {isMagicLink
                ? "Enter your email to receive a passwordless sign-in link"
                : "Enter your email and password to log into your account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-body text-xs font-semibold text-foreground">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground/60" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-10 font-body"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading || demoLoading}
                    required
                  />
                </div>
              </div>

              {!isMagicLink && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="font-body text-xs font-semibold text-foreground">
                      Password
                    </Label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground/60" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 font-body"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading || demoLoading}
                      required={!isMagicLink}
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full font-body font-semibold bg-accent text-accent-foreground hover:bg-accent/90"
                disabled={loading || demoLoading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : isMagicLink ? (
                  "Send Magic Link"
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground font-body font-medium">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              type="button"
              className="w-full font-body font-semibold border-border hover:bg-muted"
              disabled={loading || demoLoading}
              onClick={() => setIsMagicLink(!isMagicLink)}
            >
              {isMagicLink ? "Use password instead" : "Passwordless Magic Link"}
            </Button>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-0">
            <span className="w-full border-t border-border/60 my-2" />
            
            <div className="w-full text-center">
              <p className="font-body text-xs text-muted-foreground mb-3">
                Want to check out the app instantly without signing up?
              </p>
              <Button
                type="button"
                className="w-full font-body font-bold border-accent/20 bg-accent/5 text-accent hover:bg-accent/10 hover:text-accent shadow-none group"
                onClick={handleTryDemo}
                disabled={loading || demoLoading}
              >
                {demoLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Preparing Playground...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                    Try Interactive Guest Demo
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
