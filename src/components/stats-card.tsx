"use client";
import { cn, formatNumber } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: number | string;
  growth?: number;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  suffix?: string;
  className?: string;
}

export function StatsCard({
  label,
  value,
  growth,
  icon: Icon,
  iconColor,
  iconBg,
  suffix = "",
  className,
}: StatsCardProps) {
  const isPositive = growth !== undefined && growth >= 0;

  return (
    <div
      className={cn(
        "bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 hover:bg-white/[0.05] transition-all duration-200 group",
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", iconBg)}>
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
        {growth !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg",
              isPositive
                ? "text-emerald-400 bg-emerald-400/10"
                : "text-red-400 bg-red-400/10"
            )}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(growth)}%
          </div>
        )}
      </div>
      <p className="text-white/50 text-sm font-medium mb-1">{label}</p>
      <p className="text-white text-2xl font-bold tracking-tight">
        {typeof value === "number" ? formatNumber(value) : value}
        {suffix && <span className="text-lg text-white/50 ml-1">{suffix}</span>}
      </p>
    </div>
  );
}
