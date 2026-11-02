import type { MenuNode, MenuOrderBody } from "./api";

/** Orden local del árbol: lo que se envía a PUT /menus/order (todos los menús y submenús). */
export type MenuOrder = { id: number; submenuIds: number[] }[];

export function orderFromTree(tree: MenuNode[]): MenuOrder {
  return tree.map((menu) => ({ id: menu.id, submenuIds: menu.submenus.map((submenu) => submenu.id) }));
}

/**
 * Ajusta un orden local al árbol actual (p. ej. tras crear un menú o un submenú mientras había
 * cambios de orden sin guardar): conserva el orden de lo conocido, descarta lo que ya no existe
 * y agrega lo nuevo al final, como lo hace el servidor.
 */
export function reconcileOrder(order: MenuOrder, tree: MenuNode[]): MenuOrder {
  const byId = new Map(tree.map((menu) => [menu.id, menu]));
  const known = order.filter((entry) => byId.has(entry.id));
  const result = known.map((entry) => {
    const serverIds = (byId.get(entry.id) as MenuNode).submenus.map((submenu) => submenu.id);
    const kept = entry.submenuIds.filter((id) => serverIds.includes(id));
    return { id: entry.id, submenuIds: [...kept, ...serverIds.filter((id) => !kept.includes(id))] };
  });
  const knownIds = new Set(known.map((entry) => entry.id));
  for (const menu of tree) {
    if (!knownIds.has(menu.id)) result.push({ id: menu.id, submenuIds: menu.submenus.map((submenu) => submenu.id) });
  }
  return result;
}

/** Cuántos menús y submenús quedaron en otra posición respecto del árbol guardado. */
export function countMoved(order: MenuOrder, tree: MenuNode[]): number {
  const saved = orderFromTree(tree);
  let moved = 0;
  order.forEach((entry, index) => {
    const savedIndex = saved.findIndex((s) => s.id === entry.id);
    if (savedIndex !== index) moved++;
    const savedSubs = saved[savedIndex]?.submenuIds ?? [];
    entry.submenuIds.forEach((id, subIndex) => {
      if (savedSubs[subIndex] !== id) moved++;
    });
  });
  return moved;
}

/** Copia de la lista con el elemento `index` desplazado `delta` posiciones (si se puede). */
export function moveItem<T>(list: readonly T[], index: number, delta: -1 | 1): T[] {
  const target = index + delta;
  if (index < 0 || target < 0 || target >= list.length) return [...list];
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function toOrderBody(order: MenuOrder): MenuOrderBody {
  return { menus: order.map((entry) => ({ id: entry.id, submenuIds: entry.submenuIds })) };
}
