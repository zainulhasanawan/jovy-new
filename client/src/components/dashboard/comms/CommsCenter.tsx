import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mail, Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getCanonicalVendorType } from "@/utils/dashboard/comms-config";
import { CommsCenterSkeleton } from "./CommsSharedUi";
import { NewOutreachModal } from "./NewOutreachModal";
import { CommsFilters } from "./CommsFilters";
import { ContactSection } from "./ContactSection";
import { ContactDetail } from "./ContactDetail";
import { EmptyState } from "@/components/EmptyState";
import type { Contact } from "@/types/dashboard/comms";

interface CommsCenterProps {
  userId: string;
}

export function CommsCenter({ userId }: CommsCenterProps) {
  const [showNewOutreach, setShowNewOutreach] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [vendorTypeFilter, setVendorTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"updated" | "name" | "status">(
    "updated",
  );
  const location = useLocation();
  const navigate = useNavigate();
  const searchString = location.search;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: contacts = [],
    isLoading,
    isFetching,
  } = useQuery<Contact[]>({
    queryKey: [`/api/contacts/${userId}`],
  });

  // Handle URL query params for auto-selecting contact from quotes page
  useEffect(() => {
    if (!contacts.length || isLoading) return;

    const params = new URLSearchParams(searchString);
    const vendorName = params.get("vendor");
    const quoteId = params.get("quoteId");

    if (vendorName || quoteId) {
      // Find contact by linkedQuoteId first, then by vendor name
      let matchingContact = quoteId
        ? contacts.find((c) => c.linkedQuoteId === quoteId)
        : null;

      if (!matchingContact && vendorName) {
        matchingContact = contacts.find(
          (c) => c.vendorName.toLowerCase() === vendorName.toLowerCase(),
        );
      }

      if (matchingContact) {
        queueMicrotask(() => setSelectedContact(matchingContact));
        // Clear query params after selecting
        navigate("/dashboard/comms", { replace: true });
      }
    }
  }, [contacts, isLoading, searchString, navigate]);

  const deleteContactMutation = useMutation({
    mutationFn: async (contactId: string) => {
      await apiRequest("DELETE", `/api/contact/${contactId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/contacts/${userId}`] });
      setSelectedContact(null);
      toast({ title: "Contact deleted" });
    },
  });

  if (isLoading || (isFetching && contacts.length === 0)) {
    return <CommsCenterSkeleton />;
  }

  if (selectedContact) {
    return (
      <ContactDetail
        contact={selectedContact}
        userId={userId}
        onBack={() => setSelectedContact(null)}
        onDelete={() => deleteContactMutation.mutate(selectedContact.id)}
      />
    );
  }

  if (contacts.length === 0) {
    return (
      <>
        <EmptyState
          icon={<Mail className="w-6 h-6 text-[#D4847A]" />}
          title="No Vendor Outreach Yet"
          subtitle="Start tracking your outreach and conversations in one place so your planning stays organized."
          steps={[
            "Create your first vendor contact",
            "Send outreach and log responses",
            "Track status through booking",
          ]}
          primaryAction={{
            label: "New Outreach",
            onClick: () => setShowNewOutreach(true),
            icon: <Plus className="w-4 h-4 mr-2" />,
          }}
        />
        {showNewOutreach && (
          <NewOutreachModal
            userId={userId}
            onClose={() => setShowNewOutreach(false)}
          />
        )}
      </>
    );
  }

  let filteredContacts = [...contacts];

  if (statusFilter !== "all") {
    if (statusFilter === "active") {
      filteredContacts = filteredContacts.filter(
        (c) => c.status === "reached_out" || c.status === "in_conversation",
      );
    } else {
      filteredContacts = filteredContacts.filter(
        (c) => c.status === statusFilter,
      );
    }
  }

  if (vendorTypeFilter !== "all") {
    filteredContacts = filteredContacts.filter((c) => {
      const canonical = getCanonicalVendorType(c.vendorType);
      return canonical === vendorTypeFilter;
    });
  }

  const sortedContacts = [...filteredContacts].sort((a, b) => {
    if (sortBy === "name") {
      return a.vendorName.localeCompare(b.vendorName);
    } else if (sortBy === "status") {
      const statusOrder = [
        "researching",
        "reached_out",
        "in_conversation",
        "quote_received",
        "booked",
        "passed",
      ];
      const aStatus = a.status || "researching";
      const bStatus = b.status || "researching";
      const aIndex = statusOrder.indexOf(aStatus);
      const bIndex = statusOrder.indexOf(bStatus);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    } else {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateB - dateA;
    }
  });

  const byStatus = {
    active: sortedContacts.filter(
      (c) => c.status === "reached_out" || c.status === "in_conversation",
    ),
    researching: sortedContacts.filter((c) => c.status === "researching"),
    completed: sortedContacts.filter(
      (c) =>
        c.status === "booked" ||
        c.status === "quote_received" ||
        c.status === "passed",
    ),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-foreground">
            Comms Center
          </h1>
          <p className="text-muted-foreground font-body">
            Track your vendor outreach and conversations
          </p>
        </div>
        <Button
          onClick={() => setShowNewOutreach(true)}
          data-testid="btn-new-outreach"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Outreach
        </Button>
      </div>

      <CommsFilters
        statusFilter={statusFilter}
        vendorTypeFilter={vendorTypeFilter}
        sortBy={sortBy}
        onStatusFilterChange={setStatusFilter}
        onVendorTypeFilterChange={setVendorTypeFilter}
        onSortByChange={setSortBy}
      />

      {sortedContacts.length === 0 && (
        <EmptyState
          icon={<Mail className="w-6 h-6 text-[#D4847A]" />}
          title="No Matching Contacts"
          subtitle="Try adjusting your filters to find vendors with different statuses or categories."
          primaryAction={{
            label: "Clear Filters",
            onClick: () => {
              setStatusFilter("all");
              setVendorTypeFilter("all");
              setSortBy("updated");
            },
          }}
        />
      )}

      <ContactSection
        title="Active Conversations"
        contacts={byStatus.active}
        onContactClick={setSelectedContact}
      />

      <ContactSection
        title="Researching"
        contacts={byStatus.researching}
        onContactClick={setSelectedContact}
      />

      <ContactSection
        title="Completed"
        contacts={byStatus.completed}
        onContactClick={setSelectedContact}
      />

      {showNewOutreach && (
        <NewOutreachModal
          userId={userId}
          onClose={() => setShowNewOutreach(false)}
        />
      )}
    </div>
  );
}
