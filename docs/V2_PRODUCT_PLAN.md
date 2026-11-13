# gpx.photos V2 — Product Direction & Delivery Plan

## 1. Product vision

gpx.photos turns a meaningful outdoor achievement into a beautiful, shareable photograph.

A person uploads a photo and an activity GPX file. The product composes the route and activity details into the image, then lets the person make a few simple adjustments and export it.

**The product is for anyone who records an outdoor activity**: running, trail running, road and mountain cycling, gravel, hiking, walking, trekking, triathlon, and other GPX-supported activities. The experience should be activity-agnostic; templates and metrics can adapt to the activity.

The product should feel like a creative photo tool, not a technical GPX editor.

## 2. Product principles

1. **Beautiful by default** — the first automatic result should already look good.
2. **Fast to first result** — photo + GPX in, finished composition out, with as few decisions as possible.
3. **Simple first, powerful when needed** — expose a small number of useful controls; put specialist controls in Advanced.
4. **The photo remains the hero** — overlays must complement the subject, not obscure it.
5. **Accurate activity data** — never invent missing distance, time, pace, speed, or elevation values.
6. **Privacy by design** — keep photo and GPX processing local unless a clearly explained, optional remote feature is introduced.
7. **Shareable free output** — free exports carry a tasteful gpx.photos attribution.
8. **A clear paid upgrade** — charge for a clean, high-resolution export and additional premium creative options.

## 3. Target users and activities

Serve all outdoor participants rather than prioritising one sport. The initial experience should support generic GPX tracks and select relevant metrics based on available data.

Potential activity-aware metric sets:
- Running / trail running: distance, elapsed time, pace, elevation gain
- Cycling / gravel / MTB: distance, elapsed time, average speed, elevation gain
- Hiking / trekking: distance, moving or elapsed time when available, elevation gain, highest altitude
- Other activities: show only metrics that are actually present and meaningful

Do not infer an activity type with certainty when the source data does not support it. Let the user choose or edit the activity label.

## 4. Signature visual direction

The aspirational visual identity is **Signature 3D Route**:
- A vivid, dimensional route projected onto the apparent ground plane of the photograph
- Controlled perspective and depth, with a subtle contact shadow
- A warm orange route glow as a recognisable brand signature
- A refined floating glass-style statistics panel
- Optional elevation profile, start/finish markers, and restrained supporting details

The effect should look premium and intentional, not like a collection of unrelated neon effects. The route must remain legible against varied photographs. Avoid covering faces, athletes, event numbers, or other important subjects.

Keep the existing Canvas 2D renderer as the starting point. Improve the composition, layering, lighting, and defaults before considering a new rendering technology.

### Style presets

1. **Signature 3D** — the primary brand experience and aspirational default once quality is reliable.
2. **Editorial** — clean, restrained route line and elegant statistics panel for users who prefer a less dramatic look.
3. **Map & Elevation** — compact map treatment with start/finish markers and an optional elevation profile.

The presets should be genuinely distinct compositions, not merely different colours applied to the same layout.

## 5. V2 user experience

### Main flow

1. Upload or drop a photograph.
2. Upload a GPX file (or try a sample activity).
3. Automatically generate a composition.
4. Make optional adjustments.
5. Download a free branded social image or purchase a clean high-resolution export.

### Editor layout

Use a large photo preview with a compact inspector. Organise ordinary controls into four areas:

- **Photo** — replace photo, fit/crop, and basic image adjustments.
- **Layout** — route placement, statistics panel placement, and optional elevation profile.
- **Style** — Signature 3D, Editorial, or Map & Elevation; colour and intensity.
- **Statistics** — choose which valid metrics appear and edit the activity title.

Keep advanced perspective, extrusion, glow, shadows, glass effects, and fine-grained geometry controls in a collapsed Advanced area.

Where practical, allow users to drag the route and statistics panel directly on the photo, with snapping guides and simple resize/rotate handles. Do not make direct manipulation a blocker for the first V2 release.

### Automatic composition

Create a composition pipeline that:
- Detects photo orientation and usable image regions.
- Uses conservative image heuristics initially to choose a readable layout.
- Avoids known subject areas when possible.
- Places route, statistics, and elevation elements without collisions.
- Chooses text and panel contrast based on the background.
- Offers a simple regenerate / try another layout action.

