"use client";
import { cn } from "@/lib/utils";
import { Platform, PLATFORMS } from "@/lib/data";

interface PlatformIconProps {
  platform: Platform;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const sizeMap = {
  sm: "w-7 h-7 text-[10px]",
  md: "w-9 h-9 text-xs",
  lg: "w-12 h-12 text-sm font-semibold",
};

export function PlatformIcon({
  platform,
  size = "md",
  showLabel = false,
  className,
}: PlatformIconProps) {
  const config = PLATFORMS.find((p) => p.id === platform);
  if (!config) return null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "rounded-xl flex items-center justify-center font-bold bg-gradient-to-br shrink-0",
          `bg-gradient-to-br ${config.gradient}`,
          sizeMap[size]
        )}
      >
        <span className={cn("font-bold", config.textColor)}>
          {config.avatar}
        </span>
      </div>
      {showLabel && (
        <span className="text-sm font-medium text-white">{config.name}</span>
      )}
    </div>
  );
}
