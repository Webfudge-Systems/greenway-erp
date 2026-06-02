import React from "react";
import { Card } from "../Card";

/**
 * KPICard Component
 *
 * A reusable card component for displaying key performance indicators with an icon,
 * title, value, and optional subtitle.
 *
 * @param {string} title - The title/label for the KPI
 * @param {number|string} value - The main value to display
 * @param {string} subtitle - Optional subtitle text (e.g., "5 deals", "No items")
 * @param {string} change - Optional change/trend indicator (e.g., "+12%", "-5%")
 * @param {string} changeType - Type of change: 'increase' or 'decrease'
 * @param {React.Component} icon - Icon component to display (from lucide-react or similar)
 * @param {string} colorScheme - Color scheme: 'orange', 'yellow', 'green', 'red', 'blue', 'purple', 'emerald', 'indigo'
 * @param {string} iconColorScheme - Optional override for the inner icon color
 * @param {string} iconBgColorScheme - Optional override for icon background color
 * @param {function} onClick - Optional click handler for the card
 * @param {string} className - Optional additional CSS classes
 * @param {boolean} compact - Same layout as default with less top/bottom padding and no subtitle/trend footer
 */
const KPICard = ({
  title,
  value,
  subtitle,
  change,
  changeType = "increase",
  icon: Icon,
  colorScheme = "blue",
  iconColorScheme = "orange",
  iconBgColorScheme,
  onClick,
  className = "",
  compact = false,
}) => {
  const colorClasses = {
    orange: {
      iconBg: "bg-brand-primary/10",
      iconColor: "text-brand-primary",
      dotColor: "bg-orange-500",
    },
    yellow: {
      iconBg: "bg-yellow-50",
      iconColor: "text-yellow-500",
      dotColor: "bg-yellow-500",
    },
    green: {
      iconBg: "bg-green-50",
      iconColor: "text-green-500",
      dotColor: "bg-green-500",
    },
    red: {
      iconBg: "bg-red-50",
      iconColor: "text-red-500",
      dotColor: "bg-red-500",
    },
    blue: {
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
      dotColor: "bg-blue-500",
    },
    purple: {
      iconBg: "bg-purple-50",
      iconColor: "text-purple-500",
      dotColor: "bg-purple-500",
    },
    emerald: {
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
      dotColor: "bg-emerald-500",
    },
    indigo: {
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-500",
      dotColor: "bg-indigo-500",
    },
  };

  const colors = colorClasses[colorScheme] || colorClasses.blue;

  const contentPaddingClass = compact
    ? "p-4 pb-3 sm:pl-5 sm:pt-3 sm:pb-3 md:pl-6 md:pt-4"
    : "p-4 sm:p-6";
  const showFooter = !compact && (change || (!change && subtitle));

  const iconBoxClass =
    "relative flex shrink-0 items-center justify-center self-stretch overflow-hidden rounded-none rounded-bl-2xl w-16 sm:w-24 md:w-32";
  const iconImgClass =
    "absolute -bottom-3 -right-3 h-14 w-14 sm:-bottom-4 sm:-right-4 sm:h-20 sm:w-20 md:-bottom-5 md:-right-5 md:h-28 md:w-28";

  return (
    <Card
      variant="elevated"
      padding={false}
      className={`overflow-hidden ${onClick ? "cursor-pointer hover:shadow-[0_6px_26px_rgba(15,23,42,0.13),0_3px_8px_rgba(15,23,42,0.07)] transition-shadow" : ""} ${className}`}
      onClick={onClick}
    >
      <div className="flex items-stretch">
        <div className={`min-w-0 flex-1 ${contentPaddingClass}`}>
          <p className="mb-2 text-sm font-medium text-gray-600">{title}</p>
          <p
            className={`text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl ${showFooter ? "mb-2" : ""}`}
          >
            {value}
          </p>
          {showFooter && change && (
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <span
                className={`h-2 w-2 rounded-full ${colors.dotColor}`}
              ></span>
              <span
                className={
                  changeType === "increase"
                    ? "font-medium text-green-600"
                    : "font-medium text-red-600"
                }
              >
                {change}
              </span>
              {change !== "0" && <span className="ml-1">this period</span>}
            </div>
          )}
          {showFooter && !change && subtitle && (
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <span
                className={`h-2 w-2 rounded-full ${colors.dotColor}`}
              ></span>
              <span>{subtitle}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`${iconBoxClass} ${colors.iconBg}`}>
            <Icon className={`${iconImgClass} ${colors.iconColor}`} />
          </div>
        )}
      </div>
    </Card>
  );
};

export default KPICard;
