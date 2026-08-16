import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Canvas, Textbox, FabricImage, Rect, Circle, Gradient } from "fabric";

const FONT_FAMILY_MAP = {
  poppins: "Poppins",
  inter: "Inter",
  malayalam: "'Noto Sans Malayalam'",
};

// on-screen (CSS px) target sizes for selection handles, independent of zoom
const BASE_CORNER_SIZE = 14;
const BASE_TOUCH_CORNER_SIZE = 24;

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
  padding: 6,
  splitByGrapheme: true,
};

function clampObjectWithinCanvas(obj, canvasWidth, canvasHeight) {
  obj.setCoords();
  const rect = obj.getBoundingRect(true, true);
  let dx = 0;
  let dy = 0;
  if (rect.left < 0) dx = -rect.left;
  else if (rect.left + rect.width > canvasWidth) dx = canvasWidth - (rect.left + rect.width);
  if (rect.top < 0) dy = -rect.top;
  else if (rect.top + rect.height > canvasHeight) dy = canvasHeight - (rect.top + rect.height);
  if (dx !== 0) obj.left += dx;
  if (dy !== 0) obj.top += dy;
  obj.setCoords();
}

/**
 * PosterCanvas — a single Fabric.js <canvas> that is the ONE source of
 * truth for every poster element (no parallel HTML text layers).
 *
 * All object positions/sizes are defined in LOGICAL poster coordinates
 * (1080x1080 / 1080x1920 / 1200x630 — matching the real export resolution).
 * The canvas is made responsive purely via Fabric's own setDimensions +
 * setZoom, so logical coordinates never change with screen size — only
 * the on-screen pixel size of the canvas element does. Pointer/touch
 * coordinates map back to logical space automatically through Fabric's
 * zoom-aware event handling.
 */
