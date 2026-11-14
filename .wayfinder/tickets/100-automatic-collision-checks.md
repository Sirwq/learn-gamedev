---
title: Define automatic collision checks for objects with a collision component
label: wayfinder:grilling
status: closed
blocked_by: []
assignee:
---

## When

Later.

## Question

Objects currently have boxes and Lessons can call overlap helpers, but the student API does not expose a collision component. Decide what attaching a collision component means before building automatic checks.

## Decisions needed

- Which objects get the component by default, and can a student add or remove it in the Level editor?
- Does a collision mean overlap notification, physical blocking, or both? Which Script callback receives it, and once per contact or every frame?
- How do moving, spawned, destroyed, and overlapping objects behave? How do trigger objects and Course Lessons retain their current behavior?

## Done when

- A build-ready follow-up ticket specifies the component, student-facing API, event timing, editor controls, compatibility with existing Lessons, and a small test Level with expected collisions.

## Resolution

2026-11-14: The user chose **opt-in contact notifications first**. Sandbox objects explicitly enable a box trigger; both participants must opt in. Contact callbacks notify scripts without blocking movement or adding physics. Existing Lessons and Projects remain disabled by default.

Implementation details and acceptance checks are specified in [101 — Opt-in contact notifications](101-opt-in-contact-notifications.md): Enter/Stay/Exit callbacks, post-Update detection, stable pair identity, spawn/destroy rules, editor controls, save/export compatibility, and a small test Level.

This closes the design decision only. Implementation remains open in ticket 101.
