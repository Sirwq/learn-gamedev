---
title: Define automatic collision checks for objects with a collision component
label: wayfinder:grilling
status: open
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

## Blocked

This is a `wayfinder:grilling` decision ticket. The Grilling workflow requires the student's product decisions before resolving its dependent API, timing, and compatibility details. The current engine has no built-in collision or physics; Course Lessons write their own overlap checks, and Sandbox Level boxes have no collider field. Asked for decisions on (1) overlap notifications alone versus physical blocking too, and (2) opt-in components versus automatic defaults. Once those are answered, continue the design tree, write the build-ready follow-up ticket, and close this decision ticket.
