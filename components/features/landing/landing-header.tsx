"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Flame, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/features/theme-toggle";

export function LandingHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md font-body">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent shadow-glow">
            <Flame className="h-5 w-5 fill-current animate-pulse" />
          </div>
          <span className="font-heading text-xl font-bold tracking-tight text-foreground">
            Cadence
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-muted-foreground">
          <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
        </nav>

        {/* Action button & theme toggle */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login">
            <Button className="rounded-xl font-semibold bg-accent text-accent-foreground hover:bg-accent/90 shadow-glow px-5">
              Go to App →
            </Button>
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-xl text-muted-foreground hover:text-foreground"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-border/40 bg-background animate-fade-in py-6 px-4 space-y-4 shadow-lg">
          <nav className="flex flex-col gap-4 text-sm font-semibold text-muted-foreground">
            <a
              href="#how-it-works"
              onClick={() => setIsOpen(false)}
              className="hover:text-foreground transition-colors block py-2"
            >
              How it works
            </a>
            <a
              href="#features"
              onClick={() => setIsOpen(false)}
              className="hover:text-foreground transition-colors block py-2"
            >
              Features
            </a>
            <a
              href="#pricing"
              onClick={() => setIsOpen(false)}
              className="hover:text-foreground transition-colors block py-2"
            >
              Pricing
            </a>
          </nav>
          <div className="pt-4 border-t border-border/40">
            <Link href="/login" onClick={() => setIsOpen(false)}>
              <Button className="w-full rounded-xl font-semibold bg-accent text-accent-foreground hover:bg-accent/90 shadow-glow">
                Go to App →
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
