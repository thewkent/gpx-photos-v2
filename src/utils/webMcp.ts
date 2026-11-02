/**
 * WebMCP (Web Model Context Protocol) In-Browser Agent Integration
 * Exposes client-side tools to autonomous browser agents and extensions via navigator.modelContext.
 */

export interface WebMcpToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (params: any) => Promise<any> | any;
}

export function registerWebMcpTools(): void {
  if (typeof window === 'undefined') return;

  const tools: WebMcpToolDefinition[] = [
    {
      name: 'createGpxPhotoOverlay',
      description:
        'Configures and renders a 3D GPS route line and floating HUD telemetry plaque onto an outdoor athletic photo.',
      inputSchema: {
        type: 'object',
        properties: {
          style: {
            type: 'string',
            enum: ['neon_rim', 'transparent_line_color', 'carbon_fiber', 'frosted_ice'],
            description: 'Visual style for the Statistics HUD plaque (default: neon_rim)',
          },
          routeColor: {
            type: 'string',
            description: 'Hex color for the GPS track (e.g. #FC5200 for Strava orange)',
          },
          renderMode: {
            type: 'string',
            enum: ['volumetric_tube', 'molten_laser', 'laser_ribbon', 'minimal_vector'],
            description: '3D rendering mode for the GPS track',
          },
          cardScale: {
            type: 'number',
            minimum: 0.6,
            maximum: 2.5,
            description: 'Size multiplier for the statistics plaque (60% to 250%)',
          },
          verticalPosition: {
            type: 'number',
            minimum: 0.0,
            maximum: 0.9,
            description: 'Vertical placement normalized (0.0 = top edge, 0.9 = bottom)',
          },
        },
      },
      execute: async (params: any) => {
        // Dispatches event to React application state
        window.dispatchEvent(
          new CustomEvent('webmcp:apply-overlay', { detail: params })
        );
        return {
          status: 'success',
          message: 'Overlay configuration applied successfully.',
          appliedSettings: params,
        };
      },
    },
    {
      name: 'getFeaturedRaceCatalog',
      description:
        'Retrieves catalog of famous marathons and cycling races with pre-loaded routes and elevations.',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      execute: async () => {
        return {
          events: [
            {
              id: 'ride-joburg',
              name: 'Virgin Active Ride Joburg',
              sport: 'cycling',
              distanceKm: 97.36,
              elevationGainM: 1240,
              location: 'FNB Stadium, Johannesburg, South Africa',
            },
            {
              id: 'sydney-marathon',
              name: 'TCS Sydney Marathon',
              sport: 'running',
              distanceKm: 42.195,
              elevationGainM: 318,
              location: 'Sydney Harbour Bridge & Opera House, Australia',
            },
          ],
        };
      },
    },
    {
      name: 'getPrivacyPolicyAndLicensing',
      description:
        'Returns the privacy model and licensing terms for GPX.photos (100% zero-upload client-side processing guarantee).',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      execute: async () => {
        return {
          privacy: '100% Client-Side. Photos and GPS files are processed entirely in browser memory; zero server uploads.',
          freeTier: 'Free Social Edition with configurable hallmark logo badge ($0).',
          masterTier: 'Clean Master Edition with 100% watermark removal at 300 DPI 4K ($10).',
          contactEmail: 'support@gpx.photos',
        };
      },
    },
  ];

  // Expose global registry for agent inspection
  (window as any).__WEBMCP_TOOLS__ = tools;

  // 1. Standard navigator.modelContext.registerTool API
  const nav = navigator as any;
  if (nav.modelContext && typeof nav.modelContext.registerTool === 'function') {
    tools.forEach((t) => {
      try {
        nav.modelContext.registerTool({
          name: t.name,
          description: t.description,
          inputSchema: t.inputSchema,
          execute: t.execute,
        });
      } catch (err) {
        console.warn(`[WebMCP] Could not register tool ${t.name}:`, err);
      }
    });
  }

  // 2. window.modelContext API fallback
  const win = window as any;
  if (win.modelContext && typeof win.modelContext.registerTool === 'function') {
    tools.forEach((t) => {
      try {
        win.modelContext.registerTool({
          name: t.name,
          description: t.description,
          inputSchema: t.inputSchema,
          execute: t.execute,
        });
      } catch (err) {
        console.warn(`[WebMCP] Could not register window tool ${t.name}:`, err);
      }
    });
  }
}
