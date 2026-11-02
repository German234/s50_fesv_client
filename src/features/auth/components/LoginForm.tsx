"use client";

import { Button } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { safeNextPath } from "@/lib/api/authRedirect";
import { authErrorMessage } from "../errors";
import { useLoginMutation, useSignIn } from "../queries";
import { loginSchema, type LoginForm as LoginValues } from "../schemas";
import { AuthCard } from "./AuthCard";
import { AuthField } from "./AuthField";
import { FormAlert } from "./FormAlert";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const signIn = useSignIn();
  const login = useLoginMutation();
  const { control, handleSubmit, formState } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit((values) =>
    login.mutate(values, {
      onSuccess: (response) => {
        signIn(response);
        router.replace(safeNextPath(searchParams.get("next")));
      },
    }),
  );
  // Tras el éxito el botón sigue ocupado hasta que la navegación termina.
  const isBusy = login.isPending || login.isSuccess;

  return (
    <AuthCard title="Bienvenida de nuevo" description="Ingresa con tu correo corporativo.">
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
        <AuthField control={control} name="email" label="Correo" type="email" autoComplete="username" inputMode="email" />
        <AuthField
          control={control}
          name="password"
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          labelAction={
            <Link href="/recuperar" className="text-body text-accent rounded-sm underline underline-offset-2">
              ¿La olvidaste?
            </Link>
          }
        />
        {login.isError && <FormAlert status="danger">{authErrorMessage(login.error)}</FormAlert>}
        <Button
          type="submit"
          size="lg"
          fullWidth
          className="button--fiscal mt-1 h-12"
          isDisabled={!formState.isValid}
          isPending={isBusy}
        >
          {isBusy ? "Entrando…" : "Entrar"}
        </Button>
      </form>
    </AuthCard>
  );
}
