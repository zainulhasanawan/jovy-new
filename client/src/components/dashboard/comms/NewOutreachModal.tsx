import { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Globe,
  Loader2,
  Mail,
  Sparkles,
  Send,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { VenueSelector } from "./VenueSelector";
import {
  INQUIRY_TOGGLES,
  VENDOR_TYPE_CONFIG,
} from "@/utils/dashboard/comms-config";

interface VenueLocation {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  placeId?: string;
  website?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

type NewOutreachModalProps = {
  userId: string;
  onClose: () => void;
};

export function NewOutreachModal({ userId, onClose }: NewOutreachModalProps) {
  const [step, setStep] = useState<"info" | "draft">("info");
  const [vendorName, setVendorName] = useState("");
  const [vendorType, setVendorType] = useState("venue_location");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [placeId, setPlaceId] = useState<string | null>(null);
  const [venueLocation, setVenueLocation] = useState<VenueLocation | null>(
    null,
  );
  const [showManualName, setShowManualName] = useState(false);
  const [outputFormat, setOutputFormat] = useState<"email" | "form">("email");
  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedToggles, setSelectedToggles] = useState<string[]>([]);
  const [customText, setCustomText] = useState("");
  const [showCustomization, setShowCustomization] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery<Record<string, unknown>>({
    queryKey: ["/api/users", userId],
  });

  const getSmartDefaults = useCallback(
    (type: string): string[] => {
      const defaults: string[] = [];
      const profile =
        (user?.weddingProfile as Record<string, unknown> | undefined) || {};
      const servicesByEvent =
        (profile.servicesByEvent as
          | Record<string, Record<string, { enabled?: boolean }>>
          | undefined) || {};
      const events = Object.keys(servicesByEvent);

      const hasMultiDayEvents = events.some((e) =>
        [
          "welcome_event",
          "rehearsal_dinner",
          "next_day_brunch",
          "after_party",
        ].includes(e),
      );

      if (type === "venue_location" && hasMultiDayEvents) {
        defaults.push("multiDay");
      }

      if (type === "photography_video" && events.length >= 3) {
        defaults.push("multipleLocations");
      }

      const hasBarService = Object.values(servicesByEvent).some(
        (eventServices) => eventServices?.bar_beverage?.enabled,
      );
      if (type === "catering_food" && hasBarService) {
        defaults.push("bar");
      }

      const hasCeremonyMusic =
        servicesByEvent?.ceremony?.entertainment_music?.enabled;
      if (type === "entertainment_music" && hasCeremonyMusic) {
        defaults.push("ceremonyMusic");
      }

      return defaults;
    },
    [user],
  );

  useEffect(() => {
    const saved = localStorage.getItem("outreachPreferences");
    let initialToggles: string[] = [];

    if (saved) {
      try {
        const prefs = JSON.parse(saved);
        if (prefs[vendorType] && prefs[vendorType].length > 0) {
          initialToggles = prefs[vendorType];
        } else {
          initialToggles = getSmartDefaults(vendorType);
        }
      } catch {
        initialToggles = getSmartDefaults(vendorType);
      }
    } else {
      initialToggles = getSmartDefaults(vendorType);
    }

    setSelectedToggles(initialToggles);
  }, [vendorType, user, getSmartDefaults]);

  const saveTogglePreferences = (toggles: string[]) => {
    const saved = localStorage.getItem("outreachPreferences");
    const prefs = saved ? JSON.parse(saved) : {};
    prefs[vendorType] = toggles;
    localStorage.setItem("outreachPreferences", JSON.stringify(prefs));
  };

  const handleToggleChange = (toggleId: string, checked: boolean) => {
    const newToggles = checked
      ? [...selectedToggles, toggleId]
      : selectedToggles.filter((t) => t !== toggleId);
    setSelectedToggles(newToggles);
    saveTogglePreferences(newToggles);
  };

  const currentToggles = INQUIRY_TOGGLES[vendorType] || INQUIRY_TOGGLES.other;

  const createContactMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await apiRequest("POST", "/api/contacts", data);
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
  });

  const handleGenerateDraft = async () => {
    if (!vendorName.trim()) {
      toast({ title: "Please enter a vendor name", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const selectedToggleLabels = currentToggles
        .filter((t) => selectedToggles.includes(t.id))
        .map((t) => t.label);

      const response = await apiRequest("POST", "/api/comms/generate-draft", {
        userId,
        vendorName,
        vendorType,
        location,
        outputFormat,
        customizations: {
          toggles: selectedToggleLabels,
          customText: customText.trim(),
        },
      });
      const data = await response.json();
      setDraft(data.draft);
      setStep("draft");
      setCustomText("");
    } catch {
      toast({ title: "Failed to generate draft", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendEmail = async () => {
    if (!email) {
      toast({
        title: "Email required to send directly",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      const formattedHtml = draft.replace(/\n/g, "<br />");

      const emailRes = await apiRequest("POST", "/api/email/send", {
        to: email,
        subject: `Inquiry for ${vendorName}`,
        html: `<div>${formattedHtml}</div>`,
        userId,
      });

      const emailData = await emailRes.json();

      if (!emailData.success) {
        throw new Error(emailData.error || "Failed to send email");
      }

      let contact;
      let isDuplicate = false;

      try {
        contact = await createContactMutation.mutateAsync({
          userId,
          vendorName,
          vendorType,
          website: website || null,
          email: email || null,
          location: location || null,
          placeId: placeId || null,
          status: "reached_out",
        });
        isDuplicate = contact.isDuplicate === true;
      } catch {
        toast({
          title: "Email sent, but failed to save contact",
          variant: "destructive",
        });
        return;
      }

      try {
        await createMessageMutation.mutateAsync({
          contactId: contact.id,
          direction: "outbound",
          messageType: isDuplicate ? "follow_up" : "initial_inquiry",
          content: draft,
          channel: "email",
          isDraft: false,
          sentAt: new Date().toISOString(),
        });

        if (isDuplicate && contact.status === "researching") {
          await apiRequest("PATCH", `/api/contact/${contact.id}`, {
            status: "reached_out",
          });
          queryClient.invalidateQueries({
            queryKey: [`/api/contacts/${userId}`],
          });
        }

        if (isDuplicate) {
          toast({
            title: `Email sent and added to conversation with ${vendorName}`,
          });
        } else {
          toast({ title: "Email sent successfully!" });
        }

        setTimeout(() => {
          onClose();
        }, 1000);
      } catch {
        toast({
          title: "Email sent, but message failed to save",
          variant: "destructive",
        });
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (error) {
      console.error("Failed to send email:", error);
      toast({
        title: "Failed to send email",
        description: "Please check the email address and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyAndSave = async () => {
    await navigator.clipboard.writeText(draft);
    setCopied(true);

    let contact;
    let isDuplicate = false;

    try {
      contact = await createContactMutation.mutateAsync({
        userId,
        vendorName,
        vendorType,
        website: website || null,
        email: email || null,
        location: location || null,
        placeId: placeId || null,
        status: "reached_out",
      });
      isDuplicate = contact.isDuplicate === true;
    } catch {
      toast({
        title: "Draft copied, but failed to save contact",
        variant: "destructive",
      });
      return;
    }

    try {
      await createMessageMutation.mutateAsync({
        contactId: contact.id,
        direction: "outbound",
        messageType: isDuplicate ? "follow_up" : "initial_inquiry",
        content: draft,
        channel: outputFormat === "email" ? "email" : "form",
        isDraft: false,
        sentAt: new Date().toISOString(),
      });

      if (isDuplicate && contact.status === "researching") {
        await apiRequest("PATCH", `/api/contact/${contact.id}`, {
          status: "reached_out",
        });
        queryClient.invalidateQueries({
          queryKey: [`/api/contacts/${userId}`],
        });
      }

      if (isDuplicate) {
        toast({ title: `Added to existing conversation with ${vendorName}` });
      } else {
        toast({ title: "Copied to clipboard! Contact saved." });
      }
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch {
      toast({
        title: "Contact saved, but message failed to save",
        variant: "destructive",
      });
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  const handleSaveForLater = async () => {
    let contact;
    let isDuplicate = false;

    try {
      contact = await createContactMutation.mutateAsync({
        userId,
        vendorName,
        vendorType,
        website: website || null,
        email: email || null,
        location: location || null,
        placeId: placeId || null,
        status: "researching",
      });
      isDuplicate = contact.isDuplicate === true;
    } catch {
      toast({ title: "Failed to save contact", variant: "destructive" });
      return;
    }

    if (draft) {
      try {
        await createMessageMutation.mutateAsync({
          contactId: contact.id,
          direction: "outbound",
          messageType: isDuplicate ? "follow_up" : "initial_inquiry",
          content: draft,
          channel: outputFormat === "email" ? "email" : "form",
          isDraft: true,
          sentAt: null,
        });
      } catch {
        toast({
          title: "Contact saved, but draft failed to save",
          variant: "destructive",
        });
        onClose();
        return;
      }
    }

    if (isDuplicate) {
      toast({
        title: `Added draft to existing conversation with ${vendorName}`,
      });
    } else {
      toast({ title: "Contact saved for later" });
    }
    onClose();
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="w-[95vw] max-w-lg max-h-[90vh] flex flex-col p-4 sm:p-6"
        onPointerDownOutside={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest(".pac-container")) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest(".pac-container")) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="font-display">
            {step === "info"
              ? "New Vendor Outreach"
              : "Your Personalized Message"}
          </DialogTitle>
          <DialogDescription>
            {step === "info"
              ? "Enter vendor details and we'll generate a personalized inquiry"
              : "Review and copy your message to send"}
          </DialogDescription>
        </DialogHeader>

        {step === "info" ? (
          <div className="space-y-4 overflow-y-auto flex-1 px-1 -mx-1">
            <div>
              <Label htmlFor="vendorType">Vendor Type</Label>
              <Select value={vendorType} onValueChange={setVendorType}>
                <SelectTrigger data-testid="select-vendor-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(VENDOR_TYPE_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <config.icon className="w-4 h-4" />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!showManualName ? (
              <div>
                <VenueSelector
                  value={venueLocation || undefined}
                  onChange={(venue: VenueLocation | null) => {
                    setVenueLocation(venue);
                    if (venue) {
                      setLocation(venue.address || venue.name);
                      setPlaceId(venue.placeId || null);
                      setVendorName(venue.name);
                      setWebsite(venue.website || "");
                    } else {
                      setLocation("");
                      setPlaceId(null);
                      setWebsite("");
                    }
                  }}
                  placeholder="Search for venue or vendor..."
                  label="Search Venue/Vendor"
                  showManualOption
                />
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="vendorName">Vendor Name *</Label>
                  <Input
                    id="vendorName"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    placeholder="e.g., The Barn at Cedar Creek"
                    data-testid="input-vendor-name"
                  />
                  <button
                    type="button"
                    onClick={() => setShowManualName(false)}
                    className="text-xs text-muted-foreground hover:text-foreground mt-1 underline"
                  >
                    Back to search
                  </button>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Austin, TX"
                    data-testid="input-location"
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="website">Website (optional)</Label>
              <Input
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://..."
                data-testid="input-website"
              />
            </div>

            <div>
              <Label htmlFor="email">Email (optional)</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@vendor.com"
                data-testid="input-email"
              />
            </div>

            <div>
              <Label>Message Format</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant={outputFormat === "email" ? "default" : "outline"}
                  onClick={() => setOutputFormat("email")}
                  className="flex-1"
                  data-testid="btn-format-email"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
                <Button
                  type="button"
                  variant={outputFormat === "form" ? "default" : "outline"}
                  onClick={() => setOutputFormat("form")}
                  className="flex-1"
                  data-testid="btn-format-form"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Contact Form
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {outputFormat === "email"
                  ? "Full email with subject line"
                  : "Shorter message for website forms"}
              </p>
            </div>

            <div className="border rounded-lg">
              <button
                type="button"
                onClick={() => setShowCustomization(!showCustomization)}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/50 transition-colors"
                data-testid="btn-toggle-customization"
              >
                <span className="font-medium text-sm">
                  Customize Your Inquiry
                </span>
                {showCustomization ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>

              {showCustomization && (
                <div className="p-3 pt-0 space-y-4">
                  <div className="space-y-2">
                    {currentToggles.map((toggle) => (
                      <label
                        key={toggle.id}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedToggles.includes(toggle.id)}
                          onChange={(e) =>
                            handleToggleChange(toggle.id, e.target.checked)
                          }
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                          data-testid={`checkbox-${toggle.id}`}
                        />
                        <span className="text-sm">{toggle.label}</span>
                      </label>
                    ))}
                  </div>

                  <div>
                    <Label htmlFor="customText" className="text-sm">
                      Anything specific to mention or ask?
                    </Label>
                    <Textarea
                      id="customText"
                      value={customText}
                      onChange={(e) =>
                        setCustomText(e.target.value.slice(0, 500))
                      }
                      placeholder='e.g., "We loved your olive grove ceremony photos" or "Do you offer poolside cocktail service?"'
                      className="mt-1 min-h-[80px] text-sm"
                      maxLength={500}
                      data-testid="textarea-custom-text"
                    />
                    <p className="text-xs text-muted-foreground mt-1 text-right">
                      {customText.length}/500
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleGenerateDraft}
                className="flex-1"
                disabled={!vendorName.trim() || isGenerating}
                data-testid="btn-generate-draft"
              >
                {isGenerating ? (
                  <>Generating...</>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Message
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 overflow-y-auto flex-1 px-1 -mx-1">
            <div className="relative">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="min-h-[400px] font-mono text-sm resize-y"
                data-testid="textarea-draft"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep("info")}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button variant="outline" onClick={handleSaveForLater}>
                Save Draft
              </Button>
              <Button
                onClick={
                  outputFormat === "email" ? handleSendEmail : handleCopyAndSave
                }
                data-testid="btn-action"
                disabled={isSending}
              >
                {outputFormat === "email" ? (
                  isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Email
                    </>
                  )
                ) : copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy & Save
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
