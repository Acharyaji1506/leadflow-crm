'use client';
import { useState, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { Plus, GripVertical, Mail, Building2 } from 'lucide-react';
import { Lead, LeadStatus } from '@/types';
import { LEAD_STATUSES, STATUS_CONFIG } from '@/constants';
import { LeadScore } from '@/components/common/LeadScore';
import { StatusBadge } from '@/components/common/StatusBadge';
import { KanbanCardSkeleton } from '@/components/common/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDate } from '@/utils/cn';

/* ─── Draggable Card ─────────────────────────────────────────────────────── */
function KanbanCard({
  lead,
  onView,
}: {
  lead: Lead;
  onView: (lead: Lead) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: lead._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-card border border-border rounded-xl p-3 shadow-sm cursor-pointer hover:shadow-md hover:border-border/80 transition-all group"
      onClick={() => onView(lead)}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
            {lead.name.charAt(0).toUpperCase()}
          </div>
          <p className="text-sm font-medium text-foreground truncate">{lead.name}</p>
        </div>
        <div
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-0.5"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>
      </div>

      <div className="space-y-1 mb-2.5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Building2 className="w-3 h-3 shrink-0" />
          <span className="truncate">{lead.company}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Mail className="w-3 h-3 shrink-0" />
          <span className="truncate">{lead.email}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <LeadScore score={lead.score} size="sm" />
        <span className="text-[10px] text-muted-foreground">{formatDate(lead.createdAt)}</span>
      </div>
    </div>
  );
}

/* ─── Column ─────────────────────────────────────────────────────────────── */
function KanbanColumn({
  status,
  leads,
  isLoading,
  onView,
  onAddLead,
}: {
  status: LeadStatus;
  leads: Lead[];
  isLoading: boolean;
  onView: (lead: Lead) => void;
  onAddLead: () => void;
}) {
  const config = STATUS_CONFIG[status];

  return (
    <div className="flex flex-col w-72 shrink-0">
      {/* Column header */}
      <div className={`flex items-center justify-between px-3 py-2.5 rounded-t-xl border border-b-0 ${config.bg} ${config.border}`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${config.dot}`} />
          <span className={`text-sm font-semibold ${config.color}`}>{status}</span>
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${config.bg} ${config.color} border ${config.border}`}>
            {leads.length}
          </span>
        </div>
        <button
          onClick={onAddLead}
          className={`p-1 rounded-md transition-colors ${config.color} hover:${config.bg}`}
          title="Add lead"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Drop zone */}
      <div className={`flex-1 min-h-[400px] rounded-b-xl border ${config.border} bg-muted/20 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-280px)]`}>
        <SortableContext items={leads.map((l) => l._id)} strategy={verticalListSortingStrategy}>
          {isLoading ? (
            Array.from({ length: 2 }).map((_, i) => <KanbanCardSkeleton key={i} />)
          ) : leads.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-xs text-muted-foreground/60 border border-dashed border-border rounded-lg">
              Drop leads here
            </div>
          ) : (
            leads.map((lead) => (
              <KanbanCard key={lead._id} lead={lead} onView={onView} />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}

/* ─── Drag Overlay Card ──────────────────────────────────────────────────── */
function DragCard({ lead }: { lead: Lead }) {
  return (
    <div className="bg-card border-2 border-primary rounded-xl p-3 shadow-2xl rotate-1 w-72">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
          {lead.name.charAt(0).toUpperCase()}
        </div>
        <p className="text-sm font-medium text-foreground">{lead.name}</p>
      </div>
      <p className="text-xs text-muted-foreground">{lead.company}</p>
    </div>
  );
}

/* ─── Kanban Board ───────────────────────────────────────────────────────── */
interface KanbanBoardProps {
  leads: Lead[];
  isLoading: boolean;
  onView: (lead: Lead) => void;
  onStatusChange: (leadId: string, newStatus: LeadStatus) => Promise<void>;
  onAddLead: () => void;
}

export function KanbanBoard({ leads, isLoading, onView, onStatusChange, onAddLead }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const getLeadsByStatus = useCallback(
    (status: LeadStatus) => leads.filter((l) => l.status === status),
    [leads]
  );

  const getLeadById = (id: string) => leads.find((l) => l._id === id);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (_event: DragOverEvent) => {};

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const draggedLead = getLeadById(active.id as string);
    if (!draggedLead) return;

    // Determine target column — over could be a column id or a card id
    let targetStatus = over.id as LeadStatus;

    // If over is a card, find its status
    const overLead = getLeadById(over.id as string);
    if (overLead) {
      targetStatus = overLead.status;
    }

    if (LEAD_STATUSES.includes(targetStatus) && targetStatus !== draggedLead.status) {
      await onStatusChange(draggedLead._id, targetStatus);
    }
  };

  const activeLead = activeId ? getLeadById(activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 kanban-scroll min-h-full">
        {LEAD_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            leads={getLeadsByStatus(status)}
            isLoading={isLoading}
            onView={onView}
            onAddLead={onAddLead}
          />
        ))}
      </div>

      <DragOverlay>
        {activeLead && <DragCard lead={activeLead} />}
      </DragOverlay>
    </DndContext>
  );
}
