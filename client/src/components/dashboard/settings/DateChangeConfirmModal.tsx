import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DateChangeConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  oldDate: Date | null;
  newDate: Date;
  checklistItems: unknown[];
  onKeepCurrentDates: () => void;
  onUpdateTimeline: () => Promise<void> | void;
  isUpdating?: boolean;
}

function formatDate(value: Date | null): string {
  if (!value) return "Not set";
  return value.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function DateChangeConfirmModal({
  open,
  onOpenChange,
  oldDate,
  newDate,
  checklistItems,
  onKeepCurrentDates,
  onUpdateTimeline,
  isUpdating = false,
}: DateChangeConfirmModalProps) {
  const handleKeepDates = () => {
    onKeepCurrentDates();
    onOpenChange(false);
  };

  const handleUpdateTimeline = async () => {
    await onUpdateTimeline();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Wedding Date Changed</DialogTitle>
          <DialogDescription>
            Your checklist can be recalculated to match the new date.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 rounded-lg bg-muted/30 p-3 text-sm">
          <p>
            <span className="font-medium">Previous date:</span>{" "}
            {formatDate(oldDate)}
          </p>
          <p>
            <span className="font-medium">New date:</span> {formatDate(newDate)}
          </p>
          <p className="text-muted-foreground">
            {checklistItems.length} checklist item
            {checklistItems.length === 1 ? "" : "s"} may be affected.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleKeepDates}>
            Keep Current Checklist Dates
          </Button>
          <Button onClick={handleUpdateTimeline} disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Update Timeline"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
