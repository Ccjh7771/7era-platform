import "server-only";

import type { AdminProfile } from "@/lib/admin/access";
import { createAdminClient } from "@/lib/supabase/admin";

type AuditMetadataValue = string | number | boolean | null;

type RecordAdminAuditInput = {
  actor: AdminProfile;
  action: string;
  targetType: string;
  targetId?: string | null;
  summary: string;
  metadata?: Record<string, AuditMetadataValue>;
};

export async function recordAdminAudit({
  actor,
  action,
  targetType,
  targetId = null,
  summary,
  metadata = {},
}: RecordAdminAuditInput) {
  const { error } = await createAdminClient()
    .from("admin_audit_logs")
    .insert({
      actor_id: actor.id,
      actor_name: actor.fullName,
      actor_role: actor.role,
      action,
      target_type: targetType,
      target_id: targetId,
      summary,
      metadata,
    });

  if (error) {
    console.error("Unable to record administrator audit event:", error.message);
  }
}
