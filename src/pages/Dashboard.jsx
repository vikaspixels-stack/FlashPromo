import React, { useState, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Coffee, Scissors, ShoppingBag, Cookie, Sparkles, Copy, Check,
  Loader2, Phone, MessageCircle, MapPin, Clock, Sun, Moon,
  Instagram, Send, Star, Waves, ChevronRight, UtensilsCrossed,
  ShoppingCart, Dumbbell, Gem, Flower2, HeartPulse, IceCreamCone,
  Smartphone, BookOpen, PawPrint, Camera, Globe, Image as ImageIcon
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Kochi Spark — hyper-local promo generator for small businesses     */
/* ------------------------------------------------------------------ */

const BUSINESS_TYPES = [
  { id: "cafe", label: "Cafe", icon: Coffee, tags: ["KochiCafes", "KochiFoodies", "CoffeeInKochi"] },
  { id: "bakery", label: "Bakery", icon: Cookie, tags: ["KochiBakes", "KochiFoodies", "FreshFromOven"] },
  { id: "salon", label: "Salon", icon: Scissors, tags: ["KochiSalon", "KochiGlowUp", "SelfCareKochi"] },
  { id: "boutique", label: "Boutique", icon: ShoppingBag, tags: ["KochiFashion", "KochiBoutique", "StyleInKochi"] },
  { id: "restaurant", label: "Restaurant", icon: UtensilsCrossed, tags: ["KochiEats", "KochiFoodies", "DineInKochi"] },
  { id: "grocery", label: "Grocery Store", icon: ShoppingCart, tags: ["KochiGrocery", "FreshInKochi", "DailyNeeds"] },
  { id: "gym", label: "Gym / Fitness", icon: Dumbbell, tags: ["KochiFitness", "KochiGym", "FitKochi"] },
  { id: "jewellery", label: "Jewellery", icon: Gem, tags: ["KochiJewellery", "KochiGold", "ShineInKochi"] },
  { id: "florist", label: "Florist", icon: Flower2, tags: ["KochiFlowers", "FreshBlooms", "KochiFlorist"] },
  { id: "spa", label: "Spa / Wellness", icon: HeartPulse, tags: ["KochiSpa", "KochiWellness", "RelaxInKochi"] },
  { id: "icecream", label: "Ice Cream Parlour", icon: IceCreamCone, tags: ["KochiDesserts", "KochiFoodies", "SweetTreatsKochi"] },
  { id: "electronics", label: "Electronics Store", icon: Smartphone, tags: ["KochiElectronics", "GadgetsInKochi", "TechDealsKochi"] },
  { id: "tuition", label: "Tuition / Coaching", icon: BookOpen, tags: ["KochiTuition", "LearnInKochi", "KochiStudents"] },
  { id: "petstore", label: "Pet Store", icon: PawPrint, tags: ["KochiPets", "PetLoversKochi", "PetCareKochi"] },
  { id: "studio", label: "Photography Studio", icon: Camera, tags: ["KochiPhotography", "CaptureKochi", "KochiStudio"] },
];

const LOCALITIES = [
  "PanampillyNagar", "MGRoad", "Kakkanad", "Edappally", "FortKochi",
  "Vyttila", "Kaloor", "Palarivattom", "Vazhakkala", "Ernakulam",
  "Kadavanthra", "Thrikkakara", "Kalamassery", "Thevara", "ChittoorRoad",
  "MarineDrive", "Thoppumpady", "Mattancherry", "Cherai", "Aluva",
  "Tripunithura", "Elamkulam", "WillingdonIsland", "ChangampuzhaPark",
];

// Malayalam labels for each business type (used when content/UI language is set to Malayalam)
const TYPE_LABEL_ML = {
  cafe: "കഫേ",
  bakery: "ബേക്കറി",
  salon: "സലൂൺ",
  boutique: "ബൂട്ടിക്",
  restaurant: "റെസ്റ്റോറന്റ്",
  grocery: "പലചരക്ക് കട",
  gym: "ജിം",
  jewellery: "ജ്വല്ലറി",
  florist: "പൂക്കട",
  spa: "സ്പാ",
  icecream: "ഐസ്ക്രീം പാർലർ",
  electronics: "ഇലക്ട്രോണിക്സ് സ്റ്റോർ",
  tuition: "ട്യൂഷൻ സെന്റർ",
  petstore: "പെറ്റ് സ്റ്റോർ",
  studio: "ഫോട്ടോ സ്റ്റുഡിയോ",
};

const LANGUAGES = [
  { id: "en", label: "English" },
  { id: "manglish", label: "Manglish" },
  { id: "ml", label: "മലയാളം" },
];

const MANGLISH_HOOKS = [
  "Adipoli offer alert! 🔥",
  "Ende ponnu, ithu miss cheyyalle! 😍",
  "Kidilan deal ivide undu! 🎉",
  "Onnu vanno kandokku! 👀",
  "Polichadu offer ivide! 💥",
  "Chill aayittu vaa, treat kayyil! ☕",
  "Ee offer kandal odi varum! 🏃",
];

const EN_CLOSINGS = [
  "Drop by {name} today and treat yourself 💛 Tag a friend who needs to see this!",
  "Come say hi at {name} today — bring a friend along 💛",
  "{name} is waiting for you today. Don't sleep on this one 💛",
];

const ML_IG_OPENERS = [
  "ഇന്ന് പ്രത്യേക ഓഫർ നിങ്ങൾക്കായി! ✨",
  "കൊച്ചിയിലെ ഏറ്റവും കിടിലൻ ഓഫർ ഇതാ! 🔥",
  "ഇത് മിസ് ചെയ്യല്ലേ, കൂട്ടരേ! 😍",
  "ഇന്നത്തെ സ്പെഷ്യൽ ഇതാ, വേഗം വരൂ! 🎉",
];

const ML_IG_CLOSINGS = [
  "ഇന്ന് തന്നെ {name}-ൽ എത്തൂ, സ്വയം ഒരു ട്രീറ്റ് കൊടുക്കൂ 💛 കൂട്ടുകാരെ ടാഗ് ചെയ്യാൻ മറക്കല്ലേ!",
  "{name}-ൽ ഇന്ന് നിങ്ങളെ കാത്തിരിക്കുന്നു 💛 കൂട്ടുകാരെയും കൂട്ടി വരൂ!",
];

const ML_WA_OPENERS = [
  "🎉 പ്രത്യേക ഓഫർ",
  "🔥 ഇന്ന് മാത്രം",
  "✨ കിടിലൻ ഡീൽ",
  "🎁 സ്പെഷ്യൽ ഓഫർ",
];

const IG_OPENERS = {
  cafe: [
    "Your daily caffeine fix just got sweeter ☕✨",
    "Rainy Kochi evenings need this brew 🌧️☕",
    "New day, new reason to walk in 🚪☕",
  ],
  bakery: [
    "Fresh out of the oven and calling your name 🍞🔥",
    "Warm, buttery, and ready for you today 🧁",
    "The smell of fresh bakes hits different 🍰",
  ],
  salon: [
    "Glow-up season is officially here ✨💇",
    "Your mirror is about to say 'wow' 💫",
    "Self-care Sunday? We got you 💅",
  ],
  boutique: [
    "New drop, who dis? 👗✨",
    "Your wardrobe called, it's upgrade time 🛍️",
    "Style that turns Kochi heads 😍",
  ],
  restaurant: [
    "Table for you? We saved one 🍽️✨",
    "Hungry Kochi, this one's for you 🔥🍛",
    "Good food, better company, best prices today 😋",
  ],
  grocery: [
    "Fresh stock just rolled in 🛒✨",
    "Your kitchen essentials, sorted today 🥬",
    "Stock up before the shelf empties 🏃🛍️",
  ],
  gym: [
    "Your next PR starts here 💪🔥",
    "No excuses, just gains today 🏋️",
    "Sweat now, shine later ✨💦",
  ],
  jewellery: [
    "Shine a little brighter today ✨💍",
    "Timeless pieces, today's special price 💎",
    "Gold that gets you noticed 😍",
  ],
  florist: [
    "Fresh blooms, fresh mood 🌸✨",
    "Say it with flowers today 💐",
    "Petals that make people stop and stare 🌺",
  ],
  spa: [
    "Press pause, you've earned it 💆✨",
    "Relax mode: activated today 🌿",
    "Your calm starts right here 🧖‍♀️",
  ],
  icecream: [
    "One scoop, zero regrets 🍦✨",
    "Kochi heat needs this fix today 🍨",
    "Sweet cravings? Sorted 😋🍧",
  ],
  electronics: [
    "Upgrade season is here 📱🔥",
    "Tech deals that don't wait 💻✨",
    "Your next gadget, today's price 🎧",
  ],
  tuition: [
    "Smarter starts here today 📚✨",
    "Seats filling fast, don't miss out 🎓",
    "Learning made easy, today's batch 🧠",
  ],
  petstore: [
    "Treats and toys, tails wagging 🐾✨",
    "Your furry friend deserves this today 🐶",
    "Everything paw-some, today's deal 🐱",
  ],
  studio: [
    "Frame your best moments today 📸✨",
    "Every story deserves a great shot 🎞️",
    "Book today, treasure it forever 😍",
  ],
};

const WA_OPENERS = {
  cafe: ["☕ COFFEE ALERT", "🔥 TODAY ONLY", "☕ FRESH BREW DEAL"],
  bakery: ["🍞 OVEN FRESH", "🧁 SWEET DEAL", "🔥 BAKERY SPECIAL"],
  salon: ["💇 GLOW OFFER", "✨ SALON SPECIAL", "💅 SELF-CARE DEAL"],
  boutique: ["🛍️ NEW DROP", "👗 STYLE DEAL", "🔥 SALE ALERT"],
  restaurant: ["🍽️ FOODIE ALERT", "🔥 TODAY ONLY", "🍛 MEAL DEAL"],
  grocery: ["🛒 FRESH STOCK", "🥬 DAILY DEAL", "🔥 STOCK-UP OFFER"],
  gym: ["💪 FITNESS DEAL", "🔥 MEMBERSHIP OFFER", "🏋️ TODAY ONLY"],
  jewellery: ["💍 SHINE OFFER", "✨ JEWELLERY DEAL", "💎 TODAY ONLY"],
  florist: ["🌸 FRESH BLOOMS", "💐 FLOWER DEAL", "🔥 TODAY ONLY"],
  spa: ["💆 SPA OFFER", "🌿 WELLNESS DEAL", "🧖 TODAY ONLY"],
  icecream: ["🍦 SCOOP DEAL", "🍨 SWEET OFFER", "🔥 TODAY ONLY"],
  electronics: ["📱 GADGET DEAL", "💻 TECH OFFER", "🔥 TODAY ONLY"],
  tuition: ["📚 ADMISSION OFFER", "🎓 SEATS OPEN", "🔥 LIMITED SEATS"],
  petstore: ["🐾 PET DEAL", "🐶 TODAY ONLY", "🔥 PET CARE OFFER"],
  studio: ["📸 BOOKING OFFER", "🎞️ SHOOT DEAL", "🔥 TODAY ONLY"],
};

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN(arr, n) {
  const copy = [...arr];
  const out = [];
  while (out.length < n && copy.length) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  }
  return out;
}

