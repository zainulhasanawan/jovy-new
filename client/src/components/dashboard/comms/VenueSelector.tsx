import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type VenueLocation = {
  name: string;
  address?: string;
  placeId?: string;
  website?: string;
};

type VenueSelectorProps = {
  value?: VenueLocation;
  onChange: (venue: VenueLocation | null) => void;
  placeholder?: string;
  label?: string;
  showManualOption?: boolean;
};

export function VenueSelector({
  value,
  onChange,
  placeholder = "Search venue...",
  label,
  showManualOption = false,
}: VenueSelectorProps) {
  const input = value?.name ?? "";

  return (
    <div className="space-y-2">
      {label ? <Label>{label}</Label> : null}
      <Input
        value={input}
        onChange={(e) => {
          const next = e.target.value;
          onChange(next.trim() ? { name: next, address: next } : null);
        }}
        placeholder={placeholder}
      />
      {showManualOption ? (
        <p className="text-xs text-muted-foreground">
          Manual entry mode is enabled in this workspace build.
        </p>
      ) : null}
    </div>
  );
}
