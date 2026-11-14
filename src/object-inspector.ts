import type { ObjectSnapshot } from "./object-snapshots";
import { t } from "./i18n";

const selectedObject = (objects: readonly ObjectSnapshot[], id: string | undefined) =>
  objects.find((object) => object.id === id);

/** A missing runtime selection stays missing until the student chooses another row or stops. */
const nextSelection = (current: string | undefined, objects: readonly ObjectSnapshot[], reset = false) =>
  reset || !current ? objects[0]?.id : current;

const builtInImages = new Set(["Player", "Ground", "Platform", "Wall", "Water", "Spikes", "Coin", "Enemy", "Flag", "Bullet", "Box"]);
const number = (n: number) => Number.isFinite(n) ? String(Math.round(n * 100) / 100) : String(n);

/** Read-only Lesson / Project view. Existing list buttons are reused during live frames. */
export function objectInspector(list: HTMLElement, details: HTMLElement, art: () => Record<string, unknown> = () => ({})) {
  let objects: ObjectSnapshot[] = [];
  let selected: string | undefined;
  const buttons = new Map<string, HTMLButtonElement>();

  function renderDetails() {
    const object = selectedObject(objects, selected);
    if (!object) {
      details.textContent = objects.length ? (selected ? t("The selected object no longer exists. Select another object.") : t("Select an object to inspect it.")) : t("This Level has no objects yet.");
      return;
    }
    const line = (label: string, value: string) => {
      const row = document.createElement("div");
      const name = document.createElement("dt"), description = document.createElement("dd");
      name.textContent = label;
      description.textContent = value;
      row.append(name, description);
      return row;
    };
    const dl = (...rows: HTMLElement[]) => {
      const list = document.createElement("dl");
      list.append(...rows);
      return list;
    };
    const colour = line(t("Colour"), object.color);
    const swatch = document.createElement("span");
    swatch.className = "object-swatch";
    swatch.style.backgroundColor = object.color;
    swatch.ariaHidden = "true";
    colour.querySelector("dd")!.prepend(swatch);
    const heading = (text: string) => Object.assign(document.createElement("h3"), { textContent: text });
    const hint = document.createElement("p");
    hint.innerHTML = t("<code>this.transform.position</code> gives x and y; <code>this.gameObject.tag</code> is the tag; <code>this.gameObject.w</code> / <code>h</code> give the box size.");
    details.replaceChildren(heading(object.tag), dl(line(t("Tag"), object.tag)),
      heading(t("Transform")), dl(line(t("Position x"), number(object.x)), line(t("Position y"), number(object.y))),
      heading(t("Box / hitbox")), dl(line(t("Width"), number(object.w)), line(t("Height"), number(object.h))),
      dl(line(t("Contact notifications"), object.collider ? t("Enabled") : t("Disabled"))),
      heading(t("Script")), dl(line(t("Attached"), object.script ? `${object.script}.ts` : t("No Script"))),
      heading(t("Appearance")), dl(colour, line(t("Image"), Object.hasOwn(art(), object.tag) ? t("Project image") : builtInImages.has(object.tag) ? t("Built-in image") : t("No image"))),
      heading(t("In code")), hint);
  }
  function select(id: string) {
    selected = id;
    for (const [key, button] of buttons) button.setAttribute("aria-current", key === id ? "true" : "false");
    renderDetails();
  }
  list.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const row = (event.target as Element).closest("button");
    const all = [...list.querySelectorAll("button")];
    const index = all.indexOf(row as HTMLButtonElement);
    if (index < 0) return;
    event.preventDefault();
    (all[Math.max(0, Math.min(all.length - 1, index + (event.key === "ArrowDown" ? 1 : -1)))] as HTMLButtonElement).focus();
    (document.activeElement as HTMLButtonElement).click();
  });
  return {
    setObjects(next: ObjectSnapshot[], reset = false) {
      objects = next;
      selected = nextSelection(selected, next, reset);
      const ids = new Set(next.map((object) => object.id));
      const focusedId = [...buttons].find(([, button]) => button === document.activeElement)?.[0];
      for (const [id, button] of buttons) if (!ids.has(id)) (button.parentElement?.remove(), buttons.delete(id));
      for (const object of next) {
        let button = buttons.get(object.id);
        if (!button) {
          button = document.createElement("button");
          button.type = "button";
          button.onclick = () => select(object.id);
          buttons.set(object.id, button);
        }
        const label = `${object.tag} · ${object.id.replace(":", " #")}`;
        if (button.textContent !== label) button.textContent = label;
        button.setAttribute("aria-current", object.id === selected ? "true" : "false");
        if (!button.parentElement) {
          const item = document.createElement("li");
          item.append(button);
          list.append(item);
        }
      }
      if (focusedId && !ids.has(focusedId)) {
        (buttons.get(selected ?? "") ?? buttons.values().next().value ?? list).focus();
      }
      renderDetails();
    },
  };
}
