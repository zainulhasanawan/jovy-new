import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VENDOR_TYPE_CONFIG } from "@/utils/dashboard/comms-config";

type SortBy = "updated" | "name" | "status";

type CommsFiltersProps = {
  statusFilter: string;
  vendorTypeFilter: string;
  sortBy: SortBy;
  onStatusFilterChange: (value: string) => void;
  onVendorTypeFilterChange: (value: string) => void;
  onSortByChange: (value: SortBy) => void;
};

export function CommsFilters({
  statusFilter,
  vendorTypeFilter,
  sortBy,
  onStatusFilterChange,
  onVendorTypeFilterChange,
  onSortByChange,
}: CommsFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <Label className="text-sm text-muted-foreground">Status:</Label>
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="researching">Researching</SelectItem>
            <SelectItem value="reached_out">Reached Out</SelectItem>
            <SelectItem value="in_conversation">In Conversation</SelectItem>
            <SelectItem value="quote_received">Quote Received</SelectItem>
            <SelectItem value="booked">Booked</SelectItem>
            <SelectItem value="passed">Passed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Label className="text-sm text-muted-foreground">Vendor Type:</Label>
        <Select
          value={vendorTypeFilter}
          onValueChange={onVendorTypeFilterChange}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {Object.entries(VENDOR_TYPE_CONFIG).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>
                {cfg.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Label className="text-sm text-muted-foreground">Sort by:</Label>
        <Select
          value={sortBy}
          onValueChange={(value) => onSortByChange(value as SortBy)}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated">Last Updated</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="status">Status</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
