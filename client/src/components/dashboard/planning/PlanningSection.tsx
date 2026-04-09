type PlanningSectionProps = {
  userId: string;
  user: Record<string, unknown> | null;
  quotes: Record<string, unknown>[];
};

export function PlanningSection({
  userId,
  user,
  quotes,
}: PlanningSectionProps) {
  void userId;
  void user;
  void quotes;

  return (
    <div className="p-6 text-sm text-muted-foreground">
      Planning page is not available in this workspace yet.
    </div>
  );
}
