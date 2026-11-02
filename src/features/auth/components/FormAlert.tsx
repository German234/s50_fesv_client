import { Alert } from "@heroui/react";
import type { ReactNode } from "react";

/** Aviso dentro del formulario. `danger` se anuncia de inmediato (role="alert"); el resto, sin interrumpir. */
export function FormAlert({ status, children }: { status: "danger" | "accent"; children: ReactNode }) {
  return (
    <div role={status === "danger" ? "alert" : "status"}>
      <Alert status={status}>
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Description>{children}</Alert.Description>
        </Alert.Content>
      </Alert>
    </div>
  );
}
