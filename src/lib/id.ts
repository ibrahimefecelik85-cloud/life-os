// Her kayıt için benzersiz bir kimlik (id) üretir.
// crypto.randomUUID sadece https/localhost'ta çalışır; telefondan yerel ağ
// üzerinden (http://192.168...) test ederken yedek yöntem devreye girer.
export function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}
