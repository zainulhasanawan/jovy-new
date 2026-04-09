type ServicesSectionProps = {
  userId: string;
};

export function ServicesSection({ userId }: ServicesSectionProps) {
  void userId;

  return (
    <div className="p-6 text-sm text-muted-foreground">
      Requirements editor is not available in this workspace yet.
    </div>
  );
}
