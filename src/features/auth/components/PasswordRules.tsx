import { Chip } from "@heroui/react";
import { Check, X } from "lucide-react";

export interface PasswordRule {
  label: string;
  /** null mientras el campo está vacío: la regla se muestra neutra. */
  ok: boolean | null;
}

/**
 * Reglas como chips que cambian en vivo ("8 a 16 caracteres", "No coinciden"). Los campos las
 * enlazan con aria-describedby; el estado va también en texto para lectores de pantalla.
 */
export function PasswordRules({ id, rules }: { id: string; rules: PasswordRule[] }) {
  return (
    <ul id={id} className="flex flex-wrap gap-2" aria-label="Reglas de la contraseña">
      {rules.map((rule) => (
        <li key={rule.label}>
          <Chip variant="soft" color={rule.ok === null ? "default" : rule.ok ? "success" : "danger"} className="text-body gap-1.5 px-3 py-1">
            {rule.ok === false ? <X aria-hidden className="size-4" /> : <Check aria-hidden className="size-4" />}
            <Chip.Label>
              {rule.label}
              <span className="sr-only">{rule.ok === null ? " (pendiente)" : rule.ok ? " (cumple)" : " (no cumple)"}</span>
            </Chip.Label>
          </Chip>
        </li>
      ))}
    </ul>
  );
}
