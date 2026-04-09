import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateAction {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
}

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  primaryAction?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  helperText?: string;
  features?: string[];
  locationBadges?: { name: string; placeId?: string }[];
  steps?: string[];
}

export function EmptyState({
  icon,
  title,
  subtitle,
  primaryAction,
  secondaryAction,
  helperText,
  features,
  locationBadges,
  steps,
}: EmptyStateProps) {
  return (
    <Card
      className="bg-white border border-[#E5E2DD] shadow-sm rounded-xl max-w-[600px] mx-auto"
      data-testid="empty-state"
    >
      <CardContent className="text-center py-10 px-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#D4847A]/10 mb-6">
          {icon}
        </div>

        <h2 className="font-display text-2xl font-semibold text-[#2A2035] mb-3">
          {title}
        </h2>

        <p className="text-[#6B617B] text-base leading-relaxed mb-6 max-w-[450px] mx-auto">
          {subtitle}
        </p>

        {locationBadges && locationBadges.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {locationBadges.map((loc, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-3 py-1 bg-[#F8F5FB] rounded-full text-sm text-[#6B617B]"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {loc.name.split(",")[0]}
              </span>
            ))}
          </div>
        )}

        {steps && steps.length > 0 && (
          <div className="bg-[#FAF9F7] rounded-lg p-6 max-w-sm mx-auto mb-6 text-left">
            <p className="font-medium text-[#2A2035] mb-3 text-sm">
              Your next steps:
            </p>
            <ol className="space-y-2 text-sm text-[#6B617B]">
              {steps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span
                    className="flex-shrink-0 w-5 h-5 rounded-full bg-[#D4847A] text-white text-xs flex items-center justify-center"
                    style={{ opacity: 1 - idx * 0.2 }}
                  >
                    {idx + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}

        {features && features.length > 0 && (
          <div className="text-left max-w-sm mx-auto mb-6">
            <ul className="space-y-2">
              {features.map((feature, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-2 text-sm text-[#6B617B]"
                >
                  <svg
                    className="w-4 h-4 text-[#5D8A58] flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {primaryAction && (
            <Button
              onClick={primaryAction.onClick}
              className="bg-[#D4847A] hover:bg-[#C4756D] text-white"
              data-testid="empty-state-primary-action"
            >
              {primaryAction.icon}
              {primaryAction.label}
            </Button>
          )}

          {secondaryAction && (
            <Button
              variant="ghost"
              onClick={secondaryAction.onClick}
              className="text-[#D4847A] hover:text-[#C4756D] hover:bg-[#D4847A]/5"
              data-testid="empty-state-secondary-action"
            >
              {secondaryAction.icon}
              {secondaryAction.label}
            </Button>
          )}
        </div>

        {helperText && (
          <p className="text-sm text-[#8A8194] mt-4">{helperText}</p>
        )}
      </CardContent>
    </Card>
  );
}
