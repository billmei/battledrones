import { describe, expect, it } from "vitest";
import { BUILDINGS, ECONOMY, TICK_RATE, UNITS } from "../src/sim/balance";
import { createSkirmishWorld } from "../src/sim/map";
import { step } from "../src/sim/sim";
import { Terrain } from "../src/sim/types";
import { createWorld, hqOf, spawnBuilding, terrainAt } from "../src/sim/world";
import { buildingBlocker, constructing, foundationsOf, inBaseRange, isFoundation, producersOf, unitBlocker } from "../src/sim/economy";

describe("skirmish map", () => {
  it("has an HQ and a starting harvester per faction, and stocked scrap fields", () => {
    const w = createSkirmishWorld();
    expect(hqOf(w, "blue")).not.toBeNull();
    expect(hqOf(w, "red")).not.toBeNull();
    const units = [...w.units.values()];
    expect(units.filter((u) => u.faction === "blue" && u.kind === "harvester")).toHaveLength(1);
    expect(units.filter((u) => u.faction === "red" && u.kind === "harvester")).toHaveLength(1);
    let scrapTiles = 0;
    for (let ty = 0; ty < w.height; ty++)
      for (let tx = 0; tx < w.width; tx++)
        if (terrainAt(w, tx, ty) === Terrain.Scrap) {
          scrapTiles++;
          expect(w.scrap[ty * w.width + tx]).toBe(ECONOMY.scrapPerTile);
        }
    expect(scrapTiles).toBeGreaterThan(10);
    expect(w.factions.blue.scrap).toBe(ECONOMY.startingScrap);
  });
});

