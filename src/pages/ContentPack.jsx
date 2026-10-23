import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Sparkles, Copy, Check, History, Instagram, MessageCircle,
  Video, Image as ImageIcon, RotateCcw, Save, Wand2
} from "lucide-react";

const DEFAULT_PROFILE = {
  businessName: "Kochi Brews Cafe",
  businessType: "cafe",
  product: "Cold Coffee",
  price: "₹149",
  offer: "Buy 1 Get 1 Free",
  locality: "Panampilly Nagar, Kochi",
  language: "English",
  tone: "Friendly and premium",
};

const BUSINESS_TYPES = [
  "Cafe", "Bakery", "Restaurant", "Salon", "Boutique", "Grocery Store",
  "Gym / Fitness", "Jewellery", "Florist", "Spa / Wellness", "Other"
];

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function buildPack(profile) {
  const name = profile.businessName.trim() || "Your Business";
  const product = profile.product.trim() || "today's special";
  const price = profile.price.trim();
  const offer = profile.offer.trim();
  const location = profile.locality.trim() || "Kochi";
  const isMalayalam = profile.language === "Malayalam";
  const isManglish = profile.language === "Manglish";
  const priceText = price ? ` · ${price}` : "";
  const offerText = offer ? `${offer}` : `Try our ${product}`;
  const hashtags = "#KochiEats #SupportLocalKochi #KochiFoodies #SmallBusinessIndia #ShopLocal";

  if (isMalayalam) {
    return [
      { id: "caption", title: "Instagram Caption", icon: "instagram", text: `✨ ${name}-ൽ ഇന്നത്തെ സ്പെഷ്യൽ!\n\n${product}${priceText}\n🎁 ${offerText}\n\nനിങ്ങളുടെ അടുത്ത ട്രീറ്റിനായി ഇന്ന് തന്നെ സന്ദർശിക്കൂ! 💚\n📍 ${location}\n\n#KochiEats #SupportLocalKochi #KochiFoodies` },
      { id: "poster", title: "Poster Copy", icon: "image", text: `${offerText}\n${product}${priceText}\n${name}\n${location}\nഇന്ന് തന്നെ സന്ദർശിക്കൂ!` },
      { id: "reel", title: "15-second Reel Script", icon: "video", text: `0–3 സെക്കൻഡ്: ${product}-ന്റെ ക്ലോസ്-അപ്പ്\nസ്ക്രീൻ ടെക്സ്റ്റ്: ഇന്നത്തെ സ്പെഷ്യൽ ✨\n\n3–7 സെക്കൻഡ്: ഉൽപ്പന്നവും ഓഫറും കാണിക്കുക\nവോയ്സ് ഓവർ: ${offerText}\n\n7–12 സെക്കൻഡ്: തയ്യാറാക്കുന്ന ദൃശ്യം / സർവിംഗ് ഷോട്ട്\n\n12–15 സെക്കൻഡ്: ${name} · ${location}\nCTA: ഇന്ന് തന്നെ സന്ദർശിക്കൂ!` },
      { id: "whatsapp", title: "WhatsApp Status", icon: "message", text: `✨ ${name} ഇന്നത്തെ സ്പെഷ്യൽ\n\n${product}${priceText}\n🎁 ${offerText}\n📍 ${location}\n\nകൂട്ടുകാരുമായി ഷെയർ ചെയ്യൂ 💚` },
      { id: "hashtags", title: "Hashtags", icon: "instagram", text: "#KochiEats #SupportLocalKochi #KochiFoodies #KeralaBusiness #ShopLocal" },
    ];
  }
  if (isManglish) {
    return [
      { id: "caption", title: "Instagram Caption", icon: "instagram", text: `Kidilan special at ${name}! ✨\n\n${product}${priceText}\n🎁 ${offerText}\n\nEe offer miss cheyyalle — friendsineyum kootti vaa! 💚\n📍 ${location}\n\n${hashtags}` },
      { id: "poster", title: "Poster Copy", icon: "image", text: `${offerText}\n${product}${priceText}\n${name}\n${location}\nInn thanne visit cheyyu!` },
      { id: "reel", title: "15-second Reel Script", icon: "video", text: `0–3 sec: Close-up of ${product}\nOn-screen: Innathe special ✨\n\n3–7 sec: Reveal the product and offer\nVoice-over: ${offerText}!\n\n7–12 sec: Show preparation / serving shot\n\n12–15 sec: ${name} · ${location}\nCTA: Inn thanne visit cheyyu!` },
      { id: "whatsapp", title: "WhatsApp Status", icon: "message", text: `🔥 ${name} special!\n\n${product}${priceText}\n🎁 ${offerText}\n📍 ${location}\n\nFriendsinu share cheyyane 💚` },
      { id: "hashtags", title: "Hashtags", icon: "instagram", text: hashtags },
    ];
  }
  return [
    { id: "caption", title: "Instagram Caption", icon: "instagram", text: `Your next favourite is waiting at ${name} ✨\n\nIntroducing ${product}${priceText}.\n🎁 Special: ${offerText}\n\nMake today a little more delicious. Visit us and bring a friend along! 💚\n📍 ${location}\n\n${hashtags}` },
    { id: "poster", title: "Poster Copy", icon: "image", text: `${offerText}\nMeet your new favourite: ${product}${priceText}\n${name}\n${location}\nVisit us today` },
    { id: "reel", title: "15-second Reel Script", icon: "video", text: `0–3 sec — Hook: cinematic close-up of ${product}\nOn-screen text: Your next favourite is here ✨\n\n3–7 sec — Reveal the product and offer\nVoice-over: ${offerText}\n\n7–12 sec — Show preparation, texture or serving\nOn-screen text: Made fresh for your next visit\n\n12–15 sec — Show business name and location\nOn-screen text: ${name} · ${location}\nCTA: Visit us today!` },
    { id: "whatsapp", title: "WhatsApp Status", icon: "message", text: `✨ TODAY'S SPECIAL at ${name}\n\n${product}${priceText}\n🎁 ${offerText}\n📍 ${location}\n\nDrop by today or share this with a friend!` },
    { id: "hashtags", title: "Hashtags", icon: "instagram", text: hashtags },
  ];
}

