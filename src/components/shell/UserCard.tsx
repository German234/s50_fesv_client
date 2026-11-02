"use client";

import { Avatar, Button, Skeleton, Tooltip } from "@heroui/react";
import { LogOut } from "lucide-react";
import { useSession } from "@/features/auth/queries";
import { initials } from "@/lib/format";

/** Tarjeta del usuario de la sesión: iniciales, nombre, rol y cerrar sesión. */
export function UserCard() {
  const { user, isLoading, signOut } = useSession();
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "";

  return (
    <div className="flex items-center gap-2.5 rounded-card bg-surface p-2.5 shadow-surface">
      {isLoading || !user ? (
        <>
          <Skeleton className="size-9 rounded-full" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-3 w-20 rounded-md" />
          </div>
        </>
      ) : (
        <>
          <Avatar color="accent" variant="soft" className="size-9">
            <Avatar.Fallback>{initials(name)}</Avatar.Fallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-heading" title={user.email}>
              {name}
            </span>
            <span className="truncate text-small text-muted">{user.role.name}</span>
          </div>
        </>
      )}
      <Tooltip delay={300}>
        <Button isIconOnly variant="secondary" aria-label="Cerrar sesión" className="size-[34px] min-w-0 rounded-full" onPress={signOut}>
          <LogOut aria-hidden className="size-4" />
        </Button>
        <Tooltip.Content>Cerrar sesión</Tooltip.Content>
      </Tooltip>
    </div>
  );
}
