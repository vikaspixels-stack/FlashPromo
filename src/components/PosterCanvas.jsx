import React, { forwardRef } from "react";
import { Phone, MapPin, UtensilsCrossed, Sparkles } from "lucide-react";

const DIAMONDS = Array.from({ length: 14 });

const PosterCanvas = forwardRef(function PosterCanvas(
  { sizeConfig, template, form, fontClassName },
  ref
) {
  const { width, height } = sizeConfig;
  const brandColor = form.brandColor || template.color;

  const backgroundStyle = form.posterImage
    ? { backgroundImage: `url(${form.posterImage})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { background: `linear-gradient(150deg, ${brandColor} 0%, rgba(10,10,14,0.94) 115%)` };

  return (
    <div
      ref={ref}
      style={{ width, height, ...backgroundStyle }}
      className={`relative overflow-hidden text-white ${fontClassName}`}
    >
      {/* dark overlay so text stays legible over any photo */}
      {form.posterImage && (
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 30%, rgba(0,0,0,0.85) 100%)",
          }}
        />
      )}

      {/* ---------- template decorations ---------- */}
      {template.kind === "clinic" && (
        <div className="absolute -top-10 -right-10 w-56 h-56 opacity-10">
          <div className="absolute top-1/2 left-0 w-full h-10 -translate-y-1/2 bg-white rounded-full" />
          <div className="absolute left-1/2 top-0 h-full w-10 -translate-x-1/2 bg-white rounded-full" />
        </div>
      )}

      {template.kind === "retail" && (
        <div
          className="absolute -left-16 top-10 w-56 text-center py-2 font-display font-extrabold text-sm tracking-widest uppercase shadow-lg"
          style={{ background: "#111", transform: "rotate(-40deg)" }}
        >
          Sale
        </div>
      )}

      {template.kind === "event" && (
        <>
          <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full bg-white/10" />
          <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-white/5" />
        </>
      )}

      {template.kind === "salon" && (
        <div className="absolute inset-4 border-2 rounded-[1.75rem]" style={{ borderColor: "rgba(255,255,255,0.35)" }} />
      )}

      {template.kind === "festival" && (
        <>
          <div className="absolute top-4 left-0 right-0 flex justify-between px-4">
            {DIAMONDS.map((_, i) => (
              <div key={`t-${i}`} className="w-2.5 h-2.5 rotate-45" style={{ background: "#E8B44E" }} />
            ))}
          </div>
          <div className="absolute bottom-4 left-0 right-0 flex justify-between px-4">
            {DIAMONDS.map((_, i) => (
              <div key={`b-${i}`} className="w-2.5 h-2.5 rotate-45" style={{ background: "#E8B44E" }} />
            ))}
          </div>
        </>
      )}

      {/* ---------- logo + business name ---------- */}
      <div className="absolute top-8 left-8 flex items-center gap-3 z-10">
        {form.logo ? (
          <img src={form.logo} alt="logo" className="w-14 h-14 rounded-xl object-cover border-2 border-white/40" />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-white/20 border-2 border-white/30 flex items-center justify-center font-display font-bold text-xl">
            {(form.businessName || "K").trim().charAt(0).toUpperCase()}
          </div>
        )}
        <p className="font-display font-semibold text-lg drop-shadow">{form.businessName || "Your Business"}</p>
      </div>

      {/* ---------- main content block ---------- */}
      <div className="absolute inset-x-8 bottom-8 z-10 space-y-4">
        {template.kind === "event" && (
          <span className="inline-block rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest">
            Event
          </span>
        )}

        <h1 className="font-display font-extrabold leading-[1.05] drop-shadow-lg" style={{ fontSize: Math.round(width * 0.072) }}>
          {form.headline || "Your Headline Here"}
        </h1>

        {form.subheadline && (
          <p className="font-body text-white/90 drop-shadow" style={{ fontSize: Math.round(width * 0.03) }}>
            {form.subheadline}
          </p>
        )}

        <div className="flex items-center gap-3 pt-1 flex-wrap">
          {form.ctaText && (
            <span
              className="inline-flex items-center gap-2 rounded-full font-display font-bold shadow-lg"
              style={{
                background: template.kind === "clinic" || template.kind === "salon" ? "#FFFFFF" : brandColor,
                color: template.kind === "clinic" || template.kind === "salon" ? brandColor : "#FFFFFF",
                padding: `${Math.round(width * 0.018)}px ${Math.round(width * 0.032)}px`,
                fontSize: Math.round(width * 0.026),
              }}
            >
              {template.kind === "restaurant" && <UtensilsCrossed size={Math.round(width * 0.026)} />}
              {form.ctaText}
            </span>
          )}
        </div>

        {(form.phone || form.address) && (
          <div className="pt-2 flex flex-col gap-1 text-white/85" style={{ fontSize: Math.round(width * 0.021) }}>
            {form.phone && (
              <div className="flex items-center gap-2">
                <Phone size={Math.round(width * 0.021)} />
                {form.phone}
              </div>
            )}
            {form.address && (
              <div className="flex items-center gap-2">
                <MapPin size={Math.round(width * 0.021)} />
                {form.address}
              </div>
            )}
          </div>
        )}
      </div>

      {/* watermark */}
      <div className="absolute bottom-3 right-4 z-10 flex items-center gap-1 text-white/40" style={{ fontSize: Math.round(width * 0.014) }}>
        <Sparkles size={Math.round(width * 0.016)} />
        Made with Kochi Spark
      </div>
    </div>
  );
});

export default PosterCanvas;
