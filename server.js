// server.ts
import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "path";
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
async function startServer() {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
  const isProd = process.env.NODE_ENV === "production";
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: "0.0.0.0", port },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve("dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve("dist/index.html"));
    });
  }
  app.listen(port, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
}
startServer();
