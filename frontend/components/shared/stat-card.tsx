"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  href?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendValue,
  href,
  className,
}: StatCardProps) {
  const cardContent = (
    <Card className={cn("h-full overflow-hidden rounded-xl border-border/50 shadow-sm transition-shadow hover:shadow-md", className, href && "hover:border-primary/30")}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="p-2 bg-primary/5 text-primary rounded-md">
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-4xl md:text-5xl font-bold text-foreground">{value}</div>
        {(trendValue || description) && (
          <div className="flex items-center mt-1 text-sm text-muted-foreground gap-1">
            {trendValue && (
              <span
                className={cn(
                  "flex items-center font-medium",
                  trend === "up" ? "text-emerald-500" : trend === "down" ? "text-rose-500" : "text-muted-foreground"
                )}
              >
                {trend === "up" && <ArrowUpRight className="mr-0.5 h-3 w-3" />}
                {trend === "down" && <ArrowDownRight className="mr-0.5 h-3 w-3" />}
                {trendValue}
              </span>
            )}
            {description && <span className="truncate">{description}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const wrapperProps = {
    whileHover: { y: -2 },
    transition: { duration: 0.2 },
    className: "h-full block",
  };

  if (href) {
    return (
      <motion.div {...wrapperProps}>
        <Link href={href} className="block h-full">{cardContent}</Link>
      </motion.div>
    );
  }

  return (
    <motion.div {...wrapperProps}>
      {cardContent}
    </motion.div>
  );
}