function ContentCard({ item, onUsePoster }) {
  const [copied, setCopied] = useState(false);
  const Icon = item.icon === "instagram" ? Instagram : item.icon === "image" ? ImageIcon : item.icon === "video" ? Video : MessageCircle;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(item.text);
    } catch {
      const field = document.createElement("textarea");
      field.value = item.text;
      document.body.appendChild(field);
      field.select();
      document.execCommand("copy");
      field.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };
  return (
    <article className="rounded-2xl border border-[#E4D9C4] bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[#12312B]">
          <Icon size={17} className="text-[#E4572E]" />
          <h3 className="text-sm font-bold">{item.title}</h3>
        </div>
        <button onClick={copy} className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#0D4F44] px-3 py-1.5 text-xs font-semibold text-white">
          {copied ? <Check size={13} /> : <Copy size={13} />}{copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#263B34]">{item.text}</p>
      {item.id === "poster" && (
        <button onClick={() => onUsePoster(item.text)} className="mt-3 rounded-lg border border-[#0D4F44] px-3 py-2 text-xs font-semibold text-[#0D4F44]">
          Open in Poster Maker
        </button>
      )}
    </article>
  );
}

export default function ContentPack() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(() => ({ ...DEFAULT_PROFILE, ...readStorage("flashpromo-content-profile", {}) }));
  const [pack, setPack] = useState([]);
  const [history, setHistory] = useState(() => readStorage("flashpromo-content-history-v2", []));
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try { localStorage.setItem("flashpromo-content-profile", JSON.stringify(profile)); } catch {}
  }, [profile]);

  useEffect(() => {
    try { localStorage.setItem("flashpromo-content-history-v2", JSON.stringify(history.slice(0, 10))); } catch {}
  }, [history]);

  const update = (key, value) => setProfile((current) => ({ ...current, [key]: value }));
  const generate = () => {
    const next = buildPack(profile);
    setPack(next);
    setHistory((items) => [{ id: Date.now(), createdAt: new Date().toLocaleString(), profile: { ...profile }, pack: next }, ...items].slice(0, 10));
    setNotice("Content pack created. These are template-based drafts; check all offer details before publishing.");
  };
  const usePoster = (text) => {
    const lines = text.split("\n").filter(Boolean);
    localStorage.setItem("flashpromo-poster-prefill", JSON.stringify({
      businessName: profile.businessName,
      headline: lines[0] || profile.offer || "Special Offer",
      subheadline: lines[1] || profile.product,
      ctaText: lines[lines.length - 1] || "Visit Today",
      address: profile.locality,
    }));
    navigate("/poster-maker");
  };
  const restore = (item) => {
    setProfile({ ...DEFAULT_PROFILE, ...item.profile });
    setPack(item.pack || []);
    setNotice("Previous content pack loaded.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-[#FBF1E1] text-[#12312B]">
      <header className="bg-gradient-to-r from-[#0D4F44] to-[#082B25] px-4 py-4 text-white sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-white/85 hover:text-white"><ArrowLeft size={16} /> Dashboard</Link>
          <div className="text-right"><p className="text-xs uppercase tracking-[0.2em] text-white/65">FlashPromo · Beta</p><h1 className="mt-1 flex items-center justify-end gap-2 text-lg font-bold sm:text-xl"><Sparkles size={18} className="text-[#E8B44E]" /> Content Pack</h1></div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[340px_1fr] sm:px-8">
        <section className="h-fit rounded-2xl border border-[#E4D9C4] bg-white p-5 shadow-sm">
          <div className="mb-4"><h2 className="text-base font-bold">Business & offer</h2><p className="mt-1 text-xs leading-relaxed text-[#5C6B65]">Enter the promotion once and create a ready-to-edit content pack.</p></div>
          <div className="space-y-3">
            <Field label="Business name"><input value={profile.businessName} onChange={(e) => update("businessName", e.target.value)} className={inputClass} placeholder="Your cafe name" /></Field>
            <Field label="Business type"><select value={profile.businessType} onChange={(e) => update("businessType", e.target.value)} className={inputClass}>{BUSINESS_TYPES.map((type) => <option key={type}>{type}</option>)}</select></Field>
            <Field label="Product / service"><input value={profile.product} onChange={(e) => update("product", e.target.value)} className={inputClass} placeholder="e.g. Cold coffee" /></Field>
            <div className="grid grid-cols-2 gap-2"><Field label="Price"><input value={profile.price} onChange={(e) => update("price", e.target.value)} className={inputClass} placeholder="₹149" /></Field><Field label="Offer"><input value={profile.offer} onChange={(e) => update("offer", e.target.value)} className={inputClass} placeholder="e.g. 20% off" /></Field></div>
            <Field label="Location"><input value={profile.locality} onChange={(e) => update("locality", e.target.value)} className={inputClass} placeholder="Kakkanad, Kochi" /></Field>
            <Field label="Language"><select value={profile.language} onChange={(e) => update("language", e.target.value)} className={inputClass}><option>English</option><option>Malayalam</option><option>Manglish</option></select></Field>
            <Field label="Brand tone"><select value={profile.tone} onChange={(e) => update("tone", e.target.value)} className={inputClass}><option>Friendly and premium</option><option>Playful and trendy</option><option>Simple and trustworthy</option><option>Urgent promotional</option></select></Field>
            <button onClick={generate} disabled={!profile.businessName.trim()} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E4572E] px-4 py-3 text-sm font-bold text-white disabled:opacity-50"><Wand2 size={16} /> Generate content pack</button>
            <p className="text-[11px] leading-relaxed text-[#6B756F]">Beta note: this version uses built-in templates, not a live AI service. Real AI generation will be connected after this workflow is tested.</p>
          </div>
        </section>

        <section className="min-w-0 space-y-4">
          {notice && <div className="rounded-xl border border-[#C7DCCF] bg-[#EAF5ED] p-3 text-xs leading-relaxed text-[#20543D]">{notice}</div>}
          {pack.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#CBBFA9] bg-white/70 px-6 py-16 text-center"><Sparkles size={28} className="mx-auto mb-3 text-[#D89A2C]" /><h2 className="text-lg font-bold">Your content pack will appear here</h2><p className="mx-auto mt-2 max-w-md text-sm text-[#5C6B65]">Generate five useful assets from one product or offer: an Instagram caption, poster copy, Reel script, WhatsApp Status and hashtags.</p></div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-lg font-bold">Your content pack</h2><p className="text-xs text-[#5C6B65]">{profile.businessName} · {profile.language} · 5 assets</p></div><button onClick={generate} className="inline-flex items-center gap-2 rounded-full border border-[#0D4F44] px-3 py-2 text-xs font-semibold text-[#0D4F44]"><RotateCcw size={13} /> Regenerate</button></div>
              <div className="grid gap-3 xl:grid-cols-2">{pack.map((item) => <ContentCard key={item.id} item={item} onUsePoster={usePoster} />)}</div>
            </>
          )}

          <section className="rounded-2xl border border-[#E4D9C4] bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-2"><h2 className="flex items-center gap-2 text-sm font-bold"><History size={16} /> Recent packs</h2><button onClick={() => setHistory([])} className="text-xs font-semibold text-[#E4572E]">Clear</button></div>
            {history.length === 0 ? <p className="text-xs text-[#6B756F]">Generated packs will be saved on this device.</p> : <div className="space-y-2">{history.slice(0, 5).map((item) => <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl bg-[#FBF1E1] p-3"><div className="min-w-0"><p className="truncate text-xs font-semibold">{item.profile?.businessName || "Business"} · {item.profile?.offer || item.profile?.product}</p><p className="mt-1 text-[10px] text-[#6B756F]">{item.createdAt}</p></div><button onClick={() => restore(item)} className="shrink-0 rounded-full bg-[#0D4F44] px-3 py-1.5 text-xs font-semibold text-white">Load</button></div>)}</div>}
          </section>
          <p className="text-center text-[11px] text-[#6B756F]">Your profile and recent packs are stored locally in this browser. They are not synced across devices yet.</p>
        </section>
      </div>
    </main>
  );
}

const inputClass = "mt-1 w-full rounded-xl border border-[#E4D9C4] bg-white px-3 py-2.5 text-sm text-[#12312B] outline-none focus:border-[#0D4F44] focus:ring-2 focus:ring-[#0D4F44]/10";
function Field({ label, children }) {
  return <label className="block text-xs font-semibold text-[#52635C]">{label}{children}</label>;
}
