type GapLike = {
  eventId?: string;
  event?: string;
  eventKey?: string;
  segmentId?: string;
  categoryId?: string;
  category?: string;
  vendorCategory?: string;
  status?: string;
  source?: string;
};

type CustomEventLike = {
  id?: string;
  key?: string;
  name?: string;
  emoji?: string;
  icon?: string;
};

export type EventGapGroup = {
  eventId: string;
  eventName: string;
  eventIcon: string;
  amber: string[];
  red: string[];
};

const DEFAULT_EVENT_META: Record<
  string,
  { name: string; icon: string; rank: number }
> = {
  ceremony: { name: "Ceremony", icon: "Ceremony", rank: 1 },
  cocktail_hour: { name: "Cocktail Hour", icon: "Cocktail", rank: 2 },
  reception: { name: "Reception", icon: "Reception", rank: 3 },
  rehearsal_dinner: { name: "Rehearsal Dinner", icon: "Rehearsal", rank: 4 },
  welcome_event: { name: "Welcome Event", icon: "Welcome", rank: 5 },
  after_party: { name: "After Party", icon: "After Party", rank: 6 },
  next_day_brunch: { name: "Next Day Brunch", icon: "Brunch", rank: 7 },
  all_day: { name: "All Day", icon: "All Day", rank: 99 },
};

function normalizeEventId(gap: GapLike): string {
  return gap.eventId || gap.event || gap.eventKey || gap.segmentId || "all_day";
}

function normalizeCategoryId(gap: GapLike): string | null {
  const categoryId = gap.categoryId || gap.category || gap.vendorCategory;
  return categoryId || null;
}

function isAmber(gap: GapLike): boolean {
  const status = (gap.status || "").toLowerCase();
  const source = (gap.source || "").toLowerCase();

  if (
    status.includes("available_from_venue") ||
    status.includes("available") ||
    status.includes("optional") ||
    status.includes("via_venue")
  ) {
    return true;
  }

  if (source.includes("venue") || source.includes("optional")) {
    return true;
  }

  return false;
}

export function buildEventGapGroupsFromCoverage(
  gaps: unknown,
  customEvents?: unknown,
): EventGapGroup[] {
  const normalizedGaps = (Array.isArray(gaps) ? gaps : []) as GapLike[];
  const customEventList = (
    Array.isArray(customEvents) ? customEvents : []
  ) as CustomEventLike[];

  if (normalizedGaps.length === 0) {
    return [];
  }

  const customEventMeta = new Map<
    string,
    { name: string; icon: string; rank: number }
  >();
  customEventList.forEach((event, index) => {
    const id = event.id || event.key;
    if (!id) return;

    customEventMeta.set(id, {
      name: event.name || id,
      icon: event.emoji || event.icon || "Event",
      rank: 20 + index,
    });
  });

  const grouped = new Map<string, { amber: Set<string>; red: Set<string> }>();

  normalizedGaps.forEach((gap) => {
    const eventId = normalizeEventId(gap);
    const categoryId = normalizeCategoryId(gap);
    if (!categoryId) return;

    const bucket = grouped.get(eventId) || {
      amber: new Set<string>(),
      red: new Set<string>(),
    };

    if (isAmber(gap)) {
      bucket.red.delete(categoryId);
      bucket.amber.add(categoryId);
    } else if (!bucket.amber.has(categoryId)) {
      bucket.red.add(categoryId);
    }

    grouped.set(eventId, bucket);
  });

  const result: EventGapGroup[] = [];
  grouped.forEach((bucket, eventId) => {
    const meta = customEventMeta.get(eventId) ||
      DEFAULT_EVENT_META[eventId] || {
        name: eventId,
        icon: "Event",
        rank: 50,
      };

    result.push({
      eventId,
      eventName: meta.name,
      eventIcon: meta.icon,
      amber: Array.from(bucket.amber),
      red: Array.from(bucket.red),
    });
  });

  result.sort((a, b) => {
    const aRank =
      customEventMeta.get(a.eventId)?.rank ||
      DEFAULT_EVENT_META[a.eventId]?.rank ||
      50;
    const bRank =
      customEventMeta.get(b.eventId)?.rank ||
      DEFAULT_EVENT_META[b.eventId]?.rank ||
      50;

    if (aRank !== bRank) return aRank - bRank;
    return a.eventName.localeCompare(b.eventName);
  });

  return result;
}
