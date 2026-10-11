/**
 * Links a Dethink portal container on <body> to the component root that owns
 * it, so a modal surface (the mobile sidebar) can keep overlays opened from
 * inside it usable while it makes the rest of the page inert. A global symbol
 * key, so components copied from the registry agree without sharing imports.
 */
const PORTAL_OWNER: unique symbol = Symbol.for("dethink.portal-owner");

type OwnedElement = Element & { [PORTAL_OWNER]?: Element };

export function setDethinkPortalOwner(container: Element, owner: Element) {
  (container as OwnedElement)[PORTAL_OWNER] = owner;
}

/** The element owning a Dethink portal container, or null for any other element. */
export function getDethinkPortalOwner(element: Element): Element | null {
  return (element as OwnedElement)[PORTAL_OWNER] ?? null;
}