function buildInstagram({ name, type, offer, locality, lang = "manglish" }) {
  const t = type || "cafe";
  const baseTags = BUSINESS_TYPES.find((b) => b.id === t)?.tags || [];
  const locTags = pickN(LOCALITIES, 2).map((l) => `#${l}`);
  const tags = [...baseTags.map((x) => `#${x}`), `#${locality}`, ...locTags, "#SupportLocalKochi"];
  const uniqueTags = [...new Set(tags)].slice(0, 7).join(" ");

  if (lang === "ml") {
    const opener = pick(ML_IG_OPENERS);
    const closing = pick(ML_IG_CLOSINGS).replace("{name}", name);
    const offerLine = offer ? `\n\n📍 ഇന്നത്തെ ഓഫർ: ${offer}` : "";
    return `${opener}\n\n${TYPE_LABEL_ML[t] || ""} · ${name}${offerLine}\n\n${closing}\n\n${uniqueTags}`;
  }

  const opener = pick(IG_OPENERS[t] || IG_OPENERS.cafe);
  const offerLine = offer ? `\n\n📍 Today's Special: ${offer}` : "";

  if (lang === "en") {
    const closing = pick(EN_CLOSINGS).replace("{name}", name);
    return `${opener}${offerLine}\n\n${closing}\n\n${uniqueTags}`;
  }

  // manglish (default)
  const manglish = pick(MANGLISH_HOOKS);
  const closing = pick(EN_CLOSINGS).replace("{name}", name);
  return `${opener}\n\n${manglish}${offerLine}\n\n${closing}\n\n${uniqueTags}`;
}

