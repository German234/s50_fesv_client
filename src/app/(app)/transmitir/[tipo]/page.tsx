import { TransmitPending } from "./TransmitPending";

export default async function TransmitPage({ params }: PageProps<"/transmitir/[tipo]">) {
  const { tipo } = await params;
  return <TransmitPending slug={tipo} />;
}