describe("building construction (foundations, built in place in order)", () => {
  const fab = BUILDINGS["fab-plant"];
  const ticks = (k: keyof typeof BUILDINGS) => BUILDINGS[k].buildTime * TICK_RATE;
  const own = (w: ReturnType<typeof createSkirmishWorld>, kind: string) =>
    [...w.buildings.values()].filter((b) => b.faction === "blue" && b.kind === kind);

  it("lays a foundation where placed, paid at once, and builds it there", () => {
    const w = createSkirmishWorld();
    // Near the blue HQ (HQ at 4,40 size 3), clear of the starting harvester.
    step(w, [{ type: "placeBuilding", faction: "blue", building: "fab-plant", tx: 8, ty: 44 }]);
    expect(w.factions.blue.scrap).toBe(ECONOMY.startingScrap - fab.cost);
    const [b] = own(w, "fab-plant");
    expect(b).toBeDefined();
    expect([b!.tx, b!.ty]).toEqual([8, 44]);
    expect(isFoundation(b!)).toBe(true);
    expect(b!.hp).toBeLessThan(fab.hp * 0.2);
    // a foundation produces nothing
    step(w, [{ type: "produce", faction: "blue", buildingId: b!.id, unit: "stinger" }]);
    expect(b!.queue).toHaveLength(0);
    expect(producersOf(w, "blue", "stinger")).toHaveLength(0);

    for (let i = 0; i < ticks("fab-plant") + 1; i++) step(w, []);
    expect(isFoundation(b!)).toBe(false);
    expect(b!.hp).toBeCloseTo(fab.hp, 5);
    expect(w.buildings.get(b!.id)).toBe(b);
  });

  it("queues as many as the scrap pays for, and builds them one at a time in the order laid", () => {
    const w = createSkirmishWorld();
    w.factions.blue.scrap = 5000;
    step(w, [
      { type: "placeBuilding", faction: "blue", building: "turret", tx: 8, ty: 44 },
      { type: "placeBuilding", faction: "blue", building: "fab-plant", tx: 3, ty: 45 }
    ]);
    const turret = own(w, "turret")[0]!;
    const plant = own(w, "fab-plant")[0]!;
    expect(foundationsOf(w, "blue").map((b) => b.id)).toEqual([turret.id, plant.id]);
    expect(constructing(w, "blue")).toBe(turret);
    // the second waits untouched while the first goes up
    for (let i = 0; i < ticks("turret") - 2; i++) step(w, []);
    expect(isFoundation(turret)).toBe(true);
    expect(plant.build).toBe(ticks("fab-plant"));
    for (let i = 0; i < 3; i++) step(w, []);
    expect(isFoundation(turret)).toBe(false);
    expect(constructing(w, "blue")).toBe(plant);
    for (let i = 0; i < ticks("fab-plant") + 1; i++) step(w, []);
    expect(isFoundation(plant)).toBe(false);
    expect(foundationsOf(w, "blue")).toHaveLength(0);
  });

  it("can queue a building on a prerequisite still in the queue", () => {
    const w = createSkirmishWorld();
    w.factions.blue.scrap = 5000;
    expect(buildingBlocker(w, "blue", "tech-lab")).toMatch(/Needs/);
    step(w, [{ type: "placeBuilding", faction: "blue", building: "fab-plant", tx: 8, ty: 44 }]);
    expect(buildingBlocker(w, "blue", "tech-lab")).toBeNull();
    // ...but the prerequisite gives no tech while it is a foundation
    expect(unitBlocker(w, "blue", "stinger")).toMatch(/Needs/);
  });

  it("rejects placement out of radius, on rock, overlapping, on a unit, or on a foundation", () => {
    const w = createSkirmishWorld();
    const before = w.buildings.size;
    // far from any friendly building
    step(w, [{ type: "placeBuilding", faction: "blue", building: "turret", tx: 30, ty: 10 }]);
    // overlapping own HQ footprint
    step(w, [{ type: "placeBuilding", faction: "blue", building: "turret", tx: 5, ty: 41 }]);
    // blocked by a ground unit standing in the footprint (starting harvester)
    step(w, [{ type: "placeBuilding", faction: "blue", building: "turret", tx: 8, ty: 41 }]);
    expect(w.buildings.size).toBe(before);
    expect(w.factions.blue.scrap).toBe(ECONOMY.startingScrap); // nothing charged
    step(w, [{ type: "placeBuilding", faction: "blue", building: "turret", tx: 8, ty: 44 }]);
    expect(w.buildings.size).toBe(before + 1);
    // the foundation's ground is taken
    step(w, [{ type: "placeBuilding", faction: "blue", building: "turret", tx: 8, ty: 44 }]);
    expect(w.buildings.size).toBe(before + 1);
  });

  it("gives no build range from a foundation", () => {
    const w = createSkirmishWorld();
    w.factions.blue.scrap = 5000;
    step(w, [{ type: "placeBuilding", faction: "blue", building: "turret", tx: 8, ty: 44 }]);
    const t = own(w, "turret")[0]!;
    expect(inBaseRange(w, "blue", t.tx + 0.5, t.ty + 0.5)).toBe(true); // (the HQ's range)
    const far = { x: t.tx + 0.5 + ECONOMY.buildRadius, y: t.ty + 0.5 };
    const hq = hqOf(w, "blue")!;
    // a spot only the foundation would reach
    if (Math.hypot(far.x - hq.tx - 1.5, far.y - hq.ty - 1.5) > ECONOMY.buildRadius + 2) expect(inBaseRange(w, "blue", far.x, far.y)).toBe(false);
  });

  it("cancels a foundation (sell) with a full refund, and the next one in line goes up", () => {
    const w = createSkirmishWorld();
    w.factions.blue.scrap = 5000;
    step(w, [
      { type: "placeBuilding", faction: "blue", building: "turret", tx: 8, ty: 44 },
      { type: "placeBuilding", faction: "blue", building: "fab-plant", tx: 3, ty: 45 }
    ]);
    const turret = own(w, "turret")[0]!;
    const plant = own(w, "fab-plant")[0]!;
    for (let i = 0; i < 20; i++) step(w, []);
    w.factions.blue.scrap = 1000;
    const scrap = w.factions.blue.scrap;
    step(w, [{ type: "sell", faction: "blue", buildingId: turret.id }]);
    expect(w.buildings.has(turret.id)).toBe(false);
    expect(w.factions.blue.scrap).toBeGreaterThanOrEqual(scrap + BUILDINGS.turret.cost);
    expect(w.factions.blue.scrap).toBeLessThan(scrap + BUILDINGS.turret.cost + 30); // (a harvester may unload meanwhile)
    expect(constructing(w, "blue")).toBe(plant);
  });

  it("allows one Gantry per side, a foundation included", () => {
    const w = createSkirmishWorld();
    const hq = hqOf(w, "blue")!;
    for (const k of BUILDINGS.gantry.requiresAll!) spawnBuilding(w, k, "blue", 0, 0).tx = -100; // (tech only, off the map)
    expect(buildingBlocker(w, "blue", "gantry")).toBeNull();
    const g = spawnBuilding(w, "gantry", "blue", hq.tx, hq.ty - 10);
    g.build = 100;
    expect(buildingBlocker(w, "blue", "gantry")).toBe("One per side");
  });

  it("rejects construction it cannot afford", () => {
    const w = createSkirmishWorld();
    w.factions.blue.scrap = 100;
    const before = w.buildings.size;
    step(w, [{ type: "placeBuilding", faction: "blue", building: "airpad", tx: 8, ty: 44 }]);
    expect(w.buildings.size).toBe(before);
    expect(w.factions.blue.scrap).toBe(100);
  });
});

