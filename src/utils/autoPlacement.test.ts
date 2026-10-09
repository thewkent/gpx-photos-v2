import assert from 'node:assert/strict';
import test from 'node:test';
import { chooseAutoRoutePlacement, isRoutePlacementClear } from './autoPlacement.ts';
import type { RoutePoint } from '../types/poster.ts';

const route: RoutePoint[] = [
  { x: 0.15, y: 0.65 },
  { x: 0.12, y: 0.72 },
  { x: 0.32, y: 0.85 },
  { x: 0.58, y: 0.52 },
  { x: 0.88, y: 0.25 },
  { x: 0.95, y: 0.38 },
  { x: 0.65, y: 0.60 },
];

test('moves the projected route away from a detected person zone', () => {
  const noGoZones = [{ x: 0.48, y: 0.04, width: 0.48, height: 0.48 }];
  const preferred = { posX: 0.72, posY: 0.22, scale: 0.68 };
  assert.equal(isRoutePlacementClear(route, preferred, 1.5, noGoZones), false);

  const result = chooseAutoRoutePlacement({
    points: route,
    aspect: 1.5,
    preferred,
    noGoZones,
    hudCard: { enabled: true, posX: 0.14, posY: 0.14, scale: 1 },
    elevationConfig: { enabled: true, posY: 0.92, height: 52, widthPercent: 0.9 },
  });

  assert.equal(isRoutePlacementClear(route, result, 1.5, noGoZones), true);
});

test('repositions the route when its preferred footprint would clip the canvas', () => {
  const result = chooseAutoRoutePlacement({
    points: route,
    aspect: 1,
    preferred: { posX: 0.88, posY: 0.18, scale: 1.15 },
    hudCard: { enabled: false },
    elevationConfig: { enabled: false },
  });

  assert.ok(result.posX < 0.88);
  assert.equal(result.scale, 1.15);
});

test('shrinks the route to fit both dimensions of the requested map box', () => {
  const result = chooseAutoRoutePlacement({
    points: route,
    aspect: 1.5,
    preferred: { posX: 0.49, posY: 0.51, scale: 1.15 },
    fitWithin: { x: 0.30, y: 0.30, width: 0.38, height: 0.42 },
    hudCard: { enabled: false },
    elevationConfig: { enabled: false },
  });

  assert.ok(result.scale < 1.15);
  assert.equal(result.posX, 0.49);
  assert.equal(result.posY, 0.51);
});

test('moves a map colliding with a person while preserving its requested footprint limit', () => {
  const preferred = { posX: 0.72, posY: 0.22, scale: 0.68 };
  const result = chooseAutoRoutePlacement({
    points: route,
    aspect: 1.5,
    preferred,
    fitWithin: { x: 0.50, y: 0.05, width: 0.42, height: 0.46 },
    noGoZones: [{ x: 0.48, y: 0.04, width: 0.48, height: 0.48 }],
    hudCard: { enabled: false },
    elevationConfig: { enabled: false },
  });

  assert.notEqual(result.posX, preferred.posX);
  assert.equal(result.scale, preferred.scale);
  assert.equal(isRoutePlacementClear(route, result, 1.5, [{ x: 0.48, y: 0.04, width: 0.48, height: 0.48 }]), true);
});