---
title: Add opt-in contact notifications to Sandbox objects
label: build
status: open
blocked_by: [100-automatic-collision-checks]
assignee:
---

## What

Add an optional box trigger to Sandbox objects. When two opted-in boxes overlap, notify their scripts. Do not move either object, resolve penetration, add gravity, or change velocity. Existing lessons continue teaching handwritten collision checks.

## Component and student API

- Add `collider?: boolean` to the saved Level Box / Prefab. Missing or false means no collider. Both objects must opt in; an object without a script can still be detected.
- Use the existing axis-aligned object box as the trigger shape. No separate offset, size, layer, Rigidbody, solid/trigger selector, or component framework.
- Expose a stable `Collider2D` wrapper with read-only `gameObject` and `transform` references. `GameObject.collider` is a read-only `Collider2D | null`; enablement is chosen when creating the object, not changed during Run in this first version.
- Optional MonoBehaviour callbacks: `OnTriggerEnter2D(other: Collider2D)`, `OnTriggerStay2D(other: Collider2D)`, `OnTriggerExit2D(other: Collider2D)`. Include the type in the runtime globals and editor API declarations.
- Explain in EN/RU Docs: these are the tutor's box-contact notifications, not Unity's complete physics system. Unlike Unity physics, this tutor requires no Rigidbody2D. A coin example checks `other.gameObject.tag` and calls `Destroy(other.gameObject)`.
- `Instantiate({ ..., collider: true }, position)` copies the setting. New objects and existing content default to disabled; do not automatically enable Player, Coin, Enemy or terrain.

## Timing and lifecycle

- One detection pass per simulation step, after all ordinary Updates and before OnGUI and lesson checks. Keep the worker and exported HTML on the same engine path.
- Snapshot eligible live objects and their positions for that pass. Objects created during a step join detection only after Start has run, on the next step. Initial Level overlaps generate Enter on the first step, after Start and Update.
- Strict positive-area rectangle overlap: touching edges or corners is not contact. Zero-area boxes never overlap. No swept collision: an object that passes completely through another between steps does not notify; document that limit.
- Identify pairs by object identity, never tags. Duplicate tags and multiple contacts remain distinct. Process unordered pairs in stable creation order, dispatching to the older object before the newer object. No self-contact.
- New pair: Enter once for each live scripted participant. Continuing pair: Stay once per step, starting the step after Enter. Separated pair: Exit once for each live scripted participant. No Enter and Stay for the same pair in one step.
- Callback movement does not recompute the current contact snapshot; it affects detection next step. New objects created by callbacks wait until Start on the next step.
- Before dispatch, skip destroyed recipients. If a callback destroys the other participant, suppress further Enter/Stay for that pair in the current pass. If a previously active pair loses an object, the surviving participant receives one Exit on the next detection pass; the `other` wrapper can refer to a destroyed object. Never call a destroyed script, and do not emit duplicate Exit.
- A callback exception uses the normal Run error reporting and stops that Run; no swallowed errors. Preserve existing Update behavior outside this new notification pass.
- Stop / new Run clears all pair state. Pausing advances neither detection nor callbacks.

## Editor, persistence, and compatibility

- In the stopped Sandbox Level inspector, add a labelled keyboard-accessible EN/RU checkbox: “Contact notifications”. Explain that both objects need it and that it does not stop movement. Disable editing during Run like existing fields.
- Preserve the field through object add/duplicate, undo/redo, Level code output, project save/reload/duplicate, backup, editable export/import and playable HTML export. Show enabled/disabled read-only in Objects, without adding live event logs to the inspector.
- Validate the optional field as boolean at project import and any Level-code input boundary. Reject malformed input before replacing data. Legacy files with no field load as disabled.
- Bump the portable project format version to 2 for exported files, accept versions 1 and 2, and reject unsupported versions. This stops older apps silently loading a collider-dependent game without its contacts. Keep outer backup handling consistent with embedded project versions; do not discard unrelated valid data on an unsupported import.
- Do not rewrite lesson scripts, references, goals, or existing project data to enable the feature. Lessons 1–21 and Sandbox projects without colliders retain behavior. Existing renderer output and hitbox dimensions do not change.

## Small test Level

Player A: `(0, 0, 20, 20)`, Coin B: `(30, 0, 20, 20)`, Decoration C overlapping B but without a collider. A and B opt in; attach recording scripts to A and B.

1. At A.x = 10, edges touch: no event.
2. At A.x = 11: one Enter on A and B; nothing for C.
3. Keep that position for two steps: two Stay calls per participant, no repeated Enter.
4. Move A.x back to 0: one Exit per participant; no additional Exit next step.
5. Repeat with B having no script: A still receives events. With either collider disabled, neither receives events.
6. Repeat with two identical Coin tags: independent pair identities and event counts.
7. Destroy B from A's Enter: B receives no subsequent callback; A receives one Exit next step. Test destruction during Update, callback spawning, callback movement, initial overlap and new-Run reset separately.

## Done when

- Focused engine tests cover the above event counts, order, destruction, spawning, restart, and unchanged non-collider behavior. Tests verify no position/velocity changes are introduced by detection.
- Persistence tests round-trip the flag through save/export/import, cover a legacy file and malformed values/version rejection, and preserve existing projects on failure.
- Desktop browser checks: keyboard toggle with undo/redo; save/reload; Player collects a trigger Coin; an old lesson still works; exported standalone game has the same contact behavior. EN/RU labels and Docs are checked.
- `npm run typecheck`, `npm test`, and production build pass. Independent review passes before commit/push.

This is a build specification only. No runtime implementation is included in decision ticket 100.
