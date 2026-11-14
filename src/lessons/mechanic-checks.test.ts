import { expect, it } from "vitest";
import { checker } from "../check";
import type { Box } from "../engine";
import { bulletHit, carriedByPlatform, collectOnContact, steadyTravel, stompContact } from "./mechanic-checks";
import type { Check } from "../lesson";
const box = (tag: string, x: number, y = 0, w = 10, h = 10): Box => ({ tag, x, y, w, h, color: "red" });
const check = (test: Check["test"]) => checker({ goals: [{ message: "mechanic", test }], lose: [] });

it("accepts different steady speeds, rejects a teleport, and resets between runs", () => {
  const goal = steadyTravel(0, 100);
  for (const speed of [5, 10]) {
    const run = check(goal);
    let passed = false;
    for (let frame = 1; frame <= 30; frame++) passed = run([box("Player", frame * speed)]).passed;
    expect(passed).toBe(true);
  }
  const teleport = check(goal);
  for (let frame = 0; frame < 30; frame++) expect(teleport([box("Player", 100)]).passed).toBe(false);
});

it("requires coin contact and a growing logged count, without prescribing log wording", () => {
  const start = [box("Coin", 20), box("Coin", 50)];
  for (const prefix of ["coins: ", ""]) {
    const run = check(collectOnContact(() => start));
    expect(run([box("Player", 0), ...start]).passed).toBe(false);
    expect(run([box("Player", 20), start[1]], { logs: [{ level: "log", text: prefix + "1", count: 1 }] }).passed).toBe(false);
    expect(run([box("Player", 50)], { logs: [{ level: "log", text: prefix + "2", count: 1 }] }).passed).toBe(true);
  }
  expect(check(collectOnContact(() => start))([box("Player", 0)], { logs: [{ level: "log", text: "2", count: 1 }] }).passed).toBe(false);
  const noCounter = check(collectOnContact(() => [start[0]]));
  expect(noCounter([box("Player", 20)]).passed).toBe(false);
});

it("requires a travelling bullet at the disappearing enemy, including different bullet speeds", () => {
  const enemy = box("Enemy", 100);
  for (const speed of [10, 20]) {
    const run = check(bulletHit(() => [enemy]));
    run([enemy]);
    run([enemy, box("Bullet", 100 - 2 * speed)]);
    run([enemy, box("Bullet", 100 - speed)]);
    expect(run([]).passed).toBe(true);
  }
  const deletion = check(bulletHit(() => [enemy]));
  expect(deletion([]).passed).toBe(false);
  const stationary = check(bulletHit(() => [enemy]));
  stationary([enemy, box("Bullet", 100)]);
  stationary([enemy, box("Bullet", 100)]);
  expect(stationary([]).passed).toBe(false);
});

it("requires the platform to carry a supported player, rather than moving under a stationary player", () => {
  for (const speed of [2, 5]) {
    const run = check(carriedByPlatform());
    let result;
    for (let frame = 0; frame < 60; frame++) result = run([box("Player", frame * speed, 10), box("Platform", frame * speed, 0, 200)]);
    expect(result!.passed).toBe(true);
  }
  const run = check(carriedByPlatform());
  for (let frame = 0; frame < 60; frame++) expect(run([box("Player", 100, 10), box("Platform", frame, 0, 200)]).passed).toBe(false);
});

it("requires a descending contact for a stomp, not deleting the enemy remotely", () => {
  const enemy = box("Enemy", 50);
  const run = check(stompContact());
  run([box("Player", 50, 15), enemy]);
  expect(run([box("Player", 50, 8)]).passed).toBe(true);
  const remote = check(stompContact());
  remote([box("Player", 0, 15), enemy]);
  expect(remote([box("Player", 0, 8)]).passed).toBe(false);
});

it("accepts collection before movement, including the first update, without leaking contact into a restart", () => {
  const coin = box("Coin", 20);
  const goal = collectOnContact(() => [coin, box("Player", 20)]);
  const count = { logs: [{ level: "log" as const, text: "1", count: 1 }] };
  expect(check(goal)([box("Player", 40)], count).passed).toBe(true);
  const run = check(collectOnContact(() => [coin, box("Player", 0)]));
  run([coin, box("Player", 20)]);
  expect(run([box("Player", 40)], count).passed).toBe(true);
  const restart = check(collectOnContact(() => [coin, box("Player", 0)]));
  expect(restart([box("Player", 40)], count).passed).toBe(false);
});

it("accepts a descending stomp snapped to the top but not remote or upward top contact", () => {
  const enemy = box("Enemy", 50);
  const goal = stompContact();
  const run = check(goal);
  run([box("Player", 50, 15), enemy]);
  expect(run([box("Player", 50, 10)]).passed).toBe(true);
  const rising = check(goal);
  rising([box("Player", 50, 5), enemy]);
  expect(rising([box("Player", 50, 10)]).passed).toBe(false);
});
