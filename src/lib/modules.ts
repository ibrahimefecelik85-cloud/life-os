// Alttaki sekme çubuğunda görünen modüller.
// Yeni sekme eklemek için: src/app altında klasör aç + buraya bir satır ekle.
import { BookOpen, Dumbbell, ListTodo, Sun, Wallet, type LucideIcon } from "lucide-react";

export interface AppModule {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const MODULES: AppModule[] = [
  { href: "/", label: "Bugün", icon: Sun },
  { href: "/dersler", label: "Dersler", icon: BookOpen },
  { href: "/yapilacaklar", label: "Görevler", icon: ListTodo },
  { href: "/antrenman", label: "Antrenman", icon: Dumbbell },
  { href: "/butce", label: "Bütçe", icon: Wallet },
];
