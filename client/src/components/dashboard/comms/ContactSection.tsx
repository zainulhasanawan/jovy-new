import { ContactCard } from "./ContactCard";
import type { Contact } from "@/types/dashboard/comms";

interface ContactSectionProps {
  title: string;
  contacts: Contact[];
  onContactClick: (contact: Contact) => void;
}

export function ContactSection({
  title,
  contacts,
  onContactClick,
}: ContactSectionProps) {
  if (contacts.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
        {title} ({contacts.length})
      </h2>
      <div className="space-y-2">
        {contacts.map((contact) => (
          <ContactCard
            key={contact.id}
            contact={contact}
            onClick={() => onContactClick(contact)}
          />
        ))}
      </div>
    </section>
  );
}
