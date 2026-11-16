# Life OS

Günlük işleri tek yerden yönetmek için kişisel web uygulaması: dersler, ödev/sınav takibi, yapılacaklar,
hava durumu, günlük rutin, takvim, bütçe ve kulüp.

**Teknolojiler:** Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Dexie (IndexedDB) · date-fns · lucide-react

Veriler **sadece tarayıcında** (IndexedDB) saklanır; sunucu veya veritabanı yok. Ayarlar sayfasından yedek
alabilir / yükleyebilirsin.

## Çalıştırma

Gerekenler: [Node.js](https://nodejs.org) 20 veya üstü.

```bash
npm install      # paketleri kur (ilk seferde)
npm run dev      # geliştirme sunucusu → http://localhost:3000
```

Diğer komutlar:

```bash
npm run build    # üretim derlemesi (hata var mı kontrol eder)
npm run start    # derlenmiş sürümü çalıştır
npm run lint     # kod kalitesi kontrolü
```

## Klasör yapısı

```
src/
├── app/                 # Sayfalar (her klasör = bir URL)
│   ├── page.tsx         #   /              Bugün
│   ├── dersler/         #   /dersler
│   ├── takvim/          #   /takvim        Aylık takvim
│   ├── rutin/           #   /rutin         Günlük rutin yönetimi
│   ├── yapilacaklar/    #   /yapilacaklar
│   ├── kulup/           #   /kulup         Kulüp (etkinlikler, gelişmeler, görevler)
│   ├── butce/           #   /butce         Bütçe
│   └── ayarlar/         #   /ayarlar       Yedekleme
├── components/
│   ├── ui/              # Genel parçalar: Card, Button, Modal, Form...
│   └── layout/          # Alt sekme çubuğu, sayfa başlığı
├── features/            # Her modül kendi klasöründe
│   ├── courses/         #   api.ts (veri işlemleri) · hooks.ts (veri okuma) · components/
│   ├── todos/
│   ├── club/            #   kulüp etkinlikleri ve gelişmeler
│   ├── budget/          #   harcamalar, kategoriler, grafikler
│   ├── weather/
│   ├── today/           #   Bugün ekranının kartları
│   └── backup/
├── hooks/               # Ortak hook'lar (useNow)
├── lib/                 # db.ts (veritabanı), dates.ts, labels.ts, modules.ts (sekme listesi)...
└── types/               # Veri tipleri
```

## Rutin bildirimleri (iPhone)

Saati gelen ve tiklenmemiş rutinler için telefona bildirim gider; tiklenen rutin için o gün bir daha gitmez.
Akış: telefon → `/api/push/sync` (rutinler + bugün tiklenenler) → Upstash Redis ← `/api/push/cron` (cron-job.org, 15 dk'da bir) → Web Push.

Kurulum (bir kerelik):
1. Vercel → proje → **Storage** → **Upstash for Redis** oluştur ve projeye bağla (`KV_REST_API_URL`, `KV_REST_API_TOKEN` kendiliğinden eklenir).
2. `npx web-push generate-vapid-keys` ile anahtar üret; Vercel → **Settings → Environment Variables**'a `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `CRON_SECRET` ekle (bkz. `.env.example`). Sonra **Redeploy**.
3. cron-job.org'da 15 dakikada bir `https://<adres>/api/push/cron` çağıran bir iş oluştur, başlık: `Authorization: Bearer <CRON_SECRET>`.
4. iPhone: Safari → Paylaş → Ana Ekrana Ekle → uygulamayı ana ekrandan aç → Ayarlar → **Bildirimleri aç** → **Deneme bildirimi**.

## Yeni bir sekme eklemek

1. `src/types/index.ts` içine veri tipini ekle.
2. `src/lib/db.ts` içinde yeni bir `this.version(N).stores({...})` ile tabloyu ekle (eski sürümleri silme).
3. `src/features/<modül>/` altında `api.ts`, `hooks.ts`, `components/` oluştur.
4. `src/app/<url>/page.tsx` sayfasını oluştur.
5. `src/lib/modules.ts` listesine bir satır ekle → alttaki sekme çubuğunda görünür.

## Yol haritası

- [x] **Aşama 1:** Kurulum, Bugün ekranı, Dersler, Yapılacaklar, hava durumu, yedekleme, günlük rutin, aylık takvim
- [x] **Aşama 2:** Bütçe (harcama girişi, kategoriler, aylık limit, kategori ve günlük grafikler)
- [x] **Aşama 3:** Kulüp, PWA (telefona yükleme), rutin bildirimleri (iPhone), Vercel deploy
