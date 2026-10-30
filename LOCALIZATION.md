# Adding a language

English is the only shipped locale. The interface catalog is `english` in `src/i18n.ts`; fixed HTML labels are listed in `src/static-messages.ts`. Every missing message falls back to its English text.

Create a catalog that satisfies the `Catalog` type, then register it in `catalogs` in `src/i18n.ts`. The app will accept the saved locale or the browser's language only after that registration. A language picker appears automatically when a second catalog ships. Keep named placeholders such as `{number}` and `{total}` in translations. `t.count` selects forms with `Intl.PluralRules` for the active locale. For languages with `few`, `many`, or `zero` forms, put them in `plurals` under the singular English key; any missing form falls back to English.

Use the `lessons` map for learning content, keyed by each Lesson's original English `title`. Fields may be omitted; they fall back individually to English. `hints`, `goals`, and `lose` arrays use the English item's position. Keep Markdown links, code fences, and code identifiers intact. Use the `docs` map for a full page (keyed by the canonical page title) or a generated API member's prose (for example, `GameObject.Find.text` and `GameObject.Find.unity`). The generated signatures and examples stay in English code.

Achievement titles and descriptions can be supplied in the `achievements` map, keyed by the existing achievement id.

The English Lesson title remains the identity used by progress, hints, snapshots, backups, and navigation. The localized title is display text only. Project IDs and names remain saved as the student created them. Avoid translating Script names, tags, sound names, and shortcuts.
