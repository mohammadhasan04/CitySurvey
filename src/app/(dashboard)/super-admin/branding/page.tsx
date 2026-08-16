"use client";

import { useState } from "react";
import { PageHeader, SectionCard } from "@/components/shared/page-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, Palette, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const THEME_PRESETS = [
  {
    id: "sapphire",
    name: "Sapphire Royal (Default)",
    description: "Deep slate blue with vibrant cyan accents for government portals",
    primary: "#2563eb",
    accent: "#0d9488",
    bgGradient: "from-blue-600 via-indigo-600 to-teal-500",
  },
  {
    id: "emerald",
    name: "Emerald Civic",
    description: "Rich emerald green with forest teal accents for sustainability",
    primary: "#059669",
    accent: "#0d9488",
    bgGradient: "from-emerald-600 via-teal-600 to-cyan-500",
  },
  {
    id: "indigo",
    name: "Indigo Aurora",
    description: "Modern indigo and violet for high-tech municipal analytics",
    primary: "#4f46e5",
    accent: "#7c3aed",
    bgGradient: "from-indigo-600 via-purple-600 to-pink-500",
  },
  {
    id: "cyan",
    name: "Midnight Cyan",
    description: "Sleek dark mode theme with glowing cyan highlights",
    primary: "#0891b2",
    accent: "#0284c7",
    bgGradient: "from-cyan-600 via-blue-600 to-indigo-500",
  },
];

export default function BrandingPage() {
  const [selectedTheme, setSelectedTheme] = useState("sapphire");
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [accentColor, setAccentColor] = useState("#0d9488");
  const [appName, setAppName] = useState("City Survey System");
  const [tagline, setTagline] = useState("Smart Governance, Better Future");
  const [footerText, setFooterText] = useState("© 2026 City Municipal Corporation. All rights reserved.");

  const handleApplyPreset = (preset: (typeof THEME_PRESETS)[0]) => {
    setSelectedTheme(preset.id);
    setPrimaryColor(preset.primary);
    setAccentColor(preset.accent);
    toast.success(`Applied ${preset.name} theme palette!`);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Theme palette and branding settings saved successfully!");
  };

  return (
    <div>
      <PageHeader
        title="Branding & Theme Palettes"
        description="Customize the portal appearance, logos, and color palettes"
      />

      <div className="space-y-6">
        {/* Curated Theme Presets */}
        <SectionCard
          title="Curated Color Palettes"
          icon={<Sparkles className="h-5 w-5 text-primary" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {THEME_PRESETS.map((preset) => {
              const isSelected = selectedTheme === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset)}
                  className={cn(
                    "relative cursor-pointer rounded-xl border p-4 transition-all duration-200 hover:scale-[1.01] hover:shadow-md",
                    isSelected
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border bg-card hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-semibold text-sm">{preset.name}</span>
                    {isSelected && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    {preset.description}
                  </p>
                  <div
                    className={cn(
                      "h-3 w-full rounded-full bg-linear-to-r",
                      preset.bgGradient
                    )}
                  />
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* Custom Application Identity */}
        <SectionCard
          title="Application Identity & Custom Colors"
          icon={<Palette className="h-5 w-5 text-primary" />}
        >
          <form className="space-y-4" onSubmit={handleSave}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="app-name">Application Name</Label>
                <Input
                  id="app-name"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="primary-color">Primary Theme Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary-color"
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-9 p-1 cursor-pointer"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accent-color">Accent Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="accent-color"
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-12 h-9 p-1 cursor-pointer"
                  />
                  <Input
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="flex-1 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="footer-text">Footer Copyright Text</Label>
              <Textarea
                id="footer-text"
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                rows={2}
              />
            </div>

            <Button
              type="submit"
              className="gradient-primary border-0 text-white gap-1.5 shadow-md shadow-primary/25"
            >
              <Save className="h-4 w-4" /> Save Branding & Theme
            </Button>
          </form>
        </SectionCard>
      </div>
    </div>
  );
}