function buildWhatsApp({ name, type, offer, locality, lang = "manglish" }) {
  const t = type || "cafe";

  if (lang === "ml") {
    const opener = pick(ML_WA_OPENERS);
    const offerLine = offer ? `\n\n🎁 *${offer}*` : "\n\n🎁 ഇന്ന് പ്രത്യേക ഓഫർ ഉണ്ട്!";
    return `${opener} 🚨\n\n*${name}* (${TYPE_LABEL_ML[t] || ""})!${offerLine}\n\n📍 ${locality}, കൊച്ചി\n⏰ ഇന്ന് മാത്രം, സ്റ്റോക്ക് തീരും മുൻപ് വാങ്ങൂ!\n\nഗ്രൂപ്പിൽ ഷെയർ ചെയ്യാൻ മറക്കല്ലേ 👇`;
  }

  const opener = pick(WA_OPENERS[t] || WA_OPENERS.cafe);
  const offerLine = offer ? `\n\n🎁 *${offer}*` : "\n\n🎁 Special offer running today!";

  if (lang === "en") {
    return `${opener} 🚨\n\n*${name}* here!${offerLine}\n\n📍 ${locality}, Kochi\n⏰ Valid today only, limited stock!\n\nForward to your group before it's gone 👇`;
  }

  // manglish (default)
  const manglish = pick(MANGLISH_HOOKS);
  return `${opener} 🚨\n\n*${name}* here! ${manglish}${offerLine}\n\n📍 ${locality}, Kochi\n⏰ Valid today only, limited stock!\n\nForward to your group before it's gone 👇`;
}

