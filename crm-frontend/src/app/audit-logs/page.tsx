import { AppShell } from '@/components/layout/AppShell';
import { AuditLogsClient } from './AuditLogsClient';

export default function AuditLogsPage() {
  return (
    <AppShell>
      <AuditLogsClient />
    </AppShell>
  );
}
