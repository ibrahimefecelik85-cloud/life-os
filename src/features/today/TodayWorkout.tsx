// Bugünkü antrenman kartı. Aşama 2'de Antrenman modülüne bağlanacak.
import { Dumbbell } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function TodayWorkout() {
  return (
    <Card title="Bugünkü antrenman" icon={<Dumbbell size={16} />}>
      <p className="text-sm text-ink-500">Antrenman modülü Aşama 2&apos;de eklenecek.</p>
    </Card>
  );
}