describe("unit production", () => {
  it("queues at a building, deducts cost, spawns next to it after build time", () => {
    const w = createSkirmishWorld();
    const hq = hqOf(w, "blue")!;
    const unitsBefore = w.units.size;
    step(w, [{ type: "produce", faction: "blue", buildingId: hq.id, unit: "harvester" }]);
    expect(w.factions.blue.scrap).toBe(ECONOMY.startingScrap - UNITS.harvester.cost);
    expect(hq.queue).toHaveLength(1);

    for (let i = 0; i < UNITS.harvester.buildTime * TICK_RATE + 1; i++) step(w, []);
    expect(hq.queue).toHaveLength(0);
    expect(w.units.size).toBe(unitsBefore + 1);
    const spawned = [...w.units.values()].at(-1)!;
    expect(spawned.kind).toBe("harvester");
    // spawned adjacent to the HQ footprint
    expect(Math.abs(spawned.x - 5.5)).toBeLessThan(6);
    expect(Math.abs(spawned.y - 41.5)).toBeLessThan(6);
  });

  it("rejects producing a unit at the wrong building type", () => {
    const w = createSkirmishWorld();
    const hq = hqOf(w, "blue")!;
    step(w, [{ type: "produce", faction: "blue", buildingId: hq.id, unit: "wasp" }]);
    expect(hq.queue).toHaveLength(0);
    expect(w.factions.blue.scrap).toBe(ECONOMY.startingScrap);
  });

  it("builds the queue strictly in order", () => {
    const w = createSkirmishWorld();
    w.factions.blue.scrap = 1000;
    const hq = hqOf(w, "blue")!;
    step(w, [
      { type: "produce", faction: "blue", buildingId: hq.id, unit: "harvester" },
      { type: "produce", faction: "blue", buildingId: hq.id, unit: "harvester" }
    ]);
    expect(hq.queue).toHaveLength(2);
    for (let i = 0; i < UNITS.harvester.buildTime * TICK_RATE + 1; i++) step(w, []);
    expect(hq.queue).toHaveLength(1); // only the head ticks down
  });
});

describe("win condition", () => {
  it("declares the winner when an HQ dies", () => {
    const w = createWorld(16, 16);
    spawnBuilding(w, "hq", "blue", 2, 2);
    const redHq = spawnBuilding(w, "hq", "red", 10, 10);
    redHq.hp = 1;
    step(w, []);
    expect(w.winner).toBeNull(); // nothing damaged it
    redHq.hp = 0;
    step(w, []);
    expect(w.winner).toBe("blue");
  });
});