const PosterCanvas = forwardRef(function PosterCanvas(
  { sizeConfig, template, form, onTextEdit },
  ref
) {
  const wrapRef = useRef(null);
  const canvasElRef = useRef(null);
  const fabricRef = useRef(null);
  const objsRef = useRef({});
  const scaleRef = useRef(1);
  const onTextEditRef = useRef(onTextEdit);
  onTextEditRef.current = onTextEdit;
  const sizeConfigRef = useRef(sizeConfig);
  sizeConfigRef.current = sizeConfig;
  const applySizeRef = useRef(() => {});

  useImperativeHandle(ref, () => ({
    exportDataURL: () => {
      const c = fabricRef.current;
      if (!c) return null;
      const prevZoom = c.getZoom();
      const prevW = c.getWidth();
      const prevH = c.getHeight();

      c.discardActiveObject();
      c.setZoom(1);
      c.setDimensions({ width: sizeConfig.width, height: sizeConfig.height });
      c.requestRenderAll();

      const dataUrl = c.toDataURL({ format: "png", multiplier: 1 });

      // restore the responsive on-screen view
      c.setZoom(prevZoom);
      c.setDimensions({ width: prevW, height: prevH });
      c.requestRenderAll();

      return dataUrl;
    },
    deselectAll: () => {
      const c = fabricRef.current;
      if (!c) return;
      c.discardActiveObject();
      c.requestRenderAll();
    },
  }));

  // ---- responsive sizing: Fabric zoom/viewport, never CSS transform ----
  // Set up ONCE on mount. Always reads the *latest* logical size via
  // sizeConfigRef, and is also stored in applySizeRef so the structural
  // rebuild effect below can call it synchronously the instant a new
  // canvas is created — it does not rely on ResizeObserver's async first
  // callback to apply the correct initial scale.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const applySize = () => {
      const c = fabricRef.current;
      if (!c) return;
      const { width: logicalWidth, height: logicalHeight } = sizeConfigRef.current;
      const availableWidth = wrap.clientWidth;
      const availableHeight = wrap.clientHeight;
      if (!availableWidth || !availableHeight) return;

      const scale = Math.min(availableWidth / logicalWidth, availableHeight / logicalHeight);
      const safeScale = scale > 0 ? scale : 0.1;
      scaleRef.current = safeScale;

      c.setDimensions({
        width: Math.round(logicalWidth * safeScale),
        height: Math.round(logicalHeight * safeScale),
      });
      c.setZoom(safeScale);

      // keep selection handles a constant, touch-friendly on-screen size regardless of zoom
      const cornerSize = Math.round(BASE_CORNER_SIZE / safeScale);
      const touchCornerSize = Math.round(BASE_TOUCH_CORNER_SIZE / safeScale);
      c.getObjects().forEach((obj) => {
        obj.set({ cornerSize, touchCornerSize });
      });

      c.requestRenderAll();
    };

    applySizeRef.current = applySize;
    applySize();

    const ro = new ResizeObserver(applySize);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  // ---- full structural rebuild (size, template, photo, logo, color, font) ----
  useEffect(() => {
    let cancelled = false;
    const { width, height } = sizeConfig;
    const brandColor = form.brandColor || template.color;
    const fontFamily = FONT_FAMILY_MAP[form.font] || "Inter";
    const baseUnit = Math.min(width, height);

    // create the canvas at its logical resolution; the sizing effect above
    // will immediately shrink the *display* size via setDimensions+setZoom
    const canvas = new Canvas(canvasElRef.current, {
      width,
      height,
      selection: true,
      preserveObjectStacking: true,
    });
    fabricRef.current = canvas;
    applySizeRef.current(); // apply correct on-screen scale immediately — don't wait for ResizeObserver's async first callback

    canvas.on("text:changed", ({ target }) => {
      const key = target?.fieldKey;
      if (key && onTextEditRef.current) onTextEditRef.current(key, target.text);
    });

    canvas.on("object:moving", (e) => {
      clampObjectWithinCanvas(e.target, width, height);
    });
    canvas.on("object:scaling", (e) => {
      const obj = e.target;
      obj.setCoords();
      const rect = obj.getBoundingRect(true, true);
      if (rect.width > width) obj.scaleX *= width / rect.width;
      if (rect.height > height) obj.scaleY *= height / rect.height;
      clampObjectWithinCanvas(obj, width, height);
    });
    canvas.on("object:modified", () => canvas.requestRenderAll());

    const cornerSize = Math.round(BASE_CORNER_SIZE / (scaleRef.current || 1));
    const touchCornerSize = Math.round(BASE_TOUCH_CORNER_SIZE / (scaleRef.current || 1));

    (async () => {
      // ---------- background (fills full logical canvas, aspect preserved) ----------
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
          // fall through to gradient background below
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

      // ---------- template decorations (non-interactive, logical/percentage positions) ----------
      const common = { selectable: false, evented: false };
      if (template.kind === "clinic") {
        canvas.add(new Rect({ ...common, left: width * 0.8, top: height * 0.035, width: width * 0.17, height: height * 0.035, fill: "#fff", opacity: 0.1, rx: height * 0.017, ry: height * 0.017 }));
        canvas.add(new Rect({ ...common, left: width * 0.86, top: -height * 0.02, width: width * 0.03, height: height * 0.17, fill: "#fff", opacity: 0.1, rx: height * 0.017, ry: height * 0.017 }));
      }
      if (template.kind === "retail") {
        const ribbonW = width * 0.24;
        const ribbon = new Rect({ ...common, left: -width * 0.07, top: height * 0.065, width: ribbonW, height: height * 0.043, fill: "#111", angle: -35 });
        const ribbonText = new Textbox("SALE", {
          ...common,
          left: -width * 0.03,
          top: height * 0.072,
          width: ribbonW * 0.8,
          fontFamily,
          fontWeight: "800",
          fontSize: Math.round(baseUnit * 0.026),
          fill: "#fff",
          textAlign: "center",
          angle: -35,
          charSpacing: 200,
        });
        canvas.add(ribbon, ribbonText);
      }
      if (template.kind === "event") {
        canvas.add(new Circle({ ...common, left: -width * 0.06, top: height * 0.9, radius: baseUnit * 0.12, fill: "#fff", opacity: 0.1 }));
        canvas.add(new Circle({ ...common, left: width * 0.87, top: -height * 0.08, radius: baseUnit * 0.13, fill: "#fff", opacity: 0.05 }));
      }
      if (template.kind === "salon") {
        canvas.add(new Rect({ ...common, left: width * 0.015, top: height * 0.015, width: width * 0.97, height: height * 0.97, fill: "transparent", stroke: "rgba(255,255,255,0.35)", strokeWidth: 2, rx: baseUnit * 0.026, ry: baseUnit * 0.026 }));
      }
      if (template.kind === "festival") {
        const count = 14;
        const gapX = width / count;
        const dot = Math.max(6, baseUnit * 0.009);
        for (let i = 0; i < count; i++) {
          canvas.add(new Rect({ ...common, left: gapX * i + gapX / 2, top: height * 0.02, width: dot, height: dot, fill: "#E8B44E", angle: 45 }));
          canvas.add(new Rect({ ...common, left: gapX * i + gapX / 2, top: height * 0.965, width: dot, height: dot, fill: "#E8B44E", angle: 45 }));
        }
      }
      if (cancelled) return;

      // ---------- logo / avatar (top-left lockup, logical/percentage positions) ----------
      const logoSize = Math.max(44, Math.min(88, baseUnit * 0.07));
      const logoLeft = width * 0.04;
      const logoTop = height * 0.04;

      if (form.logo) {
        try {
          const logoImg = await FabricImage.fromURL(form.logo, { crossOrigin: "anonymous" });
          if (cancelled) return;
          const scale = logoSize / Math.max(logoImg.width, logoImg.height);
          logoImg.set({
            left: logoLeft,
            top: logoTop,
            scaleX: scale,
            scaleY: scale,
            hasControls: true,
            cornerSize,
            touchCornerSize,
            cornerColor: "#E4572E",
            borderColor: "#E4572E",
            fieldKey: "logo",
          });
          canvas.add(logoImg);
          objsRef.current.logo = logoImg;
        } catch (e) {
          // ignore broken logo upload
        }
      } else {
        const avatar = new Rect({
          left: logoLeft, top: logoTop, width: logoSize, height: logoSize,
          rx: logoSize * 0.25, ry: logoSize * 0.25,
          fill: "rgba(255,255,255,0.2)", stroke: "rgba(255,255,255,0.3)", strokeWidth: 2,
          selectable: false, evented: false,
        });
        const initial = new Textbox((form.businessName || "K").trim().charAt(0).toUpperCase(), {
          left: logoLeft, top: logoTop, width: logoSize, height: logoSize,
          fontFamily, fontWeight: "700", fontSize: Math.round(logoSize * 0.42),
          fill: "#fff", textAlign: "center",
          selectable: false, evented: false, editable: false,
        });
        canvas.add(avatar, initial);
      }
      if (cancelled) return;

      // ---------- text layout: percentage-of-canvas anchors, centered, wrap-safe ----------
      const padXFrac = 0.08; // 8% margin each side -> textbox width = 84% of canvas width
      const textWidth = width * (1 - padXFrac * 2);
      const centerX = width / 2;

      const headFontSize = Math.max(22, Math.round(baseUnit * 0.072));
      const subFontSize = Math.max(14, Math.round(baseUnit * 0.032));
      const ctaFontSize = Math.max(12, Math.round(baseUnit * 0.028));
      const contactFontSize = Math.max(11, Math.round(baseUnit * 0.022));

      const businessNameBox = new Textbox(form.businessName || "Your Business", {
        ...TEXT_DEFAULTS,
        left: logoLeft + logoSize + width * 0.02,
        top: logoTop + logoSize / 2,
        originY: "center",
        width: width - (logoLeft + logoSize + width * 0.02) - width * 0.04,
        fontFamily,
        fontWeight: "600",
        fontSize: Math.max(14, Math.round(baseUnit * 0.026)),
        cornerSize,
        touchCornerSize,
        fieldKey: "businessName",
      });
      canvas.add(businessNameBox);
      objsRef.current.businessName = businessNameBox;

      // vertical anchors as fractions of height — safe across all 3 aspect ratios
      const anchors = { headline: 0.48, subheadline: 0.66, cta: 0.79, phone: 0.89, address: 0.94 };
      const minHeadTop = height * 0.16; // stay clear of the logo row

      const headlineBox = new Textbox(form.headline || "Your Headline Here", {
        ...TEXT_DEFAULTS,
        left: centerX,
        top: Math.max(minHeadTop, height * anchors.headline),
        originX: "center",
        originY: "top",
        width: textWidth,
        textAlign: "center",
        fontFamily,
        fontWeight: "800",
        fontSize: headFontSize,
        lineHeight: 1.1,
        cornerSize,
        touchCornerSize,
        fieldKey: "headline",
      });
      canvas.add(headlineBox);
      objsRef.current.headline = headlineBox;

      if (form.subheadline) {
        const subBox = new Textbox(form.subheadline, {
          ...TEXT_DEFAULTS,
          left: centerX,
          top: height * anchors.subheadline,
          originX: "center",
          originY: "top",
          width: textWidth,
          textAlign: "center",
          fontFamily,
          fontWeight: "400",
          fontSize: subFontSize,
          fill: "rgba(255,255,255,0.9)",
          cornerSize,
          touchCornerSize,
          fieldKey: "subheadline",
        });
        canvas.add(subBox);
        objsRef.current.subheadline = subBox;
      } else {
        objsRef.current.subheadline = null;
      }

      if (form.ctaText) {
        const isLight = template.kind === "clinic" || template.kind === "salon";
        const ctaBox = new Textbox(form.ctaText, {
          ...TEXT_DEFAULTS,
          left: centerX,
          top: height * anchors.cta,
          originX: "center",
          originY: "top",
          width: textWidth * 0.7,
          textAlign: "center",
          fontFamily,
          fontWeight: "700",
          fontSize: ctaFontSize,
          fill: isLight ? brandColor : "#FFFFFF",
          backgroundColor: isLight ? "#FFFFFF" : brandColor,
          cornerSize,
          touchCornerSize,
          fieldKey: "ctaText",
        });
        canvas.add(ctaBox);
        objsRef.current.ctaText = ctaBox;
      } else {
        objsRef.current.ctaText = null;
      }

      if (form.phone) {
        const phoneBox = new Textbox(form.phone, {
          ...TEXT_DEFAULTS,
          left: centerX,
          top: height * anchors.phone,
          originX: "center",
          originY: "top",
          width: textWidth,
          textAlign: "center",
          fontFamily,
          fontWeight: "500",
          fontSize: contactFontSize,
          fill: "rgba(255,255,255,0.85)",
          cornerSize,
          touchCornerSize,
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
          left: centerX,
          top: height * anchors.address,
          originX: "center",
          originY: "top",
          width: textWidth,
          textAlign: "center",
          fontFamily,
          fontWeight: "500",
          fontSize: contactFontSize,
          fill: "rgba(255,255,255,0.85)",
          cornerSize,
          touchCornerSize,
          fieldKey: "address",
        });
        canvas.add(addressBox);
        objsRef.current.address = addressBox;
      } else {
        objsRef.current.address = null;
      }

      // watermark — fixed, not draggable/editable, always inside bounds
      const watermark = new Textbox("Made with Kochi Spark", {
        left: width - width * 0.04,
        top: height - height * 0.025,
        originX: "right",
        originY: "bottom",
        width: width * 0.4,
        fontFamily,
        fontSize: Math.max(10, Math.round(baseUnit * 0.016)),
        fill: "rgba(255,255,255,0.45)",
        textAlign: "right",
        selectable: false,
        evented: false,
        editable: false,
      });
      canvas.add(watermark);

      applySizeRef.current(); // ensure newly-added objects get correctly-scaled corner/touch handle sizes
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

  return (
    <div ref={wrapRef} className="w-full h-full flex items-center justify-center overflow-hidden">
      <canvas ref={canvasElRef} />
    </div>
  );
});

export default PosterCanvas;
