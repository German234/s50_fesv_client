"use client";

import { Button } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { LOGIN_PATH } from "@/lib/api/authRedirect";
import { normalizeError } from "@/lib/api/errors";
import { toast } from "@/lib/toast";
import { AUTH_ERROR_CODES, authErrorMessage } from "../errors";
import {
  usePasswordResetConfirmMutation,
  usePasswordResetRequestMutation,
  usePasswordResetVerifyMutation,
} from "../queries";
import {
  passwordLengthOk,
  PASSWORD_MAX,
  PASSWORD_MIN,
  resetConfirmSchema,
  resetRequestSchema,
  resetVerifySchema,
  type ResetConfirmForm,
  type ResetRequestForm,
  type ResetVerifyForm,
} from "../schemas";
import { AuthCard } from "./AuthCard";
import { AuthField } from "./AuthField";
import { FormAlert } from "./FormAlert";
import { PasswordRules } from "./PasswordRules";

/** Mensaje fijo del paso 1: no revela si el correo está registrado (el backend siempre da 202). */
const CODE_SENT = "Si el correo existe, te enviamos un código de 6 dígitos. Vence en 15 minutos.";

type Step = { name: "email" } | { name: "code"; email: string } | { name: "password"; email: string; code: string };

/**
 * Recuperación en los tres pasos del backend: correo → código → nueva contraseña. El correo y el
 * código viven solo en memoria (no en la URL); al recargar se empieza de nuevo.
 */
export function RecoverFlow() {
  const [step, setStep] = useState<Step>({ name: "email" });
  // Cada paso es una tarjeta nueva; tras el primer cambio, su título recibe el foco.
  const [moved, setMoved] = useState(false);
  const go = (next: Step) => {
    setMoved(true);
    setStep(next);
  };

  if (step.name === "email") {
    return <EmailStep focusTitle={moved} onSent={(email) => go({ name: "code", email })} />;
  }
  if (step.name === "code") {
    return (
      <CodeStep
        email={step.email}
        onVerified={(code) => go({ name: "password", email: step.email, code })}
        onChangeEmail={() => go({ name: "email" })}
      />
    );
  }
  return <PasswordStep email={step.email} code={step.code} onRestart={() => go({ name: "email" })} />;
}

function SubmitButton({ label, busyLabel, isDisabled, isPending }: { label: string; busyLabel: string; isDisabled: boolean; isPending: boolean }) {
  return (
    <Button type="submit" size="lg" fullWidth className="button--fiscal mt-1 h-12" isDisabled={isDisabled} isPending={isPending}>
      {isPending ? busyLabel : label}
    </Button>
  );
}

