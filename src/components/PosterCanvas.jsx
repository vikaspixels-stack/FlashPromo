import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Canvas, Textbox, FabricImage, Rect, Circle, Gradient } from "fabric";

const FONT_FAMILY_MAP = {
  poppins: "Poppins",
  inter: "Inter",
  malayalam: "'Noto Sans Malayalam'",
};

const TEXT_DEFAULTS = {
  fill: "#FFFFFF",
  editable: true,
  hasControls: true,
  cursorColor: "#FFFFFF",
  selectionColor: "rgba(228,87,46,0.35)",
  borderColor: "#E4572E",
  cornerColor: "#E4572E",
  cornerStyle: "circle",
  transparentCorners: false,
  cornerSize: 10,
  padding: 6,
  splitByGrapheme: true,
};

/**
 * PosterCanvas renders the poster onto an HTML5 canvas via Fabric.js.
 * Every text element (business name, headline, subheadline, CTA, phone,
 * address) is a Fabric Textbox: draggable anywhere on the poster, and
 * directly editable in place via double-click.
 *
 * Structural changes (size, template, brand color, font, uploaded photo)
 * trigger a full rebuild. Pure text-content changes (typed in the side
 * form) only update the existing objects' text, so any manual dragging
 * the user has done is preserved while they keep editing copy.
 */
