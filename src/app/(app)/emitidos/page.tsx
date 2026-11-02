import { PendingScreen } from "@/components/shell/PendingScreen";
import { getCountryTexts } from "@/config/country";

export default function IssuedPage() {
  const { authority } = getCountryTexts();
  return (
    <PendingScreen
      title="Documentos emitidos"
      subtitle={`Todo lo transmitido a ${authority}, con su respuesta y su estado en Sage 50.`}
      stage="Emitidos"
    />
  );
}
