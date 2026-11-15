# Life OS

Günlük işleri tek yerden yönetmek için kişisel web uygulaması: dersler, ödev/sınav takibi, yapılacaklar,
hava durumu; sırada antrenman, bütçe ve kulüp.

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
│   ├── antrenman/       #   /antrenman     (Aşama 2)
│   ├── butce/           #   /butce         (Aşama 2)
│   └── ayarlar/         #   /ayarlar       Yedekleme
├── components/
│   ├── ui/              # Genel parçalar: Card, Button, Modal, Form...
│   └── layout/          # Alt sekme çubuğu, sayfa başlığı
├── features/            # Her modül kendi klasöründe
│   ├── courses/         #   api.ts (veri işlemleri) · hooks.ts (veri okuma) · components/
│   ├── todos/
│   ├── weather/
│   ├── today/           #   Bugün ekranının kartları
│   └── backup/
├── hooks/               # Ortak hook'lar (useNow)
├── lib/                 # db.ts (veritabanı), dates.ts, labels.ts, modules.ts (sekme listesi)...
└── types/               # Veri tipleri
```

## Yeni bir sekme eklemek

1. `src/types/index.ts` içine veri tipini ekle.
2. `src/lib/db.ts` içinde yeni bir `this.version(N).stores({...})` ile tabloyu ekle (eski sürümleri silme).
3. `src/features/<modül>/` altında `api.ts`, `hooks.ts`, `components/` oluştur.
4. `src/app/<url>/page.tsx` sayfasını oluştur.
5. `src/lib/modules.ts` listesine bir satır ekle → alttaki sekme çubuğunda görünür.

## Yol haritası

- [x] **Aşama 1:** Kurulum, Bugün ekranı, Dersler, Yapılacaklar, hava durumu, yedekleme, günlük rutin, aylık takvim
- [ ] **Aşama 2:** Antrenman (program, set/tekrar/ağırlık, ilerleme grafiği) ve Bütçe
- [ ] **Aşama 3:** Kulüp, PWA (telefona yükleme), rutin bildirimleri (iPhone), Vercel deploy