function EmailStep({ focusTitle, onSent }: { focusTitle: boolean; onSent: (email: string) => void }) {
  const request = usePasswordResetRequestMutation();
  const { control, handleSubmit, formState } = useForm<ResetRequestForm>({
    resolver: zodResolver(resetRequestSchema),
    mode: "onTouched",
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(({ email }) => request.mutate({ email }, { onSuccess: () => onSent(email) }));

  return (
    <AuthCard
      backToLogin
      focusTitle={focusTitle}
      step="Paso 1 de 3"
      title="Recuperar contraseña"
      description="Escribe tu correo corporativo y te enviaremos un código para cambiarla."
    >
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
        <AuthField control={control} name="email" label="Correo" type="email" autoComplete="username" inputMode="email" />
        {request.isError && <FormAlert status="danger">{authErrorMessage(request.error)}</FormAlert>}
        <SubmitButton label="Enviar código" busyLabel="Enviando…" isDisabled={!formState.isValid} isPending={request.isPending} />
      </form>
    </AuthCard>
  );
}

function CodeStep({ email, onVerified, onChangeEmail }: { email: string; onVerified: (code: string) => void; onChangeEmail: () => void }) {
  const verify = usePasswordResetVerifyMutation();
  const resend = usePasswordResetRequestMutation();
  const { control, handleSubmit, formState } = useForm<ResetVerifyForm>({
    resolver: zodResolver(resetVerifySchema),
    mode: "onTouched",
    defaultValues: { code: "" },
  });

  const onSubmit = handleSubmit(({ code }) => {
    resend.reset();
    verify.mutate({ email, code }, { onSuccess: () => onVerified(code) });
  });

  const resendCode = () => {
    verify.reset();
    resend.mutate({ email });
  };

  const error = verify.error ?? resend.error;

  return (
    <AuthCard
      backToLogin
      focusTitle
      step="Paso 2 de 3"
      title="Revisa tu correo"
      description={
        <>
          Escribe el código que enviamos a <span className="text-foreground font-medium">{email}</span>.
        </>
      }
    >
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
        {!error && <FormAlert status="accent">{resend.isSuccess ? `Pedimos un código nuevo. ${CODE_SENT}` : CODE_SENT}</FormAlert>}
        <AuthField
          control={control}
          name="code"
          label="Código de 6 dígitos"
          autoComplete="one-time-code"
          inputMode="numeric"
          maxLength={6}
          inputClassName="font-mono text-[18px] tracking-[0.4em]"
        />
        {error && <FormAlert status="danger">{authErrorMessage(error)}</FormAlert>}
        <SubmitButton label="Verificar código" busyLabel="Verificando…" isDisabled={!formState.isValid} isPending={verify.isPending} />
        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="ghost" size="sm" onPress={resendCode} isPending={resend.isPending} isDisabled={verify.isPending}>
            Enviar otro código
          </Button>
          <Button variant="ghost" size="sm" onPress={onChangeEmail} isDisabled={verify.isPending || resend.isPending}>
            Usar otro correo
          </Button>
        </div>
      </form>
    </AuthCard>
  );
}

function PasswordStep({ email, code, onRestart }: { email: string; code: string; onRestart: () => void }) {
  const router = useRouter();
  const rulesId = useId();
  const confirm = usePasswordResetConfirmMutation();
  const { control, handleSubmit, formState } = useForm<ResetConfirmForm>({
    resolver: zodResolver(resetConfirmSchema),
    mode: "onChange",
    defaultValues: { email, newPassword: "", confirmPassword: "" },
  });
  const [newPassword, confirmPassword] = useWatch({ control, name: ["newPassword", "confirmPassword"] });

  const onSubmit = handleSubmit((values) =>
    confirm.mutate(
      { email, code, newPassword: values.newPassword },
      {
        onSuccess: () => {
          toast.success("Contraseña actualizada");
          router.replace(LOGIN_PATH);
        },
      },
    ),
  );

  const codeExpired = confirm.isError && normalizeError(confirm.error).code === AUTH_ERROR_CODES.resetCodeInvalid;
  const matches = confirmPassword === "" ? null : newPassword === confirmPassword;
  const isBusy = confirm.isPending || confirm.isSuccess;

  return (
    <AuthCard backToLogin focusTitle step="Paso 3 de 3" title="Cambiar contraseña" description="Define una nueva contraseña para tu cuenta.">
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
        <AuthField control={control} name="email" label="Correo" type="email" autoComplete="username" isReadOnly />
        <AuthField
          control={control}
          name="newPassword"
          label="Nueva contraseña"
          type="password"
          autoComplete="new-password"
          maxLength={PASSWORD_MAX}
          describedBy={rulesId}
          showError={false}
        />
        <AuthField
          control={control}
          name="confirmPassword"
          label="Confirmar contraseña"
          type="password"
          autoComplete="new-password"
          maxLength={PASSWORD_MAX}
          describedBy={rulesId}
          showError={false}
        />
        <PasswordRules
          id={rulesId}
          rules={[
            { label: `${PASSWORD_MIN} a ${PASSWORD_MAX} caracteres`, ok: newPassword === "" ? null : passwordLengthOk(newPassword) },
            { label: matches === false ? "No coinciden" : "Coinciden", ok: matches },
          ]}
        />
        {confirm.isError && (
          <FormAlert status="danger">
            {authErrorMessage(confirm.error)}
            {codeExpired && (
              <Button variant="ghost" size="sm" className="mt-2 -ms-2" onPress={onRestart}>
                Pedir un código nuevo
              </Button>
            )}
          </FormAlert>
        )}
        <SubmitButton label="Guardar contraseña" busyLabel="Guardando…" isDisabled={!formState.isValid} isPending={isBusy} />
      </form>
    </AuthCard>
  );
}
