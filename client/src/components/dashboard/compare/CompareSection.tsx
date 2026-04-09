type CompareSectionProps = {
  userId: string;
  quotes: Record<string, unknown>[];
  guestCount: number;
  onUploadClick: () => void;
};

export function CompareSection({
  userId,
  quotes,
  guestCount,
  onUploadClick,
}: CompareSectionProps) {
  void userId;
  void quotes;
  void guestCount;
  void onUploadClick;

  return (
    <div className="p-6 text-sm text-muted-foreground">
      Options builder is not available in this workspace yet.
    </div>
  );
}