Do not claim semantic AI image understanding unless it is actually implemented and tested. If a remote vision service is added later, make it opt-in and explain what image data is sent and to whom.

## 6. Monetisation and launch strategy

The immediate goal is to validate willingness to pay and generate the first revenue without undermining free sharing.

### Initial offer

- **Free Social Export** — attractive, useful image with a small, tasteful “Made with gpx.photos” attribution.
- **Paid Clean Export** — remove attribution and unlock the best available export resolution.
- Consider a simple introductory price and test conversion before adding subscriptions or complex tiers.

The paid offer must state the actual output dimensions and limitations. Do not describe an export as native-resolution or 300 DPI unless the generated file and metadata genuinely support that claim.

### Revenue-critical requirements

- Verify every Paystack transaction server-side before granting a paid entitlement.
- Never unlock a paid export because a public key is missing, a checkout fails, or a sandbox path is used in production.
- Keep sandbox/test payment behaviour explicitly separated from production.
- Record enough transaction and entitlement information to handle support and refunds safely.

### Measure the funnel

Track, with privacy-appropriate analytics:
- Visits to the tool
- Photo and GPX upload completion
- Successful first composition
- Free exports
- Paid checkout starts
- Verified paid conversions
- Export failures

Optimise the first successful result and paid conversion before building a large catalogue of features.

## 7. Accuracy, privacy, and export quality

These are release requirements, not optional polish:

- Missing GPX metrics must be shown as unavailable or omitted; never filled with fabricated defaults.
- Document and test distance, time, speed/pace, and elevation calculations.
- Use a validated elevation-noise filter and ensure documentation matches implementation.
- Report real export pixel dimensions. Support useful social presets and a high-resolution clean export.
- Keep photo and GPX data in the browser by default.
- Review any server-side AI or image-processing route before enabling it; update privacy disclosures and obtain clear consent where required.

## 8. Delivery roadmap

### Phase 0 — Safety and truthfulness
- Fix or disable unsafe payment unlock paths.
- Remove fabricated GPX fallback statistics.
- Resolve elevation-filter implementation/documentation mismatch.
- Verify actual export dimensions and claims.
- Confirm production deployment includes the backend required by the app.

### Phase 1 — Product foundation
- Create a V2 editor structure with Photo, Layout, Style, and Statistics.
- Reduce the default control surface substantially.
- Preserve advanced controls behind an Advanced disclosure.
- Establish clear empty, loading, error, and success states.

### Phase 2 — Signature visual quality
- Make Signature 3D the hero preset.
- Refine route depth, orange glow, contact shadow, perspective, and glass HUD.
- Test on varied photos: portrait/landscape, bright/dark, busy/clean, subject left/right/centre.
- Add Editorial and Map & Elevation as distinct alternatives.

### Phase 3 — Composition and interaction
- Add automatic layout selection and regenerate.
- Add direct drag positioning and snapping where it improves usability.
- Add undo/redo and remember the current session locally if feasible.

### Phase 4 — Launch and revenue optimisation
- Polish mobile usability and social aspect-ratio exports.
- Implement secure payment verification and a reliable paid-export entitlement.
- Test price, messaging, and free attribution placement.
- Add a small gallery of real examples and clear before/after demonstrations.

## 9. V2 acceptance criteria

A V2 release should meet these conditions:
- A first-time user can create an attractive result without understanding GPX or graphic-design controls.
- The Signature 3D preset looks deliberate and legible across a representative photo test set.
- The user can switch to a simpler visual style.
- Only source-supported activity statistics are displayed.
- Free export attribution is tasteful and visible.
- Paid export unlocks only after verified payment.
- Export dimensions are accurate and clearly communicated.
- Core workflow is usable on desktop and mobile.
- Privacy and AI-processing statements match the actual implementation.

## 10. Implementation guardrails

- Build V2 on a separate branch; do not destabilise the current production branch.
- Prefer incremental refactoring and reuse of the current Canvas 2D renderer.
- Avoid a full rewrite unless a measured technical limitation justifies it.
- Keep each phase independently testable and reviewable.
- Update the main README after implementation decisions settle, so it describes the real product and current architecture rather than aspirational or outdated behaviour.
