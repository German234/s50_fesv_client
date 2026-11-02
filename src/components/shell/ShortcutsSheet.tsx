"use client";

import { Kbd, Modal } from "@heroui/react";
import { formatCombo, type ShortcutDefinition, useIsMac, useRegisteredShortcuts } from "@/lib/hooks";
import { useUiStore } from "@/stores";

/** Esc lo maneja cada overlay (React Aria), no el registro; se lista igual. */
const ESCAPE: ShortcutDefinition = { id: "overlay.close", combo: "escape", description: "Cerrar drawer, modal o paleta", group: "General" };

/** Hoja "?": los atajos registrados ahora mismo, agrupados. */
export function ShortcutsSheet() {
  const open = useUiStore((state) => state.shortcutsOpen);
  const setOpen = useUiStore((state) => state.setShortcutsOpen);

  return (
    <Modal>
      <Modal.Backdrop isOpen={open} onOpenChange={setOpen}>
        <Modal.Container size="md">
          <Modal.Dialog className="rounded-modal">
            <Modal.CloseTrigger aria-label="Cerrar atajos" />
            <Modal.Header>
              <Modal.Heading className="text-title">Atajos de teclado</Modal.Heading>
              <p className="text-small text-muted">No funcionan mientras escribes en un campo.</p>
            </Modal.Header>
            <Modal.Body>{open && <ShortcutList />}</Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

function ShortcutList() {
  const isMac = useIsMac();
  const shortcuts = [...useRegisteredShortcuts(), ESCAPE];
  const groups = [...new Set(shortcuts.map((s) => s.group))];

  return (
    <div className="flex flex-col gap-4 pb-2">
      {groups.map((group) => (
        <section key={group} className="flex flex-col gap-1">
          <h3 className="text-small text-muted">{group}</h3>
          <dl className="flex flex-col">
            {shortcuts
              .filter((s) => s.group === group)
              .map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-4 border-b border-separator py-2 last:border-0">
                  <dt>{s.description}</dt>
                  <dd className="flex gap-1">
                    {formatCombo(s.combo, isMac).map((key) => (
                      <Kbd key={key} className="min-w-6 justify-center text-[12px]">
                        {key}
                      </Kbd>
                    ))}
                  </dd>
                </div>
              ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