const PosterCanvas = forwardRef(function PosterCanvas(
  { sizeConfig, template, form, onTextEdit },
  ref
) {
  const canvasElRef = useRef(null);
  const fabricRef = useRef(null);
  const objsRef = useRef({});
  const onTextEditRef = useRef(onTextEdit);
  onTextEditRef.current = onTextEdit;

  useImperativeHandle(ref, () => ({
    exportDataURL: () => {
      const c = fabricRef.current;
      if (!c) return null;
      c.discardActiveObject();
      c.requestRenderAll();
      return c.toDataURL({ format: "png", multiplier: 1 });
    },
    deselectAll: () => {
      const c = fabricRef.current;
      if (!c) return;
      c.discardActiveObject();
      c.requestRenderAll();
    },
  }));

  // ---- full structural rebuild ----
  useEffect(() => {
    let cancelled = false;
    const { width, height } = sizeConfig;
    const brandColor = form.brandColor || template.color;
    const fontFamily = FONT_FAMILY_MAP[form.font] || "Inter";

    const canvas = new Canvas(canvasElRef.current, {
      width,
      height,
      selection: true,
      preserveObjectStacking: true,
    });
    fabricRef.current = canvas;

    canvas.on("text:changed", ({ target }) => {
      const key = target?.fieldKey;
      if (key && onTextEditRef.current) onTextEditRef.current(key, target.text);
    });

    (async () => {
      // ---------- background ----------
      if (form.posterImage) {
        try {
          const img = await FabricImage.fromURL(form.posterImage, { crossOrigin: "anonymous" });
          if (cancelled) return;
          const scale = Math.max(width / img.width, height / img.height);
          img.set({
            left: width / 2,
            top: height / 2,
            originX: "center",
            originY: "center",
            scaleX: scale,
            scaleY: scale,
            selectable: false,
            evented: false,
          });
          canvas.add(img);
        } catch (e) {
          // fall through to gradient below if the photo fails to load
        }
        const overlay = new Rect({
          left: 0,
          top: 0,
          width,
          height,
          selectable: false,
          evented: false,
          fill: new Gradient({
            type: "linear",
            coords: { x1: 0, y1: height * 0.32, x2: 0, y2: height },
            colorStops: [
              { offset: 0, color: "rgba(6,20,17,0)" },
              { offset: 1, color: "rgba(6,20,17,0.92)" },
            ],
          }),
        });
        canvas.add(overlay);
      } else {
        const bg = new Rect({
          left: 0,
          top: 0,
          width,
          height,
          selectable: false,
          evented: false,
          fill: new Gradient({
            type: "linear",
            coords: { x1: 0, y1: 0, x2: width, y2: height },
            colorStops: [
              { offset: 0, color: brandColor },
              { offset: 1, color: "rgba(10,10,14,0.94)" },
            ],
          }),
        });
        canvas.add(bg);
      }
      if (cancelled) return;

      // ---------- template decorations (non-interactive) ----------
      const common = { selectable: false, evented: false };
      if (template.kind === "clinic") {
        canvas.add(new Rect({ ...common, left: width - 220, top: 40, width: 180, height: 36, fill: "#fff", opacity: 0.1, rx: 18, ry: 18 }));
        canvas.add(new Rect({ ...common, left: width - 158, top: -20, width: 36, height: 180, fill: "#fff", opacity: 0.1, rx: 18, ry: 18 }));
      }
      if (template.kind === "retail") {
        const ribbon = new Rect({ ...common, left: -80, top: 70, width: 260, height: 46, fill: "#111", angle: -35 });
        const ribbonText = new Textbox("SALE", {
          ...common,
          left: -40,
          top: 78,
          width: 200,
          fontFamily,
          fontWeight: "800",
          fontSize: Math.round(width * 0.026),
          fill: "#fff",
          textAlign: "center",
          angle: -35,
          charSpacing: 200,
        });
        canvas.add(ribbon, ribbonText);
      }
      if (template.kind === "event") {
        canvas.add(new Circle({ ...common, left: -60, top: height - 120, radius: 128, fill: "#fff", opacity: 0.1 }));
        canvas.add(new Circle({ ...common, left: width - 140, top: -140, radius: 144, fill: "#fff", opacity: 0.05 }));
      }
      if (template.kind === "salon") {
        canvas.add(new Rect({ ...common, left: 16, top: 16, width: width - 32, height: height - 32, fill: "transparent", stroke: "rgba(255,255,255,0.35)", strokeWidth: 2, rx: 28, ry: 28 }));
      }
      if (template.kind === "festival") {
        const gap = width / 14;
        for (let i = 0; i < 14; i++) {
          canvas.add(new Rect({ ...common, left: gap * i + gap / 2, top: 24, width: 10, height: 10, fill: "#E8B44E", angle: 45 }));
          canvas.add(new Rect({ ...common, left: gap * i + gap / 2, top: height - 34, width: 10, height: 10, fill: "#E8B44E", angle: 45 }));
        }
      }
      if (cancelled) return;

      // ---------- logo / avatar ----------
      if (form.logo) {
        try {
          const logoImg = await FabricImage.fromURL(form.logo, { crossOrigin: "anonymous" });
          if (cancelled) return;
          const logoSize = 64;
          const scale = logoSize / Math.max(logoImg.width, logoImg.height);
          logoImg.set({
            left: 32,
            top: 32,
            scaleX: scale,
            scaleY: scale,
            hasControls: true,
            fieldKey: "logo",
          });
          canvas.add(logoImg);
        } catch (e) {
          // ignore broken logo upload
        }
      } else {
        const avatar = new Rect({ left: 32, top: 32, width: 64, height: 64, rx: 16, ry: 16, fill: "rgba(255,255,255,0.2)", stroke: "rgba(255,255,255,0.3)", strokeWidth: 2, selectable: false, evented: false });
        const initial = new Textbox((form.businessName || "K").trim().charAt(0).toUpperCase(), {
          left: 32,
          top: 32,
          width: 64,
          height: 64,
          fontFamily,
          fontWeight: "700",
          fontSize: 26,
          fill: "#fff",
          textAlign: "center",
          selectable: false,
          evented: false,
          editable: false,
        });
        canvas.add(avatar, initial);
      }
      if (cancelled) return;

      // ---------- default vertical layout (all fully draggable afterwards) ----------
      const padX = 48;
      const headFontSize = Math.max(30, Math.round(width * 0.072));
      const subFontSize = Math.max(18, Math.round(width * 0.03));
      const ctaFontSize = Math.max(16, Math.round(width * 0.026));
      const contactFontSize = Math.max(14, Math.round(width * 0.021));

      const contactLines = (form.phone ? 1 : 0) + (form.address ? 1 : 0);
      const contactBlockH = contactLines * contactFontSize * 1.5;
      const ctaBlockH = form.ctaText ? ctaFontSize * 2.2 : 0;
      const subBlockH = form.subheadline ? subFontSize * 1.3 * 2 : 0;
      const headBlockH = headFontSize * 1.2 * 2;
      const gap = 18;

      let cursorBottom = height - 48;
      let contactTop = null, ctaTop = null, subTop = null;

      if (contactLines) {
        contactTop = cursorBottom - contactBlockH;
        cursorBottom = contactTop - gap;
      }
      if (form.ctaText) {
        ctaTop = cursorBottom - ctaBlockH;
        cursorBottom = ctaTop - gap;
      }
      if (form.subheadline) {
        subTop = cursorBottom - subBlockH;
        cursorBottom = subTop - gap;
      }
      const headTop = Math.max(120, cursorBottom - headBlockH);

      // business name
      const businessNameBox = new Textbox(form.businessName || "Your Business", {
        ...TEXT_DEFAULTS,
        left: 112,
        top: 48,
        width: width - 160,
        fontFamily,
        fontWeight: "600",
        fontSize: Math.max(18, Math.round(width * 0.026)),
        fieldKey: "businessName",
      });
      canvas.add(businessNameBox);
      objsRef.current.businessName = businessNameBox;

      // headline
      const headlineBox = new Textbox(form.headline || "Your Headline Here", {
        ...TEXT_DEFAULTS,
        left: padX,
        top: headTop,
        width: width - padX * 2,
        fontFamily,
        fontWeight: "800",
        fontSize: headFontSize,
        lineHeight: 1.08,
        fieldKey: "headline",
      });
      canvas.add(headlineBox);
      objsRef.current.headline = headlineBox;

      // subheadline
      if (form.subheadline) {
        const subBox = new Textbox(form.subheadline, {
          ...TEXT_DEFAULTS,
          left: padX,
          top: subTop,
          width: width - padX * 2,
          fontFamily,
          fontWeight: "400",
          fontSize: subFontSize,
          fill: "rgba(255,255,255,0.9)",
          fieldKey: "subheadline",
        });
        canvas.add(subBox);
        objsRef.current.subheadline = subBox;
      } else {
        objsRef.current.subheadline = null;
      }

      // CTA
      if (form.ctaText) {
        const ctaBox = new Textbox(form.ctaText, {
          ...TEXT_DEFAULTS,
          left: padX,
          top: ctaTop,
          width: width - padX * 2,
          fontFamily,
          fontWeight: "700",
          fontSize: ctaFontSize,
          fill: template.kind === "clinic" || template.kind === "salon" ? brandColor : "#FFFFFF",
          backgroundColor: template.kind === "clinic" || template.kind === "salon" ? "#FFFFFF" : brandColor,
          fieldKey: "ctaText",
        });
        canvas.add(ctaBox);
        objsRef.current.ctaText = ctaBox;
      } else {
        objsRef.current.ctaText = null;
      }

      // phone / address
      if (form.phone) {
        const phoneBox = new Textbox(form.phone, {
          ...TEXT_DEFAULTS,
          left: padX,
          top: contactTop,
          width: width - padX * 2,
          fontFamily,
          fontWeight: "500",
          fontSize: contactFontSize,
          fill: "rgba(255,255,255,0.85)",
          fieldKey: "phone",
        });
        canvas.add(phoneBox);
        objsRef.current.phone = phoneBox;
      } else {
        objsRef.current.phone = null;
      }

      if (form.address) {
        const addressBox = new Textbox(form.address, {
          ...TEXT_DEFAULTS,
          left: padX,
          top: (contactTop || cursorBottom) + (form.phone ? contactFontSize * 1.5 : 0),
          width: width - padX * 2,
          fontFamily,
          fontWeight: "500",
          fontSize: contactFontSize,
          fill: "rgba(255,255,255,0.85)",
          fieldKey: "address",
        });
        canvas.add(addressBox);
        objsRef.current.address = addressBox;
      } else {
        objsRef.current.address = null;
      }

      // watermark (fixed, not draggable/editable)
      const watermark = new Textbox("Made with Kochi Spark", {
        left: width - 260,
        top: height - 34,
        width: 250,
        fontFamily,
        fontSize: Math.max(11, Math.round(width * 0.014)),
        fill: "rgba(255,255,255,0.45)",
        textAlign: "right",
        selectable: false,
        evented: false,
        editable: false,
      });
      canvas.add(watermark);

      canvas.requestRenderAll();
    })();

    return () => {
      cancelled = true;
      canvas.dispose();
      fabricRef.current = null;
      objsRef.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sizeConfig.width, sizeConfig.height, template.id, form.posterImage, form.logo, form.brandColor, form.font]);

  // ---- lightweight text-content sync (preserves drag positions) ----
  useEffect(() => {
    const objs = objsRef.current;
    const canvas = fabricRef.current;
    if (!canvas) return;
    if (objs.businessName && objs.businessName.text !== (form.businessName || "Your Business")) {
      objs.businessName.set("text", form.businessName || "Your Business");
    }
    if (objs.headline && objs.headline.text !== (form.headline || "Your Headline Here")) {
      objs.headline.set("text", form.headline || "Your Headline Here");
    }
    if (objs.subheadline && form.subheadline && objs.subheadline.text !== form.subheadline) {
      objs.subheadline.set("text", form.subheadline);
    }
    if (objs.ctaText && form.ctaText && objs.ctaText.text !== form.ctaText) {
      objs.ctaText.set("text", form.ctaText);
    }
    if (objs.phone && form.phone && objs.phone.text !== form.phone) {
      objs.phone.set("text", form.phone);
    }
    if (objs.address && form.address && objs.address.text !== form.address) {
      objs.address.set("text", form.address);
    }
    canvas.requestRenderAll();
  }, [form.businessName, form.headline, form.subheadline, form.ctaText, form.phone, form.address]);

  return <canvas ref={canvasElRef} />;
});

export default PosterCanvas;
