// Panel derecho del login y la recuperación (B · Login). Decorativo: aria-hidden y colores fijos,
// es oscuro en ambos temas. Los números de control mezclan SV y DO, igual que la captura.
const ROWS = [
  { code: "DTE-01-M001P001-000000000000118", fade: 0.35 },
  { code: "E310000004607", fade: 0.35 },
  { code: "DTE-03-M001P001-000000000000084", fade: 0.35 },
  { code: "E320000009911", fade: 0.4 },
  { code: "DTE-05-M001P001-000000000000039", fade: 0.45 },
  { code: "DTE-01-M001P001-000000000000121", fade: 0.75 },
  { code: "E340000000041", fade: 0.8 },
  { code: "DTE-14-M001P001-000000000000067", fade: 0.85 },
] as const;

export function AuthPanel() {
  return (
    <div
      aria-hidden
      className="m-4 hidden flex-col justify-between overflow-hidden rounded-[28px] bg-[#18181b] p-10 text-[#fafafa] select-none lg:flex"
    >
      <ul className="flex flex-col gap-2 font-mono text-[13px]">
        {ROWS.map((row) => (
          <li key={row.code} className="flex items-center justify-between px-3 py-2" style={{ opacity: row.fade }}>
            <span className="text-[#a1a1aa]">{row.code}</span>
            <span className="rounded-full bg-[#4ade80]/10 px-2 py-0.5 font-sans text-[11px] font-semibold text-[#4ade80]">
              ACEPTADO
            </span>
          </li>
        ))}
        <li className="flex items-center justify-between rounded-xl bg-[#27272a] px-3 py-2.5">
          <span>DTE-01-M001P001-000000000000122</span>
          <span className="rounded-full bg-[#0f2747] px-2 py-0.5 font-sans text-[11px] font-semibold text-[#8ec2ff]">
            EN PROCESO
          </span>
        </li>
      </ul>
      <div className="max-w-[480px]">
        <p className="text-[32px] leading-[1.15] font-bold tracking-tight">Cada documento, transmitido una vez y con certeza.</p>
        <p className="mt-4 text-[15px] leading-relaxed text-[#a1a1aa]">
          De Sage 50 a Hacienda o la DGII: revisa, firma, transmite y conserva la respuesta de cada comprobante.
        </p>
      </div>
    </div>
  );
}
