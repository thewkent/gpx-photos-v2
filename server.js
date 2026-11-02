// server.ts
import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
dotenv.config();
var app = express();
app.use(express.json({ limit: "25mb" }));
var apiKey = process.env.GEMINI_API_KEY;
var ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
function parseNormalizedBox(value) {
  if (!Array.isArray(value) || value.length !== 4 || !value.every(Number.isFinite)) return null;
  const [x, y, width, height] = value;
  if (x < 0 || y < 0 || width <= 0 || height <= 0 || x + width > 1 || y + height > 1) return null;
  return [x, y, width, height];
}
app.post("/api/auto-style", async (req, res) => {
  try {
    if (!ai) {
      return res.status(503).json({ error: "GEMINI_API_KEY is not configured on server" });
    }
    const { imageBase64, mimeType = "image/jpeg" } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64 parameter" });
    }
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const prompt = `You are a layout engine for sports, hiking, outdoor activity, and expedition photo overlays. You receive a photo of an outdoor activity (hike, run, cycle, trek, climb, expedition) plus a list of overlay widgets. Your job is to analyze the image and decide where each widget goes so nothing covers the subjects or people and the result looks professionally designed.

## INPUT
- Image (width W, height H)
- Widgets to place, each with an aspect ratio and minimum size:
  - "map": GPX route map (aspect ~1:1 or 4:3, min 18% of image width)
  - "elevation": elevation profile (aspect ~4:1 to 6:1, min 40% of image width)
  - "hud": stats block (distance, time, pace/speed, elevation gain, avg HR/power), aspect ~2:1 to 3:1

## STEP 1: ANALYZE THE IMAGE
1. Locate every person / subject / hiker (and backpack/bike/equipment attached to them). Return a tight bounding box for each, then pad it by 4% of the image's shorter side. This is the NO-GO ZONE.
2. Identify other no-go areas: faces of bystanders, the horizon line focal point, key subjects (summit sign, peak marker, cairn, finish banner, bib number), and any text or logos already in the image.
3. Identify the rule-of-thirds intersections and the visual flow (where the person is facing or moving). Prefer to place widgets BEHIND the person's direction of travel and not in front of it, so they "move into" open space.
4. Find candidate open regions: sky, road, water, blurred background, shadow areas, or uniform walls. Rank by (a) area, (b) low visual complexity (low edge density and texture), (c) fit with the widgets' aspect ratios.
5. For each candidate region, sample the background luminance and dominant color so you can pick readable text and accent colors.

## STEP 2: PLACEMENT RULES
- HARD RULES (never break):
  - No widget may overlap the person no-go zone, even partially.
  - All widgets must stay at least 4% of the image width from every image edge.
  - Widgets must not overlap each other. Keep at least 2% gap.
  - Widgets must not cover faces.
- DESIGN RULES (follow as closely as possible):
  - Use at most 2 anchor regions. Don't scatter widgets across all four corners.
  - Align widgets to a shared edge or baseline (left-aligned or right-aligned stack, or a clean row along the bottom).
  - Prefer corners and edges over floating in the middle.
  - Keep a clear visual hierarchy: HUD is primary, map secondary, elevation tertiary. Scale accordingly.
  - Balance the composition: if the person is on the left, the overlay cluster goes right, and vice versa. If centered, split widgets between the top and bottom open areas or use a single bottom strip.
  - Match the widget scale to the image. Widgets should feel like part of the photo, not stickers. The total overlay area should not exceed 30% of the image.
  - If no region is large enough, shrink widgets (never below the minimums) before dropping any. If still impossible, set "fits": false and explain.

## STEP 3: STYLE DECISIONS
For each widget choose:
- Text/line color: white or near-black based on the background luminance under it (use WCAG contrast >= 4.5:1). Pull one accent color from the photo's palette (e.g. jersey, sky, or bike) for the route line and key numbers.
- Backing: "none" if the background is calm and the contrast is already sufficient, "gradient-scrim" if the region is busy (soft gradient fading toward the image edge), or "glass" (blurred translucent panel with 12-16px radius) if the contrast is poor.
- Opacity of the backing between 0.25 and 0.6.
- Keep one font family. Large bold numerals for HUD values, small uppercase labels with letter-spacing.

## OUTPUT
Return ONLY valid JSON. All coordinates are normalized 0 to 1 relative to image width and height, as [x, y, width, height] from the top-left.

{
  "athlete_boxes": [[x,y,w,h]],
  "no_go_zones": [[x,y,w,h]],
  "composition": "short description of the image and the layout strategy",
  "widgets": [
    {
      "type": "hud | map | elevation",
      "box": [x,y,w,h],
      "anchor": "top-left | top-right | bottom-left | bottom-right | top-center | bottom-center",
      "text_color": "#hex",
      "accent_color": "#hex",
      "backing": "none | gradient-scrim | glass",
      "backing_opacity": 0.0,
      "reasoning": "one sentence"
    }
  ],
  "fits": true,
  "warnings": []
}

## SELF-CHECK BEFORE ANSWERING
Verify: no widget intersects a no-go zone, no widgets intersect each other, all margins are respected, contrast passes, and the layout looks balanced. If any check fails, revise the layout and re-check.`;
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType,
                data: cleanBase64
              }
            }
          ]
        }
      ]
    });
    const text = response.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      let hudCard = null;
      let spatialRoute = null;
      let elevationConfig = null;
      const validWidgets = Array.isArray(parsed.widgets) ? parsed.widgets.flatMap((widget) => {
        const box = parseNormalizedBox(widget?.box);
        return box && ["hud", "map", "elevation"].includes(widget?.type) ? [{ ...widget, box }] : [];
      }) : [];
      if (validWidgets.length) {
        for (const widget of validWidgets) {
          const [bx, by, bw, bh] = widget.box;
          if (widget.type === "hud") {
            hudCard = {
              posX: Math.max(0.04, Math.min(0.72, bx)),
              posY: Math.max(0.04, Math.min(0.78, by)),
              style: widget.backing === "glass" ? "smoked_glass" : widget.backing === "none" ? "frosted_ice" : "smoked_glass",
              opacity: widget.backing_opacity ? Math.max(0.6, Math.min(0.96, widget.backing_opacity + 0.35)) : 0.94,
              scale: Math.max(0.8, Math.min(1.15, bw / 0.28))
            };
          } else if (widget.type === "map") {
            spatialRoute = {
              posX: Math.max(0.12, Math.min(0.88, bx + bw / 2)),
              posY: Math.max(0.12, Math.min(0.88, by + bh / 2)),
              scale: Math.max(0.55, Math.min(1.15, bw / 0.32)),
              glowColor: widget.accent_color || "#FC5200",
              tiltAngle: 14,
              // Subtle 3D angle with drop shadow so it doesn't look flat
              yawAngle: 0,
              // 100% authentic geographic compass heading
              renderMode: "volumetric_tube",
              shadowEnabled: true,
              shadowIntensity: 0.7,
              shadowOffsetY: 6
            };
          } else if (widget.type === "elevation") {
            elevationConfig = {
              enabled: true,
              posY: Math.max(0.7, Math.min(0.95, by + bh * 0.5)),
              widthPercent: Math.max(0.5, Math.min(0.94, bw)),
              height: Math.max(40, Math.min(75, Math.round(bh * 500)))
            };
          }
        }
      }
      if (!hudCard) {
        hudCard = { posX: 0.14, posY: 0.14, style: "smoked_glass", scale: 1 };
      }
      if (!spatialRoute) {
        spatialRoute = {
          posX: 0.72,
          posY: 0.22,
          scale: 0.68,
          glowColor: "#FC5200",
          tiltAngle: 14,
          yawAngle: 0,
          renderMode: "volumetric_tube",
          shadowEnabled: true,
          shadowIntensity: 0.7,
          shadowOffsetY: 6
        };
      }
      if (elevationConfig && hudCard.posY > 0.58 && Math.abs(hudCard.posY - elevationConfig.posY) < 0.25) {
        hudCard.posY = 0.14;
        hudCard.posX = 0.14;
      }
      const mapWidget = validWidgets.find((w) => w.type === "map");
      const accentHex = mapWidget?.accent_color || "#FC5200";
      const protectedBoxes = [
        ...Array.isArray(parsed.no_go_zones) ? parsed.no_go_zones : [],
        ...Array.isArray(parsed.athlete_boxes) ? parsed.athlete_boxes : []
      ].flatMap((box) => {
        const validBox = parseNormalizedBox(box);
        return validBox ? [validBox] : [];
      });
      const safeLayout = {
        ...parsed,
        widgets: validWidgets,
        no_go_zones: protectedBoxes
      };
      const responsePayload = {
        layoutEngine: safeLayout,
        atmosphere: {
          grade: "original",
          warmth: 0,
          contrast: 1.04,
          brightness: 1
        },
        spatialRoute,
        hudCard,
        elevationConfig,
        summary: {
          mood: typeof parsed.composition === "string" ? parsed.composition : "Sports Telemetry Layout",
          paletteDescription: validWidgets.map((w) => `${w.type}: ${typeof w.reasoning === "string" ? w.reasoning : "placed in open space"}`).join(" \u2022 ") || "Professionally balanced layout",
          routeColorName: "Harmonized Route Accent",
          accentHex,
          source: "gemini_vision"
        }
      };
      return res.json(responsePayload);
    }
    return res.status(500).json({ error: "Failed to parse JSON response from Gemini", raw: text });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    console.error("Gemini vision auto-style error:", errorMsg);
    return res.status(500).json({ error: errorMsg });
  }
});
var AGENT_LINK_HEADERS = [
  '</llms.txt>; rel="alternate"; type="text/plain"',
  '</llms-full.txt>; rel="alternate"; type="text/plain"',
  '</.well-known/mcp/server-card.json>; rel="service-desc"; type="application/json"',
  '</?format=markdown>; rel="alternate"; type="text/markdown"'
].join(", ");
var VALID_EXACT_ROUTES = /* @__PURE__ */ new Set([
  "/",
  "/index.html",
  "/studio",
  "/app",
  "/events",
  "/pricing",
  "/about",
  "/contact",
  "/terms",
  "/privacy",
  "/faq",
  "/gallery"
]);
function isValidRoute(pathname) {
  const normalized = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  if (VALID_EXACT_ROUTES.has(normalized)) return true;
  if (normalized.startsWith("/event/")) return true;
  return false;
}
function isMarkdownRequested(req) {
  const accept = req.headers["accept"] || "";
  const format = req.query.format;
  return accept.includes("text/markdown") || accept.includes("text/x-markdown") || format === "markdown";
}
function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, (tag) => {
    const chars = { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" };
    return chars[tag] || tag;
  });
}
function generateHomepageMarkdown() {
  return `# GPX.photos - Add Your Route Map & Stats to Any Photo

> Overlay your GPX route and workout stats directly onto race, run, and ride photos. Free, browser-based, and 100% private. Works with Strava, Garmin, Apple Watch, and Coros.

## Highlights
- **100% Client-Side Privacy**: Photos and GPS files are processed entirely in browser memory. Zero server uploads.
- **Zero-Crop Native Camera Ratios**: Supports full-frame DSLR, mirrorless, and mobile aspect ratios (3:2, 4:3, 16:9, and smartphone vertical).
- **3D Ground Perspective Projection**: Projects authentic geographic GPS coordinates onto photo ground planes with customizable pitch, tilt, and drop shadow.
- **Floating HUD Telemetry Plaque**: Glassmorphic stats card showing distance, time, elevation gain, and average pace/speed.
- **Synchronized Elevation Profile Ribbon**: Dynamic altitude ribbon with summit peak markers and elevation gain badge.

## Core Navigation
- [Open Studio](https://gpx.photos/#studio): Launch interactive 3D route editor
- [Featured Races & Events](https://gpx.photos/#events): Preloaded marathon & cycling classic routes
- [About Us](https://gpx.photos/#about): Technical architecture and mission
- [Contact Support](https://gpx.photos/#contact): Support email and agent desk
- [Terms of Service](https://gpx.photos/#terms): Personal & commercial master licensing
- [Privacy Policy](https://gpx.photos/#privacy): Zero data collection guarantee

## Licensing
- **Free Social Edition ($0)**: Free export with official gpx.photos hallmark emblem badge.
- **Clean Master Edition ($10)**: 100% unbranded 300 DPI 4K master download via Paystack.

## Machine-Readable Contact & Agent Resources
- **Support Email**: [support@gpx.photos](mailto:support@gpx.photos)
- **Legal Entity**: GPX Photos Studio Inc.
- **LLMs Guide**: [/llms.txt](https://gpx.photos/llms.txt)
- **Full LLMs Spec**: [/llms-full.txt](https://gpx.photos/llms-full.txt)
- **MCP Server Card (SEP-1649)**: [/.well-known/mcp/server-card.json](https://gpx.photos/.well-known/mcp/server-card.json)
- **Vision Layout API**: POST [/api/auto-style](https://gpx.photos/api/auto-style)
`;
}
function render404Html(requestPath) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>404 - Page Not Found | gpx.photos</title>
    <meta name="robots" content="noindex, follow" />
    <link rel="icon" type="image/svg+xml" href="/assets/gpx-photos-emblem-YOUASDAC.svg" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&family=JetBrains+Mono:wght@500&display=swap">
    <style>
      body { margin: 0; background: #0A0A0C; color: #F3F3F5; font-family: 'Plus Jakarta Sans', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; box-sizing: border-box; text-align: center; }
      .card { max-width: 520px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 40px 30px; box-shadow: 0 20px 50px rgba(0,0,0,0.6); }
      .badge { display: inline-block; font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #F59E0B; background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.25); border-radius: 999px; padding: 4px 14px; margin-bottom: 20px; }
      h1 { font-size: 34px; font-weight: 800; margin: 0 0 12px 0; color: #FFFFFF; }
      p { font-size: 15px; color: #A1A1AA; line-height: 1.6; margin: 0 0 24px 0; }
      .path { font-family: 'JetBrains Mono', monospace; color: #F59E0B; background: rgba(255,255,255,0.06); padding: 2px 8px; border-radius: 6px; }
      .btn { display: inline-block; background: #F59E0B; color: #0A0A0C; font-weight: 700; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-size: 14px; margin: 6px; transition: background 0.2s; }
      .btn:hover { background: #FBBF24; }
      .btn-secondary { background: rgba(255,255,255,0.08); color: #FFFFFF; }
      .btn-secondary:hover { background: rgba(255,255,255,0.15); }
      .footer { margin-top: 24px; font-size: 12px; color: #71717A; }
      .footer a { color: #A1A1AA; text-decoration: underline; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="badge">HTTP 404 NOT FOUND</div>
      <h1>Route Not Found</h1>
      <p>The requested page <span class="path">${escapeHtml(requestPath)}</span> does not exist on gpx.photos.</p>
      <div>
        <a href="/" class="btn">Return to Homepage</a>
        <a href="/#studio" class="btn btn-secondary">Launch Studio</a>
      </div>
      <div class="footer">
        Customer Support: <a href="mailto:support@gpx.photos">support@gpx.photos</a> \u2022 <a href="/llms.txt">llms.txt</a>
      </div>
    </div>
  </body>
</html>`;
}
app.get("/robots.txt", (_req, res) => {
  const filePath = path.resolve("public/robots.txt");
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  res.send("User-agent: *\nAllow: /\n\nContent-Signal: search=yes, ai-train=no\n\nSitemap: https://gpx.photos/sitemap.xml\n");
});
app.get("/llms.txt", (_req, res) => {
  const filePath = path.resolve("public/llms.txt");
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600");
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  res.send(generateHomepageMarkdown());
});
app.get("/llms-full.txt", (_req, res) => {
  const filePath = path.resolve("public/llms-full.txt");
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600");
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  res.send(generateHomepageMarkdown());
});
app.get(["/.well-known/mcp/server-card.json", "/.well-known/mcp"], (_req, res) => {
  const filePath = path.resolve("public/.well-known/mcp/server-card.json");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600");
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  res.json({
    name: "gpx.photos",
    version: "1.0.0",
    description: "GPX.photos 3D GPS route visualization and athletic telemetry overlay service.",
    endpoint: "https://gpx.photos/api/mcp"
  });
});
async function startServer() {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
  const isProd = process.env.NODE_ENV === "production";
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: "0.0.0.0", port },
      appType: "custom"
    });
    app.use(vite.middlewares);
    app.get("*", async (req, res, next) => {
      if (req.path.startsWith("/api/") || req.path.startsWith("/@") || req.path.startsWith("/src/") || req.path.startsWith("/node_modules/")) {
        return next();
      }
      const publicFilePath = path.resolve("public" + req.path);
      if (req.path !== "/" && fs.existsSync(publicFilePath) && fs.statSync(publicFilePath).isFile()) {
        return next();
      }
      if (isMarkdownRequested(req)) {
        res.setHeader("Content-Type", "text/markdown; charset=utf-8");
        res.setHeader("Vary", "Accept");
        res.setHeader("Link", AGENT_LINK_HEADERS);
        return res.status(200).send(generateHomepageMarkdown());
      }
      if (!isValidRoute(req.path)) {
        res.status(404);
        res.setHeader("Link", AGENT_LINK_HEADERS);
        if (req.accepts("html")) {
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          return res.send(render404Html(req.path));
        }
        return res.json({ error: "Not Found", status: 404, path: req.path });
      }
      try {
        const url = req.originalUrl;
        let template = fs.readFileSync(path.resolve("index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200);
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("Link", AGENT_LINK_HEADERS);
        res.end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve("dist"), { index: false }));
    app.get("*", (req, res) => {
      if (isMarkdownRequested(req)) {
        res.setHeader("Content-Type", "text/markdown; charset=utf-8");
        res.setHeader("Vary", "Accept");
        res.setHeader("Link", AGENT_LINK_HEADERS);
        return res.status(200).send(generateHomepageMarkdown());
      }
      if (!isValidRoute(req.path)) {
        res.status(404);
        res.setHeader("Link", AGENT_LINK_HEADERS);
        if (req.accepts("html")) {
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          return res.send(render404Html(req.path));
        }
        return res.json({ error: "Not Found", status: 404, path: req.path });
      }
      res.status(200);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Link", AGENT_LINK_HEADERS);
      res.sendFile(path.resolve("dist/index.html"));
    });
  }
  app.listen(port, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
}
startServer();
