"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Bell, Shield, Palette, Globe, ChevronRight } from "lucide-react";

const SECTIONS = [
  {
    icon: Bell,
    title: "Notifications",
    description: "Choose when and how you receive alerts",
    settings: [
      { label: "Email digests", description: "Daily summary of your post performance", enabled: true },
      { label: "Engagement alerts", description: "Notify when a post gets unusual activity", enabled: true },
      { label: "Scheduled post reminders", description: "15-minute reminder before publishing", enabled: false },
    ],
  },
  {
    icon: Palette,
    title: "Appearance",
    description: "Customize how SocialHub looks",
    settings: [
      { label: "Dark mode", description: "Always use dark interface", enabled: true },
      { label: "Compact view", description: "Show more content on screen", enabled: false },
    ],
  },
  {
    icon: Globe,
    title: "Publishing",
    description: "Default publishing preferences",
    settings: [
      { label: "Auto-shorten links", description: "Shorten URLs in your posts", enabled: true },
      { label: "Include watermark", description: "Add SocialHub branding to images", enabled: false },
    ],
  },
];

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "relative w-10 h-5.5 rounded-full transition-all duration-200",
        enabled ? "bg-violet-500" : "bg-white/10"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform duration-200",
          enabled ? "translate-x-4.5" : "translate-x-0"
        )}
      />
    </button>
  );
}

export default function Settings() {
  const [settings, setSettings] = useState(
    SECTIONS.map((s) => ({
      ...s,
      settings: s.settings.map((setting) => ({ ...setting })),
    }))
  );

  const toggle = (si: number, ti: number) => {
    setSettings((prev) =>
      prev.map((section, i) =>
        i !== si
          ? section
          : {
              ...section,
              settings: section.settings.map((setting, j) =>
                j !== ti ? setting : { ...setting, enabled: !setting.enabled }
              ),
            }
      )
    );
  };

  return (
    <div className="px-8 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-white/40 text-sm mt-1">
          Manage your SocialHub preferences
        </p>
      </div>

      <div className="space-y-6">
        {settings.map((section, si) => (
          <div
            key={section.title}
            className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5">
              <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <section.icon className="w-4.5 h-4.5 text-violet-400" size={18} />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{section.title}</p>
                <p className="text-white/30 text-xs">{section.description}</p>
              </div>
            </div>

            <div className="divide-y divide-white/[0.04]">
              {section.settings.map((setting, ti) => (
                <div
                  key={setting.label}
                  className="flex items-center justify-between px-6 py-4"
                >
                  <div>
                    <p className="text-white/80 text-sm font-medium">
                      {setting.label}
                    </p>
                    <p className="text-white/30 text-xs mt-0.5">
                      {setting.description}
                    </p>
                  </div>
                  <Toggle
                    enabled={setting.enabled}
                    onToggle={() => toggle(si, ti)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Danger Zone */}
        <div className="bg-red-500/5 border border-red-500/15 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-red-500/10">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Shield className="w-4.5 h-4.5 text-red-400" size={18} />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Danger Zone</p>
              <p className="text-white/30 text-xs">Irreversible actions</p>
            </div>
          </div>
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium">Delete all posts</p>
              <p className="text-white/30 text-xs mt-0.5">Remove all post history from SocialHub</p>
            </div>
            <button className="flex items-center gap-1.5 text-red-400 text-sm font-medium hover:text-red-300 transition-colors">
              Delete <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
