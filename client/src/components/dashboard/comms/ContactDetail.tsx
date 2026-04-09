import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Mail,
  Globe,
  MapPin,
  Send,
  Sparkles,
  Copy,
  ExternalLink,
  Trash2,
  Edit3,
  ArrowLeft,
  Reply,
  FileText,
  Link2,
  ImagePlus,
  Loader2,
  Paperclip,
  X,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  RESPONSE_TYPES,
  STATUS_CONFIG,
  getVendorTypeConfig,
} from "@/utils/dashboard/comms-config";
import type { Contact, ContactMessage, Quote } from "@/types/dashboard/comms";

interface ContactDetailProps {
  contact: Contact;
  userId: string;
  onBack: () => void;
  onDelete: () => void;
}

export function ContactDetail({
  contact,
  userId,
  onBack,
  onDelete,
}: ContactDetailProps) {
  type ContactStatus = keyof typeof STATUS_CONFIG;
  const [status, setStatus] = useState<ContactStatus>(
    (contact.status || "researching") as ContactStatus,
  );
  const [notes, setNotes] = useState(contact.notes || "");
  const [showLogResponse, setShowLogResponse] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [showLinkQuote, setShowLinkQuote] = useState(false);
  const [viewingAttachment, setViewingAttachment] = useState<{
    fileName: string;
    url: string;
    fileType: string;
  } | null>(null);
  const [responseContent, setResponseContent] = useState("");
  const [responseType, setResponseType] = useState("general_response");
  const [followUpContext, setFollowUpContext] = useState("");
  const [followUpDraft, setFollowUpDraft] = useState("");
  const [isGeneratingFollowUp, setIsGeneratingFollowUp] = useState(false);
  const [isSendingFollowUp, setIsSendingFollowUp] = useState(false);
  const [linkedQuoteId, setLinkedQuoteId] = useState<string | null>(
    contact.linkedQuoteId || null,
  );
  const [isEditingContactInfo, setIsEditingContactInfo] = useState(false);
  const [editWebsite, setEditWebsite] = useState(contact.website || "");
  const [editEmail, setEditEmail] = useState(contact.email || "");
  const [isExtractingText, setIsExtractingText] = useState(false);
  const [attachments, setAttachments] = useState<
    Array<{
      id: string;
      fileName: string;
      fileType: string;
      fileSize: number;
      url: string;
      uploadedAt: string;
    }>
  >([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery<ContactMessage[]>({
    queryKey: [`/api/contact/${contact.id}/messages`],
  });

  const { data: allQuotes = [] } = useQuery<Quote[]>({
    queryKey: ["/api/quotes/user", userId],
  });

  // All quotes are available for linking
  const availableQuotes = allQuotes;
  const linkedQuote = linkedQuoteId
    ? allQuotes.find((q) => q.id === linkedQuoteId)
    : null;

  const updateContactMutation = useMutation({
    mutationFn: async (updates: Record<string, unknown>) => {
      const response = await apiRequest(
        "PATCH",
        `/api/contact/${contact.id}`,
        updates,
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/contacts/${userId}`] });
    },
  });

  const createMessageMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await apiRequest("POST", "/api/messages", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/contact/${contact.id}/messages`],
      });
    },
  });

  const handleSaveNotes = () => {
    updateContactMutation.mutate({ notes });
    toast({ title: "Notes saved" });
  };

  const handleSaveContactInfo = async () => {
    try {
      await updateContactMutation.mutateAsync({
        website: editWebsite || null,
        email: editEmail || null,
      });
      setIsEditingContactInfo(false);
      toast({ title: "Contact info saved" });
    } catch {
      toast({ title: "Failed to save contact info", variant: "destructive" });
    }
  };

  const handleLinkQuote = async (quoteId: string) => {
    try {
      // Status rules: quote linked -> quote_received
      await updateContactMutation.mutateAsync({
        linkedQuoteId: quoteId,
        status: "quote_received",
      });
      setLinkedQuoteId(quoteId);
      setStatus("quote_received");
      setShowLinkQuote(false);
      toast({ title: "Quote linked successfully" });
    } catch {
      toast({ title: "Failed to link quote", variant: "destructive" });
    }
  };

  const handleUnlinkQuote = async () => {
    try {
      await updateContactMutation.mutateAsync({ linkedQuoteId: null });
      setLinkedQuoteId(null);
      toast({ title: "Quote unlinked" });
    } catch {
      toast({ title: "Failed to unlink quote", variant: "destructive" });
    }
  };

  // Process image for OCR
  const processImageForOCR = async (base64: string) => {
    setIsExtractingText(true);
    try {
      const response = await apiRequest(
        "POST",
        "/api/comms/extract-text-from-image",
        {
          imageBase64: base64,
        },
      );
      const data = await response.json();
      if (data.text) {
        setResponseContent((prev) =>
          prev ? `${prev}\n\n${data.text}` : data.text,
        );
        toast({ title: "Text extracted from screenshot" });
      } else if (data.error) {
        toast({ title: data.error, variant: "destructive" });
      } else {
        toast({ title: "No text found in image", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to extract text", variant: "destructive" });
    } finally {
      setIsExtractingText(false);
    }
  };

  // Handle clipboard paste (for screenshots)
  const handlePaste = async (event: React.ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    // Check if clipboard contains an image first and prevent default immediately
    const hasImage = Array.from(items).some((item) =>
      item.type.startsWith("image/"),
    );
    if (hasImage) {
      event.preventDefault();
    }

    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (!file) continue;

        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          processImageForOCR(base64);
        };
        reader.onerror = () => {
          toast({
            title: "Failed to read pasted image",
            variant: "destructive",
          });
        };
        reader.readAsDataURL(file);
        break; // Only process first image
      }
    }
  };

  const handleScreenshotUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please upload an image file", variant: "destructive" });
      event.target.value = "";
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Image too large (max 10MB)", variant: "destructive" });
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      processImageForOCR(base64);
    };
    reader.onerror = () => {
      toast({ title: "Failed to read image file", variant: "destructive" });
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  // Handle multiple file attachments
  const handleFileAttachments = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: typeof attachments = [];

    for (const file of Array.from(files)) {
      // Validate file size (max 10MB per file)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: `${file.name} is too large (max 10MB)`,
          variant: "destructive",
        });
        continue;
      }

      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      try {
        const base64 = await base64Promise;
        newAttachments.push({
          id: crypto.randomUUID(),
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          url: base64,
          uploadedAt: new Date().toISOString(),
        });
      } catch {
        toast({ title: `Failed to read ${file.name}`, variant: "destructive" });
      }
    }

    if (newAttachments.length > 0) {
      setAttachments((prev) => [...prev, ...newAttachments]);
      toast({ title: `${newAttachments.length} file(s) attached` });
    }
    event.target.value = "";
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleLogResponse = async () => {
    if (!responseContent.trim() && attachments.length === 0) {
      toast({
        title: "Please enter a response or attach files",
        variant: "destructive",
      });
      return;
    }

    try {
      await createMessageMutation.mutateAsync({
        contactId: contact.id,
        direction: "inbound",
        messageType:
          responseType === "quote_received" ? "info_request" : "other",
        content: responseContent || `[${attachments.length} file(s) attached]`,
        channel: "email",
        isDraft: false,
        sentAt: new Date().toISOString(),
        attachments: attachments,
      });

      // Auto-update status based on response type
      // Status rules: inbound -> in_conversation, quote_received -> quote_received, declined -> passed (manual only)
      let newStatus: ContactStatus = "in_conversation";
      if (responseType === "quote_received") {
        newStatus = "quote_received";
      } else if (responseType === "declined") {
        newStatus = "passed";
      }

      // Only update status if not already booked (booked/passed are manual only)
      if (status !== newStatus && status !== "booked" && status !== "passed") {
        setStatus(newStatus);
        updateContactMutation.mutate({ status: newStatus });
      }

      toast({ title: "Response logged" });
      setShowLogResponse(false);
      setResponseContent("");
      setResponseType("general_response");
      setAttachments([]);
    } catch {
      toast({ title: "Failed to log response", variant: "destructive" });
    }
  };

  const handleGenerateFollowUp = async () => {
    setIsGeneratingFollowUp(true);
    try {
      // Include message history context for contextual follow-up
      const response = await apiRequest("POST", "/api/comms/generate-draft", {
        userId,
        vendorName: contact.vendorName,
        vendorType: contact.vendorType,
        location: contact.location || "",
        outputFormat: "email",
        draftType: "follow_up",
        contactId: contact.id, // Pass contactId to fetch message history
        followUpContext: followUpContext || undefined, // Include user-provided context
      });
      const data = await response.json();
      setFollowUpDraft(data.draft);
    } catch {
      toast({ title: "Failed to generate follow-up", variant: "destructive" });
    } finally {
      setIsGeneratingFollowUp(false);
    }
  };

  const handleSaveFollowUp = async (isDraft: boolean) => {
    if (!followUpDraft.trim()) return;

    try {
      await createMessageMutation.mutateAsync({
        contactId: contact.id,
        direction: "outbound",
        messageType: "follow_up",
        content: followUpDraft,
        channel: "email",
        isDraft,
        sentAt: isDraft ? null : new Date().toISOString(),
      });

      if (!isDraft) {
        await navigator.clipboard.writeText(followUpDraft);
        toast({ title: "Copied to clipboard and saved!" });
      } else {
        toast({ title: "Draft saved" });
      }

      setShowFollowUp(false);
      setFollowUpContext("");
      setFollowUpDraft("");
    } catch {
      toast({ title: "Failed to save follow-up", variant: "destructive" });
    }
  };

  const handleSendFollowUp = async () => {
    if (!followUpDraft.trim()) return;
    const recipientEmail = editEmail || contact.email;
    if (!recipientEmail) {
      toast({
        title: "No email address on file",
        description:
          "Add the vendor's email in the contact info to send directly.",
        variant: "destructive",
      });
      return;
    }
    setIsSendingFollowUp(true);
    try {
      const formattedHtml = followUpDraft.replace(/\n/g, "<br />");
      const emailRes = await apiRequest("POST", "/api/email/send", {
        to: recipientEmail,
        subject: `Follow-up: ${contact.vendorName}`,
        html: `<div>${formattedHtml}</div>`,
        userId,
      });
      const emailData = await emailRes.json();
      if (!emailData.success) {
        throw new Error(emailData.error || "Failed to send email");
      }
      await createMessageMutation.mutateAsync({
        contactId: contact.id,
        direction: "outbound",
        messageType: "follow_up",
        content: followUpDraft,
        channel: "email",
        isDraft: false,
        sentAt: new Date().toISOString(),
      });
      toast({ title: "Email sent" });
      setShowFollowUp(false);
      setFollowUpContext("");
      setFollowUpDraft("");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : undefined;
      toast({
        title: "Failed to send email",
        description: message || "Please check the email address and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingFollowUp(false);
    }
  };

  const typeConfig = getVendorTypeConfig(contact.vendorType);
  const Icon = typeConfig.icon;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          data-testid="btn-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Icon className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-display font-semibold text-foreground">
                {contact.vendorName}
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{typeConfig.label}</span>
                {contact.location && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {contact.location}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="text-destructive"
        >
          <Trash2 className="w-5 h-5" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-display">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                  const isSelected = status === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={async () => {
                        if (key === status) return;
                        const prev = status;
                        setStatus(key as ContactStatus);
                        try {
                          await updateContactMutation.mutateAsync({
                            status: key,
                          });

                          // Sync with linked quote's bookingStatus
                          if (
                            linkedQuoteId &&
                            (key === "booked" || key === "passed")
                          ) {
                            try {
                              const quoteBookingStatus =
                                key === "booked" ? "booked" : "quoted";
                              await apiRequest(
                                "PATCH",
                                `/api/quotes/${linkedQuoteId}/booking-status`,
                                {
                                  status: quoteBookingStatus,
                                },
                              );
                            } catch (quoteErr) {
                              console.error(
                                "Failed to sync quote booking status:",
                                quoteErr,
                              );
                              // Don't fail the contact update if quote sync fails
                            }
                          }

                          toast({ title: `Status updated to ${config.label}` });
                        } catch {
                          setStatus(prev);
                          toast({
                            title: "Failed to update status",
                            variant: "destructive",
                          });
                        }
                      }}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                        isSelected
                          ? cn(
                              config.bgColor,
                              config.color,
                              "ring-2 ring-offset-1",
                              config.indicatorColor.replace("bg-", "ring-"),
                            )
                          : "bg-muted/50 text-muted-foreground hover:bg-muted",
                      )}
                      data-testid={`btn-status-${key}`}
                    >
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
                          config.indicatorColor,
                        )}
                      />
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-display">
                Message History
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowLogResponse(true)}
                  data-testid="btn-log-response"
                >
                  <Reply className="w-4 h-4 mr-1" />
                  Log Response
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowFollowUp(true)}
                  data-testid="btn-follow-up"
                >
                  <Send className="w-4 h-4 mr-1" />
                  Follow Up
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {messages.length === 0 ? (
                <p className="text-muted-foreground text-sm">No messages yet</p>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "p-3 rounded-lg",
                        msg.direction === "outbound"
                          ? "bg-primary/10 ml-8"
                          : "bg-muted mr-8",
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-muted-foreground">
                          {msg.direction === "outbound"
                            ? "You"
                            : contact.vendorName}
                          {msg.isDraft && " (Draft)"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {msg.sentAt
                            ? new Date(msg.sentAt).toLocaleDateString()
                            : "Not sent"}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">
                        {msg.content}
                      </p>
                      {/* Display attachments if any */}
                      {msg.attachments &&
                        Array.isArray(msg.attachments) &&
                        msg.attachments.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-border/50">
                            <p className="text-xs text-muted-foreground mb-1">
                              <Paperclip className="w-3 h-3 inline mr-1" />
                              {msg.attachments.length} attachment
                              {msg.attachments.length > 1 ? "s" : ""}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {msg.attachments.map(
                                (
                                  att: {
                                    fileName: string;
                                    url: string;
                                    fileType: string;
                                    fileSize: number;
                                  },
                                  idx: number,
                                ) => (
                                  <button
                                    key={idx}
                                    onClick={() =>
                                      setViewingAttachment({
                                        fileName: att.fileName,
                                        url: att.url,
                                        fileType: att.fileType,
                                      })
                                    }
                                    className="inline-flex items-center gap-1 text-xs bg-background/50 px-2 py-0.5 rounded border hover:bg-background hover:border-primary/50 transition-colors cursor-pointer"
                                    data-testid={`btn-view-attachment-${idx}`}
                                  >
                                    <FileText className="w-3 h-3" />
                                    <span className="max-w-[150px] truncate">
                                      {att.fileName}
                                    </span>
                                    <span className="text-muted-foreground">
                                      ({(att.fileSize / 1024).toFixed(1)} KB)
                                    </span>
                                  </button>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-display">
                Contact Info
              </CardTitle>
              {!isEditingContactInfo && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingContactInfo(true)}
                  data-testid="btn-edit-contact-info"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {isEditingContactInfo ? (
                <div className="space-y-3">
                  <div>
                    <Label
                      htmlFor="edit-website"
                      className="text-xs text-muted-foreground"
                    >
                      Website
                    </Label>
                    <Input
                      id="edit-website"
                      value={editWebsite}
                      onChange={(e) => setEditWebsite(e.target.value)}
                      placeholder="https://..."
                      data-testid="input-edit-website"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="edit-email"
                      className="text-xs text-muted-foreground"
                    >
                      Email
                    </Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="contact@vendor.com"
                      data-testid="input-edit-email"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSaveContactInfo}
                      data-testid="btn-save-contact-info"
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditWebsite(contact.website || "");
                        setEditEmail(contact.email || "");
                        setIsEditingContactInfo(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                      data-testid="link-email"
                    >
                      <Mail className="w-4 h-4" />
                      {contact.email}
                    </a>
                  )}
                  {contact.website && (
                    <a
                      href={contact.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                      data-testid="link-website"
                    >
                      <Globe className="w-4 h-4" />
                      Visit Website
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-display">
                Linked Quote
              </CardTitle>
            </CardHeader>
            <CardContent>
              {linkedQuote ? (
                <div className="space-y-2">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">
                          {linkedQuote.vendorName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {linkedQuote.totalPrice
                            ? `${linkedQuote.currency || "€"}${linkedQuote.totalPrice}`
                            : "No price"}
                        </p>
                      </div>
                      <FileText className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleUnlinkQuote}
                    className="text-destructive hover:text-destructive"
                  >
                    Unlink Quote
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    No quote linked yet
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowLinkQuote(true)}
                    data-testid="btn-link-quote"
                  >
                    <Link2 className="w-4 h-4 mr-2" />
                    Link a Quote
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-display">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this vendor..."
                className="min-h-[100px] resize-none"
                data-testid="textarea-notes"
              />
              <Button
                onClick={handleSaveNotes}
                size="sm"
                className="mt-2"
                data-testid="btn-save-notes"
              >
                Save Notes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Log Response Modal */}
      <Dialog open={showLogResponse} onOpenChange={setShowLogResponse}>
        <DialogContent className="w-[95vw] max-w-lg max-h-[85vh] flex flex-col p-4 sm:p-6">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="font-display">
              Log Vendor Response
            </DialogTitle>
            <DialogDescription>
              Record a response you received from {contact.vendorName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            <div>
              <Label>Response Type</Label>
              <Select value={responseType} onValueChange={setResponseType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESPONSE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Their Response</Label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotUpload}
                    className="hidden"
                    id="screenshot-upload"
                    disabled={isExtractingText}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      document.getElementById("screenshot-upload")?.click()
                    }
                    disabled={isExtractingText}
                    data-testid="btn-upload-screenshot"
                  >
                    {isExtractingText ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        Extracting...
                      </>
                    ) : (
                      <>
                        <ImagePlus className="w-4 h-4 mr-1" />
                        OCR Screenshot
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <Textarea
                value={responseContent}
                onChange={(e) => setResponseContent(e.target.value)}
                onPaste={handlePaste}
                placeholder="Paste text or screenshot (Ctrl+V), or type their response..."
                className="min-h-[120px]"
                data-testid="textarea-response"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Tip: Paste a screenshot directly to extract text
              </p>
            </div>

            {/* File Attachments */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Attachments</Label>
                <div>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileAttachments}
                    className="hidden"
                    id="file-attachments"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      document.getElementById("file-attachments")?.click()
                    }
                    data-testid="btn-attach-files"
                  >
                    <Paperclip className="w-4 h-4 mr-1" />
                    Attach Files
                  </Button>
                </div>
              </div>

              {attachments.length > 0 && (
                <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                  {attachments.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                        <span className="truncate">{file.fileName}</span>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          ({formatFileSize(file.fileSize)})
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => removeAttachment(file.id)}
                        data-testid={`btn-remove-attachment-${file.id}`}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2 flex-shrink-0 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowLogResponse(false);
                setAttachments([]);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleLogResponse} data-testid="btn-save-response">
              Save Response
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Follow Up Modal */}
      <Dialog open={showFollowUp} onOpenChange={setShowFollowUp}>
        <DialogContent className="w-[95vw] max-w-lg p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="font-display">Draft Follow-up</DialogTitle>
            <DialogDescription>
              Send a follow-up message to {contact.vendorName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!followUpDraft ? (
              <>
                <div>
                  <Label>Context (optional)</Label>
                  <Textarea
                    value={followUpContext}
                    onChange={(e) => setFollowUpContext(e.target.value)}
                    placeholder="What do you want to follow up about? Or paste their last message for context..."
                    className="min-h-[100px]"
                    data-testid="textarea-followup-context"
                  />
                </div>
                <Button
                  onClick={handleGenerateFollowUp}
                  disabled={isGeneratingFollowUp}
                  className="w-full"
                  data-testid="btn-generate-followup"
                >
                  {isGeneratingFollowUp ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Follow-up
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <div>
                  <Label>Your Follow-up Message</Label>
                  <Textarea
                    value={followUpDraft}
                    onChange={(e) => setFollowUpDraft(e.target.value)}
                    className="min-h-[200px]"
                    data-testid="textarea-followup-draft"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleSaveFollowUp(true)}
                  >
                    Save Draft
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSaveFollowUp(false)}
                    data-testid="btn-copy-followup"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy & Save
                  </Button>
                  <Button
                    onClick={handleSendFollowUp}
                    disabled={isSendingFollowUp}
                    data-testid="btn-send-followup"
                  >
                    {isSendingFollowUp ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Link Quote Modal */}
      <Dialog open={showLinkQuote} onOpenChange={setShowLinkQuote}>
        <DialogContent className="w-[95vw] max-w-md p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="font-display">Link a Quote</DialogTitle>
            <DialogDescription>
              Connect a quote to this conversation with {contact.vendorName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {availableQuotes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No quotes available to link. Add quotes first.
              </p>
            ) : (
              availableQuotes.map((quote) => (
                <button
                  key={quote.id}
                  onClick={() => handleLinkQuote(quote.id)}
                  className="w-full p-3 text-left rounded-lg border hover:bg-muted transition-colors"
                  data-testid={`btn-link-quote-${quote.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{quote.vendorName}</p>
                      <p className="text-xs text-muted-foreground">
                        {quote.totalPrice
                          ? `${quote.currency || "€"}${quote.totalPrice}`
                          : "No price"}
                        {quote.vendorCategory &&
                          ` • ${quote.vendorCategory.replace(/_/g, " ")}`}
                      </p>
                    </div>
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  </div>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Attachment Viewer Modal */}
      <Dialog
        open={!!viewingAttachment}
        onOpenChange={() => setViewingAttachment(null)}
      >
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] flex flex-col p-4 sm:p-6">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="font-display flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {viewingAttachment?.fileName}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto min-h-0">
            {viewingAttachment?.fileType?.startsWith("image/") ? (
              <img
                src={viewingAttachment.url}
                alt={viewingAttachment.fileName}
                className="max-w-full h-auto mx-auto"
              />
            ) : (
              <div className="text-center py-8">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="font-medium mb-2">
                  {viewingAttachment?.fileName}
                </p>
                <p className="text-muted-foreground mb-4">
                  {viewingAttachment?.fileType === "application/pdf"
                    ? "Click below to open the PDF in a new tab"
                    : "Preview not available for this file type"}
                </p>
                <Button
                  onClick={() => {
                    if (viewingAttachment?.url) {
                      const newWindow = window.open("", "_blank");
                      if (newWindow) {
                        newWindow.document.write(`
                          <html>
                            <head><title>${viewingAttachment.fileName}</title></head>
                            <body style="margin:0">
                              <embed src="${viewingAttachment.url}" width="100%" height="100%" type="${viewingAttachment.fileType}">
                            </body>
                          </html>
                        `);
                      }
                    }
                  }}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in New Tab
                </Button>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => setViewingAttachment(null)}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                if (viewingAttachment?.url) {
                  const link = document.createElement("a");
                  link.href = viewingAttachment.url;
                  link.download = viewingAttachment.fileName;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }
              }}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