const THEME = {
  light: {
    appBg: "bg-[#FBF1E1]",
    frameBg: "bg-[#FBF1E1]",
    text: "text-[#12312B]",
    subtext: "text-[#5C6B65]",
    card: "bg-white",
    cardBorder: "border-[#E4D9C4]",
    input: "bg-white border-[#E4D9C4] text-[#12312B] placeholder-[#9CA69E]",
    header: "bg-gradient-to-br from-[#0D4F44] via-[#0D4F44] to-[#0A3B33]",
    accent: "text-[#E4572E]",
    accentBg: "bg-[#E4572E]",
    gold: "text-[#D89A2C]",
    goldBg: "bg-[#D89A2C]",
    tabActive: "bg-[#0D4F44] text-white",
    tabInactive: "text-[#5C6B65]",
    chip: "bg-[#F1E6D3] text-[#0D4F44]",
  },
  dark: {
    appBg: "bg-[#081915]",
    frameBg: "bg-[#0A1F1A]",
    text: "text-[#F3EDDE]",
    subtext: "text-[#93A69D]",
    card: "bg-[#10241E]",
    cardBorder: "border-[#1E3A32]",
    input: "bg-[#10241E] border-[#1E3A32] text-[#F3EDDE] placeholder-[#5A6E66]",
    header: "bg-gradient-to-br from-[#0D4F44] via-[#0B3B32] to-[#062017]",
    accent: "text-[#F0764F]",
    accentBg: "bg-[#E4572E]",
    gold: "text-[#E8B44E]",
    goldBg: "bg-[#D89A2C]",
    tabActive: "bg-[#E4572E] text-white",
    tabInactive: "text-[#93A69D]",
    chip: "bg-[#16332B] text-[#E8B44E]",
  },
};

