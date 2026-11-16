// Tarayıcının abone olabilmesi için açık (public) VAPID anahtarını verir.
import { pushConfigured, vapidPublicKey } from "@/lib/push/send";
import { storeKind } from "@/lib/push/store";

export const dynamic = "force-dynamic";

export function GET() {
  if (!pushConfigured) {
    return Response.json({ error: "Bildirim anahtarları sunucuda ayarlanmamış (VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY)." }, { status: 503 });
  }
  return Response.json({ publicKey: vapidPublicKey, store: storeKind });
}
