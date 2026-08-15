// Poster Maker configuration: sizes, starter templates, font choices,
// and a placeholder AI-copy generator (swap generatePosterCopy's body
// for a real API call whenever one is wired up).

export const POSTER_SIZES = [
  { id: "ig-post", label: "Instagram Post", width: 1080, height: 1080 },
  { id: "ig-story", label: "Instagram Story", width: 1080, height: 1920 },
  { id: "fb-post", label: "Facebook Post", width: 1200, height: 630 },
];

export const FONT_OPTIONS = [
  { id: "poppins", label: "Poppins (English)", className: "font-display" },
  { id: "inter", label: "Inter (English)", className: "font-body" },
  { id: "malayalam", label: "Noto Sans Malayalam", className: "font-malayalam" },
];

// `kind` drives which decorative layout variant PosterCanvas renders.
export const POSTER_TEMPLATES = [
  {
    id: "clinic",
    label: "Clinic Offer",
    kind: "clinic",
    color: "#0EA5A4",
    font: "inter",
    defaults: {
      headline: "Health Checkup Camp",
      subheadline: "Free consultation this week only",
      cta: "Book Appointment",
    },
  },
  {
    id: "retail",
    label: "Retail Sale",
    kind: "retail",
    color: "#E4572E",
    font: "poppins",
    defaults: {
      headline: "Mega Sale is Live",
      subheadline: "Flat discounts on your favourite picks",
      cta: "Shop Now",
    },
  },
  {
    id: "restaurant",
    label: "Restaurant Combo",
    kind: "restaurant",
    color: "#D89A2C",
    font: "poppins",
    defaults: {
      headline: "Weekend Combo Meal",
      subheadline: "Full meal, great price, today only",
      cta: "Order Now",
    },
  },
  {
    id: "salon",
    label: "Salon Offer",
    kind: "salon",
    color: "#C2185B",
    font: "poppins",
    defaults: {
      headline: "Glow-Up Package",
      subheadline: "Pamper yourself this season",
      cta: "Book a Slot",
    },
  },
  {
    id: "event",
    label: "Event Announcement",
    kind: "event",
    color: "#3B2E5A",
    font: "poppins",
    defaults: {
      headline: "Join Us This Weekend",
      subheadline: "An evening you won't want to miss",
      cta: "Reserve Your Spot",
    },
  },
  {
    id: "festival",
    label: "Festival Offer",
    kind: "festival",
    color: "#E4572E",
    font: "poppins",
    defaults: {
      headline: "Festival Season Special",
      subheadline: "Celebrate with our best offers yet",
      cta: "Visit Today",
    },
  },
];

/**
 * Placeholder for an AI copywriting call. Swap the body of this function
 * for a real request (e.g. to your backend / an LLM API) whenever one is
 * available — the calling code just awaits whatever this returns.
 */
export async function generatePosterCopy({ template, businessName, offerText }) {
  // simulate network latency so the button's loading state has something to show
  await new Promise((resolve) => setTimeout(resolve, 900));

  const tpl = POSTER_TEMPLATES.find((t) => t.id === template) || POSTER_TEMPLATES[0];
  const name = businessName?.trim() || "Your Business";

  const headline = offerText?.trim() ? offerText.trim() : tpl.defaults.headline;
  const subheadline = `${tpl.defaults.subheadline} — only at ${name}`;
  const cta = tpl.defaults.cta;

  return { headline, subheadline, cta };
}