const UI_STRINGS = {
  kicker: { en: "Kochi Spark", manglish: "Kochi Spark", ml: "കൊച്ചി സ്പാർക്ക്" },
  appTitle: { en: "Promo Generator", manglish: "Promo Generator", ml: "പ്രമോ ജനറേറ്റർ" },
  yourBusiness: { en: "Your Business", manglish: "Ningalude Business", ml: "നിങ്ങളുടെ ബിസിനസ്" },
  businessName: { en: "Business Name", manglish: "Business Peru", ml: "ബിസിനസ് പേര്" },
  businessNamePh: { en: "e.g. Kochi Brews Cafe", manglish: "ഉദാ: Kochi Brews Cafe", ml: "ഉദാ: Kochi Brews Cafe" },
  businessType: { en: "Business Type", manglish: "Business Type", ml: "ബിസിനസ് തരം" },
  locality: { en: "Locality", manglish: "Area / Locality", ml: "സ്ഥലം" },
  offer: { en: "Today's Special / Offer", manglish: "Innathe Special / Offer", ml: "ഇന്നത്തെ പ്രത്യേകത / ഓഫർ" },
  offerPh: { en: "e.g. Buy 1 Get 1 Free on Cold Coffee", manglish: "ഉദാ: Buy 1 Get 1 Free", ml: "ഉദാ: ഒന്ന് വാങ്ങിയാൽ ഒന്ന് ഫ്രീ" },
  phone: { en: "Phone (for card / WhatsApp)", manglish: "Phone Number", ml: "ഫോൺ നമ്പർ" },
  language: { en: "Language", manglish: "Language / Bhasha", ml: "ഭാഷ" },
  generate: { en: "Generate with AI", manglish: "AI vechu Generate cheyyu", ml: "AI ഉപയോഗിച്ച് തയ്യാറാക്കൂ" },
  generating: { en: "Generating...", manglish: "Undakkunnu...", ml: "തയ്യാറാക്കുന്നു..." },
  tabInstagram: { en: "Instagram", manglish: "Instagram", ml: "ഇൻസ്റ്റഗ്രാം" },
  tabWhatsapp: { en: "WhatsApp", manglish: "WhatsApp", ml: "വാട്‌സ്ആപ്പ്" },
  tabCard: { en: "Quick Card", manglish: "Quick Card", ml: "ക്വിക്ക് കാർഡ്" },
  emptyTitle: { en: "Nothing generated yet", manglish: "Onnum undakkiyittilla", ml: "ഇതുവരെ ഒന്നും തയ്യാറാക്കിയിട്ടില്ല" },
  emptySub: {
    en: "Fill in your details above and hit \"Generate with AI\" to create your posts.",
    manglish: "Mukalil details fill cheythitt \"Generate with AI\" press cheyyu.",
    ml: "മുകളിൽ വിവരങ്ങൾ നൽകി \"Generate with AI\" അമർത്തൂ.",
  },
  igCaptionLabel: { en: "Instagram Caption", manglish: "Instagram Caption", ml: "ഇൻസ്റ്റഗ്രാം കുറിപ്പ്" },
  waBroadcastLabel: { en: "WhatsApp Broadcast", manglish: "WhatsApp Broadcast", ml: "വാട്‌സ്ആപ്പ് സന്ദേശം" },
  callNow: { en: "Call Now", manglish: "Call Cheyyu", ml: "വിളിക്കൂ" },
  whatsappBtn: { en: "WhatsApp", manglish: "WhatsApp", ml: "വാട്‌സ്ആപ്പ്" },
  openToday: { en: "Open today · 9:00 AM – 9:00 PM", manglish: "Innu open aanu · 9:00 AM – 9:00 PM", ml: "ഇന്ന് തുറന്നിരിക്കുന്നു · 9:00 AM – 9:00 PM" },
  shareCard: { en: "Shareable link-in-bio style card", manglish: "Share cheyyaan pattunna card", ml: "ഷെയർ ചെയ്യാവുന്ന കാർഡ്" },
  copy: { en: "Copy", manglish: "Copy", ml: "കോപ്പി" },
  copied: { en: "Copied!", manglish: "Copied!", ml: "കോപ്പി ചെയ്തു!" },
};

