// Bütçe başlangıç kategorileri. Uygulamadan (Bütçe → Kategoriler) değiştirilebilir.
import type { Transaction } from "dexie";
import type { ExpenseCategory } from "@/types";
import { newId } from "@/lib/id";

const DEFAULTS: { name: string; emoji: string }[] = [
  { name: "Yemek", emoji: "🍽️" },
  { name: "Market", emoji: "🛒" },
  { name: "Ulaşım", emoji: "🚌" },
  { name: "Eğlence", emoji: "🎬" },
  { name: "Okul", emoji: "📚" },
  { name: "Spor", emoji: "🥋" },
  { name: "Diğer", emoji: "📦" },
];

export async function seedBudgetCategories(tx: Transaction) {
  const table = tx.table<ExpenseCategory, string>("expenseCategories");
  if ((await table.count()) > 0) return;
  await table.bulkAdd(DEFAULTS.map((c, i) => ({ id: newId(), ...c, order: i })));
}
