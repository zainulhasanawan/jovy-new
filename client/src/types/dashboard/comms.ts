export type Contact = {
  id: string;
  userId?: string;
  vendorName: string;
  vendorType: string;
  status?: string;
  location?: string | null;
  linkedQuoteId?: string | null;
  notes?: string;
  website?: string | null;
  email?: string | null;
  updatedAt?: string | null;
};

export type MessageAttachment = {
  fileName: string;
  url: string;
  fileType: string;
  fileSize: number;
};

export type ContactMessage = {
  id: string;
  contactId: string;
  direction: "inbound" | "outbound" | string;
  messageType?: string;
  content: string;
  channel?: string;
  isDraft?: boolean;
  sentAt?: string | null;
  attachments?: MessageAttachment[];
};

export type Quote = {
  id: string;
  vendorName: string;
  totalPrice?: number | string;
  currency?: string;
  vendorCategory?: string;
};