function t(key, lang) {
  return UI_STRINGS[key]?.[lang] || UI_STRINGS[key]?.en || key;
}

function CopyButton({ text, c, lang = "en" }) {
  const [copied, setCopied] = useState(false);
  const taRef = useRef(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      // fallback for sandboxed environments
      const ta = taRef.current;
      if (ta) {
        ta.value = text;
        ta.select();
        try { document.execCommand("copy"); } catch (err) {}
      }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <>
      <textarea ref={taRef} className="sr-only" readOnly tabIndex={-1} />
      <button
        onClick={handleCopy}
        className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
          copied ? "bg-emerald-500 text-white" : `${c.accentBg} text-white active:scale-95`
        }`}
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? t("copied", lang) : t("copy", lang)}
      </button>
    </>
  );
}

export default function Dashboard() {
  const [theme, setTheme] = useState("light");
  const c = THEME[theme];
  const [lang, setLang] = useState("manglish");

  const [profile, setProfile] = useState({
    name: "Kochi Brews Cafe",
    type: "cafe",
    offer: "Buy 1 Get 1 Free on Cold Coffee",
    locality: "PanampillyNagar",
    phone: "+91 98765 43210",
  });

  const [activeTab, setActiveTab] = useState("ig");
  const [generating, setGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [ig, setIg] = useState("");
  const [wa, setWa] = useState("");
  const [seed, setSeed] = useState(0);

  const typeObj = useMemo(
    () => BUSINESS_TYPES.find((b) => b.id === profile.type) || BUSINESS_TYPES[0],
    [profile.type]
  );
  const TypeIcon = typeObj.icon;
  const typeLabel = lang === "ml" ? (TYPE_LABEL_ML[typeObj.id] || typeObj.label) : typeObj.label;

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setIg(buildInstagram({ ...profile, lang }));
      setWa(buildWhatsApp({ ...profile, lang }));
      setGenerating(false);
      setHasGenerated(true);
      setSeed((s) => s + 1);
    }, 1100);
  };

  const tabs = [
    { id: "ig", label: t("tabInstagram", lang), icon: Instagram },
    { id: "wa", label: t("tabWhatsapp", lang), icon: MessageCircle },
    { id: "card", label: t("tabCard", lang), icon: Sparkles },
  ];

  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-4 sm:p-8 transition-colors duration-300 ${c.appBg}`}>
      {/* Phone frame */}
      <div className={`relative w-full max-w-[400px] rounded-[2.25rem] border-[6px] border-[#0D4F44]/20 shadow-2xl overflow-hidden ${c.frameBg}`}>
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-black/80 rounded-b-2xl z-20" />

        <div className="h-[calc(100vh-4rem)] max-h-[820px] overflow-y-auto no-scrollbar">
          {/* Header */}
          <div className={`relative px-5 pt-9 pb-6 ${c.header} overflow-hidden`}>
            <Waves className="absolute -bottom-4 -right-4 text-white/10" size={110} strokeWidth={1} />
            <Waves className="absolute top-2 -left-6 text-white/5 rotate-180" size={90} strokeWidth={1} />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/60 font-semibold">{t("kicker", lang)}</p>
                <h1 className="text-white text-lg font-bold mt-0.5 flex items-center gap-1.5">
                  <Sparkles size={16} className="text-[#E8B44E]" />
                  {t("appTitle", lang)}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to="/poster-maker"
                  className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 h-9 text-xs font-semibold text-white active:scale-90 transition-transform"
                >
                  <ImageIcon size={14} />
                  Poster Maker
                </Link>
                <button
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                  className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-white active:scale-90 transition-transform"
                  aria-label="Toggle theme"
                >
                  {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
                </button>
              </div>
            </div>

            {/* Language selector */}
            <div className="relative flex items-center gap-1.5 mt-4">
              <Globe size={13} className="text-white/60 shrink-0" />
              <div className="flex rounded-full bg-white/10 p-0.5 gap-0.5 flex-1">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setLang(l.id)}
                    className={`flex-1 rounded-full py-1 text-[11px] font-semibold transition-all ${
                      lang === l.id ? "bg-white text-[#0D4F44]" : "text-white/70"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Profile setup card */}
          <div className="px-4 -mt-4 relative z-10">
            <div className={`rounded-2xl border ${c.cardBorder} ${c.card} p-4 shadow-lg space-y-3`}>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg ${c.chip} flex items-center justify-center shrink-0`}>
                  <TypeIcon size={16} />
                </div>
                <p className={`text-xs font-semibold ${c.subtext} uppercase tracking-wide`}>{t("yourBusiness", lang)}</p>
              </div>

              <div>
                <label className={`text-[11px] font-medium ${c.subtext}`}>{t("businessName", lang)}</label>
                <input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder={t("businessNamePh", lang)}
                  className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#E4572E]/40 ${c.input}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`text-[11px] font-medium ${c.subtext}`}>{t("businessType", lang)}</label>
                  <select
                    value={profile.type}
                    onChange={(e) => setProfile({ ...profile, type: e.target.value })}
                    className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#E4572E]/40 ${c.input}`}
                  >
                    {BUSINESS_TYPES.map((b) => (
                      <option key={b.id} value={b.id}>
                        {lang === "ml" ? (TYPE_LABEL_ML[b.id] || b.label) : b.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`text-[11px] font-medium ${c.subtext}`}>{t("locality", lang)}</label>
                  <select
                    value={profile.locality}
                    onChange={(e) => setProfile({ ...profile, locality: e.target.value })}
                    className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#E4572E]/40 ${c.input}`}
                  >
                    {LOCALITIES.map((l) => (
                      <option key={l} value={l}>{l.replace(/([A-Z])/g, " $1").trim()}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={`text-[11px] font-medium ${c.subtext}`}>{t("offer", lang)}</label>
                <input
                  value={profile.offer}
                  onChange={(e) => setProfile({ ...profile, offer: e.target.value })}
                  placeholder={t("offerPh", lang)}
                  className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#E4572E]/40 ${c.input}`}
                />
              </div>

              <div>
                <label className={`text-[11px] font-medium ${c.subtext}`}>{t("phone", lang)}</label>
                <input
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#E4572E]/40 ${c.input}`}
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={generating || !profile.name}
                className={`w-full mt-1 rounded-xl py-2.5 text-sm font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 ${c.accentBg}`}
              >
                {generating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {t("generating", lang)}
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    {t("generate", lang)}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-4 mt-5">
            <div className={`flex rounded-full p-1 ${c.card} border ${c.cardBorder}`}>
              {tabs.map((tab) => {
                const TIcon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold transition-all ${
                      active ? c.tabActive : c.tabInactive
                    }`}
                  >
                    <TIcon size={13} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab content */}
          <div className="px-4 py-4 pb-8">
            {!hasGenerated && (
              <div className={`rounded-2xl border border-dashed ${c.cardBorder} py-10 px-5 text-center`}>
                <Sparkles size={22} className={`mx-auto mb-2 ${c.gold}`} />
                <p className={`text-sm font-semibold ${c.text}`}>{t("emptyTitle", lang)}</p>
                <p className={`text-xs mt-1 ${c.subtext}`}>{t("emptySub", lang)}</p>
              </div>
            )}

            {hasGenerated && activeTab === "ig" && (
              <div key={`ig-${seed}`} className={`rounded-2xl border ${c.cardBorder} ${c.card} p-4 shadow-sm animate-[fadeIn_0.3s_ease]`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Instagram size={16} className={c.accent} />
                    <p className={`text-xs font-bold uppercase tracking-wide ${c.subtext}`}>{t("igCaptionLabel", lang)}</p>
                  </div>
                  <CopyButton text={ig} c={c} lang={lang} />
                </div>
                <p className={`text-sm whitespace-pre-wrap leading-relaxed ${c.text}`}>{ig}</p>
              </div>
            )}

            {hasGenerated && activeTab === "wa" && (
              <div key={`wa-${seed}`} className={`rounded-2xl border ${c.cardBorder} ${c.card} p-4 shadow-sm`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MessageCircle size={16} className="text-emerald-500" />
                    <p className={`text-xs font-bold uppercase tracking-wide ${c.subtext}`}>{t("waBroadcastLabel", lang)}</p>
                  </div>
                  <CopyButton text={wa} c={c} lang={lang} />
                </div>
                <div className="rounded-xl bg-[#DCF4E4] p-3">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed text-[#12312B]">{wa}</p>
                </div>
              </div>
            )}

            {hasGenerated && activeTab === "card" && (
              <div key={`card-${seed}`} className="space-y-3">
                <div className={`rounded-2xl overflow-hidden border ${c.cardBorder} shadow-sm`}>
                  <div className={`p-5 text-center ${c.header} relative`}>
                    <Waves className="absolute -bottom-2 -right-2 text-white/10" size={70} strokeWidth={1} />
                    <div className="w-14 h-14 rounded-2xl bg-white/15 mx-auto flex items-center justify-center mb-2">
                      <TypeIcon size={26} className="text-white" />
                    </div>
                    <h3 className="text-white font-bold text-base">{profile.name}</h3>
                    <p className="text-white/70 text-xs mt-0.5">{typeLabel} · {profile.locality.replace(/([A-Z])/g, " $1").trim()}, Kochi</p>
                  </div>
                  <div className={`p-4 space-y-3 ${c.card}`}>
                    {profile.offer && (
                      <div className={`flex items-center gap-2 rounded-xl px-3 py-2 ${c.chip}`}>
                        <Star size={14} className="shrink-0" />
                        <p className="text-xs font-semibold">{profile.offer}</p>
                      </div>
                    )}
                    <div className={`flex items-center gap-2 text-xs ${c.subtext}`}>
                      <MapPin size={13} />
                      {profile.locality.replace(/([A-Z])/g, " $1").trim()}, Kochi, Kerala
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${c.subtext}`}>
                      <Clock size={13} />
                      {t("openToday", lang)}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <a
                        href={`tel:${profile.phone.replace(/\s/g, "")}`}
                        className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold text-white bg-[#0D4F44] active:scale-[0.97] transition-transform"
                      >
                        <Phone size={14} /> {t("callNow", lang)}
                      </a>
                      <a
                        href={`https://wa.me/${profile.phone.replace(/[^\d]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold text-white bg-emerald-500 active:scale-[0.97] transition-transform"
                      >
                        <MessageCircle size={14} /> {t("whatsappBtn", lang)}
                      </a>
                    </div>
                  </div>
                </div>

                <div className={`rounded-2xl border ${c.cardBorder} ${c.card} p-3 flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <ChevronRight size={14} className={c.accent} />
                    <p className={`text-xs font-medium ${c.text}`}>{t("shareCard", lang)}</p>
                  </div>
                  <CopyButton
                    text={`${profile.name} — ${typeLabel} in ${profile.locality.replace(/([A-Z])/g, " $1").trim()}, Kochi\n${profile.offer ? "🎁 " + profile.offer + "\n" : ""}📞 ${profile.phone}`}
                    c={c}
                    lang={lang}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px);} to { opacity: 1; transform: translateY(0);} }
        .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
      `}</style>
    </div>
  );
}
