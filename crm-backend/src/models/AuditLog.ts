import mongoose, { Document, Schema } from 'mongoose';

export type AuditAction = 'LEAD_CREATED' | 'LEAD_UPDATED' | 'LEAD_DELETED' | 'STATUS_CHANGED';

export interface IAuditLog extends Document {
  action: AuditAction;
  leadId: string;
  leadName: string;
  details: Record<string, unknown>;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    action: {
      type: String,
      enum: ['LEAD_CREATED', 'LEAD_UPDATED', 'LEAD_DELETED', 'STATUS_CHANGED'],
      required: true,
    },
    leadId: {
      type: String,
      required: true,
    },
    leadName: {
      type: String,
      required: true,
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

AuditLogSchema.index({ leadId: 1 });
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ action: 1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
