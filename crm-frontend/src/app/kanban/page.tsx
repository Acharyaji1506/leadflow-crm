import { AppShell } from '@/components/layout/AppShell';
import { KanbanClient } from './KanbanClient';

export default function KanbanPage() {
  return (
    <AppShell>
      <KanbanClient />
    </AppShell>
  );
}
