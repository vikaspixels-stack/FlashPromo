import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { toPng } from "html-to-image";
import { saveAs } from "file-saver";
import {
  ArrowLeft, Upload, Image as ImageIcon, Download, Wand2, Loader2,
  Check, X, Palette,
} from "lucide-react";
import PosterCanvas from "../components/PosterCanvas.jsx";
import { POSTER_SIZES, POSTER_TEMPLATES, FONT_OPTIONS, generatePosterCopy } from "../data/posterTemplates.js";

const initialTemplate = POSTER_TEMPLATES[0];

export default function PosterMaker() {
  const [sizeId, setSizeId] = useState(POSTER_SIZES[0].id);
  const [templateId, setTemplateId] = useState(initialTemplate.id);

  const [form, setForm] = useState({
    businessName: "Your Business Name",
    headline: initialTemplate.defaults.headline,
    subheadline: initialTemplate.defaults.subheadline,
    ctaText: initialTemplate.defaults.cta,
    phone: "+91 98765 43210",
    address: "Address",
    brandColor: initialTemplate.color,
    font: initialTemplate.font,
    logo: null,
    posterImage: null,
  });

  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const posterRef = useRef(null);
  const previewWrapRef = useRef(null);
  const logoInputRef = useRef(null);
  const photoInputRef = useRef(null);

  const [scale, setScale] = useState(0.3);

  const sizeConfig = useMemo(() => POSTER_SIZES.find((s) => s.id === sizeId) || POSTER_SIZES[0], [sizeId]);
  const template = useMemo(() => POSTER_TEMPLATES.find((t) => t.id === templateId) || POSTER_TEMPLATES[0], [templateId]);
  const fontClassName = useMemo(
    () => FONT_OPTIONS.find((f) => f.id === form.font)?.className || "font-body",
    [form.font]
  );

  // recompute preview scale so the fixed-resolution poster fits the visible panel
  useEffect(() => {
    const el = previewWrapRef.current;
    if (!el) return;
    const compute = () => {
      const availableWidth = el.clientWidth - 32;
      const availableHeight = el.clientHeight - 32;
      const s = Math.min(availableWidth / sizeConfig.width, availableHeight / sizeConfig.height, 1);
      setScale(s > 0 ? s : 0.2);
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [sizeConfig]);

  const updateField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleTemplateSelect = (tpl) => {
    setTemplateId(tpl.id);
    setForm((f) => ({
      ...f,
      brandColor: tpl.color,
      font: tpl.font,
      headline: f.headline || tpl.defaults.headline,
      subheadline: f.subheadline || tpl.defaults.subheadline,
      ctaText: f.ctaText || tpl.defaults.cta,
    }));
  };

  const handleFileToDataUrl = (e, key) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateField(key, reader.result);
    reader.readAsDataURL(file);
  };

  const handleGenerateCopy = async () => {
    setGenerating(true);
    try {
      const copy = await generatePosterCopy({
        template: templateId,
        businessName: form.businessName,
        offerText: form.headline,
      });
      setForm((f) => ({ ...f, headline: copy.headline, subheadline: copy.subheadline, ctaText: copy.cta }));
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = useCallback(async () => {
    if (!posterRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(posterRef.current, {
        width: sizeConfig.width,
        height: sizeConfig.height,
        pixelRatio: 1,
        cacheBust: true,
      });
      const blob = await (await fetch(dataUrl)).blob();
      const filename = `${(form.businessName || "poster").trim().replace(/\s+/g, "-").toLowerCase()}-${sizeId}.png`;
      saveAs(blob, filename);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 1800);
    } catch (err) {
      console.error("Poster export failed:", err);
    } finally {
      setDownloading(false);
    }
  }, [sizeConfig, sizeId, form.businessName]);

  return (
    <div className="min-h-screen w-full bg-[#0A1F1A] text-white">
      {/* top bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 py-3 bg-[#0D4F44] shadow-md">
        <Link to="/" className="flex items-center gap-1.5 text-sm font-semibold text-white/90 hover:text-white">
          <ArrowLeft size={16} />
          Dashboard
        </Link>
        <p className="font-display font-bold text-sm sm:text-base flex items-center gap-1.5">
          <ImageIcon size={16} className="text-[#E8B44E]" />
          Poster Maker
        </p>
        <div className="w-20" />
      </div>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-52px)]">
        {/* ---------------- Left panel: form ---------------- */}
        <div className="w-full lg:w-[420px] lg:shrink-0 border-b lg:border-b-0 lg:border-r border-white/10 bg-[#0B241E] p-4 sm:p-6 space-y-5 overflow-y-auto">
          {/* size selector */}
          <div>
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-2">Poster Size</p>
            <div className="grid grid-cols-3 gap-2">
              {POSTER_SIZES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSizeId(s.id)}
                  className={`rounded-xl border px-2 py-2 text-[11px] font-semibold text-center transition-all ${
                    sizeId === s.id
                      ? "bg-[#E4572E] border-[#E4572E] text-white"
                      : "bg-white/5 border-white/10 text-white/70"
                  }`}
                >
                  {s.label}
                  <div className="text-[10px] font-normal opacity-70 mt-0.5">{s.width}×{s.height}</div>
                </button>
              ))}
            </div>
          </div>

          {/* template selector */}
          <div>
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-2">Starter Template</p>
            <div className="grid grid-cols-2 gap-2">
              {POSTER_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => handleTemplateSelect(tpl)}
                  className={`rounded-xl border p-2.5 text-left transition-all ${
                    templateId === tpl.id ? "border-[#E4572E] bg-white/10" : "border-white/10 bg-white/5"
                  }`}
                >
                  <div className="w-full h-8 rounded-md mb-2" style={{ background: tpl.color }} />
                  <p className="text-xs font-semibold leading-tight">{tpl.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* AI copy */}
          <button
            onClick={handleGenerateCopy}
            disabled={generating}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold bg-[#E8B44E] text-[#12312B] disabled:opacity-60 active:scale-[0.98] transition-transform"
          >
            {generating ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
            {generating ? "Writing copy..." : "Generate AI Copy"}
          </button>

          {/* form fields */}
          <div className="space-y-3">
            <Field label="Business Name">
              <input
                value={form.businessName}
                onChange={(e) => updateField("businessName", e.target.value)}
                className={inputCls}
                placeholder="e.g. Kochi Brews Cafe"
              />
            </Field>

            <Field label="Headline / Offer Text">
              <input
                value={form.headline}
                onChange={(e) => updateField("headline", e.target.value)}
                className={inputCls}
                placeholder="e.g. Buy 1 Get 1 Free"
              />
            </Field>

            <Field label="Subtitle">
              <input
                value={form.subheadline}
                onChange={(e) => updateField("subheadline", e.target.value)}
                className={inputCls}
                placeholder="Supporting line under the headline"
              />
            </Field>

            <div className="grid grid-cols-2 gap-2">
              <Field label="Phone Number">
                <input
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className={inputCls}
                  placeholder="+91 98765 43210"
                />
              </Field>
              <Field label="CTA Button Text">
                <input
                  value={form.ctaText}
                  onChange={(e) => updateField("ctaText", e.target.value)}
                  className={inputCls}
                  placeholder="Order Now"
                />
              </Field>
            </div>

            <Field label="Address">
              <input
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                className={inputCls}
                placeholder="Panampilly Nagar, Kochi"
              />
            </Field>

            <div className="grid grid-cols-2 gap-2">
              <Field label="Brand Color">
                <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-2 py-1.5">
                  <Palette size={14} className="text-white/50 shrink-0" />
                  <input
                    type="color"
                    value={form.brandColor}
                    onChange={(e) => updateField("brandColor", e.target.value)}
                    className="w-7 h-7 rounded-md bg-transparent border-none cursor-pointer"
                  />
                  <span className="text-xs text-white/70">{form.brandColor}</span>
                </div>
              </Field>
              <Field label="Font">
                <select
                  value={form.font}
                  onChange={(e) => updateField("font", e.target.value)}
                  className={inputCls}
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          {/* uploads */}
          <div className="grid grid-cols-2 gap-2">
            <UploadBox
              label="Logo"
              value={form.logo}
              onPick={() => logoInputRef.current?.click()}
              onClear={() => updateField("logo", null)}
            />
            <UploadBox
              label="Poster Photo"
              value={form.posterImage}
              onPick={() => photoInputRef.current?.click()}
              onClear={() => updateField("posterImage", null)}
            />
          </div>
          <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileToDataUrl(e, "logo")} />
          <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileToDataUrl(e, "posterImage")} />

          {/* download */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all active:scale-[0.98] disabled:opacity-60 ${
              downloaded ? "bg-emerald-500" : "bg-[#0D4F44]"
            }`}
          >
            {downloading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : downloaded ? (
              <Check size={16} />
            ) : (
              <Download size={16} />
            )}
            {downloading ? "Preparing PNG..." : downloaded ? "Downloaded!" : "Download"}
          </button>
        </div>

        {/* ---------------- Right panel: live preview ---------------- */}
        <div ref={previewWrapRef} className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-[#081915] overflow-auto">
          <div style={{ width: sizeConfig.width * scale, height: sizeConfig.height * scale }} className="shadow-2xl rounded-lg overflow-hidden">
            <div style={{ width: sizeConfig.width, height: sizeConfig.height, transform: `scale(${scale})`, transformOrigin: "top left" }}>
              <PosterCanvas ref={posterRef} sizeConfig={sizeConfig} template={template} form={form} fontClassName={fontClassName} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-[#E4572E]/50";

function Field({ label, children }) {
  return (
    <div>
      <label className="text-[11px] font-medium text-white/60">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function UploadBox({ label, value, onPick, onClear }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-white/60 mb-1">{label}</p>
      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-white/15 h-20">
          <img src={value} alt={label} className="w-full h-full object-cover" />
          <button
            onClick={onClear}
            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center"
            aria-label={`Remove ${label}`}
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <button
          onClick={onPick}
          className="w-full h-20 rounded-xl border border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center gap-1 text-white/50 hover:text-white/80 hover:border-white/40 transition-colors"
        >
          <Upload size={16} />
          <span className="text-[11px]">Upload</span>
        </button>
      )}
    </div>
  );
}
