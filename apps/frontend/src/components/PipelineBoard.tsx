'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { api, ApiError } from '@/lib/api';
import type { Opportunity, OpportunityStage } from '@/lib/types';
import { formatCurrencyFull } from '@/components/ui';
import { useToast } from '@/components/ToastProvider';

/* ------------------------------------------------------------------ */
/*  Stage config mapped to app's OpportunityStage enum                  */
/* ------------------------------------------------------------------ */

type BoardStage = OpportunityStage;

const STAGE_CONFIG: Record<BoardStage, { label: string; order: number; colorClass: string; badgeClass: string }> = {
  PROSPECTING:  { label: 'Prospecting',  order: 1, colorClass: 'border-t-blue-500',    badgeClass: 'bg-blue-100 text-blue-700' },
  PROPOSAL:     { label: 'Proposal',     order: 2, colorClass: 'border-t-amber-500',   badgeClass: 'bg-amber-100 text-amber-700' },
  NEGOTIATION:  { label: 'Negotiation',  order: 3, colorClass: 'border-t-purple-500',  badgeClass: 'bg-purple-100 text-purple-700' },
  CLOSED_WON:   { label: 'Closed Won',   order: 4, colorClass: 'border-t-green-500',   badgeClass: 'bg-green-100 text-green-700' },
  CLOSED_LOST:  { label: 'Closed Lost',  order: 5, colorClass: 'border-t-red-400',    badgeClass: 'bg-red-100 text-red-500' },
};

const STAGE_ORDER: BoardStage[] = ['PROSPECTING', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'];

/* ------------------------------------------------------------------ */
/*  Card                                                                */
/* ------------------------------------------------------------------ */

function OpportunityCard({
  opportunity,
  dragging,
}: {
  opportunity: Opportunity;
  dragging?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: opportunity.id,
    data: { opportunity },
  });

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  const clientName = opportunity.client
    ? opportunity.client.type === 'COMPANY'
      ? opportunity.client.companyName
      : [opportunity.client.firstName, opportunity.client.lastName].filter(Boolean).join(' ')
    : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        rounded-lg border border-gray-200 bg-white p-3 shadow-sm
        transition-shadow hover:shadow-md cursor-grab active:cursor-grabbing
        ${isDragging ? 'opacity-40' : ''}
        ${dragging ? 'shadow-lg ring-2 ring-indigo-400 rotate-1' : ''}
      `}
    >
      <p className="text-sm font-medium text-gray-900 truncate">{opportunity.title}</p>
      {clientName && (
        <p className="text-xs text-gray-500 truncate mt-0.5">{clientName}</p>
      )}

      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-indigo-600">
          {formatCurrencyFull(opportunity.amount)}
        </span>
      </div>

      {opportunity.expectedCloseDate && (
        <p className="mt-1 text-xs text-gray-400">
          Close: {new Date(opportunity.expectedCloseDate).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Column                                                              */
/* ------------------------------------------------------------------ */

function PipelineColumn({
  stage,
  opportunities,
}: {
  stage: BoardStage;
  opportunities: Opportunity[];
}) {
  const config = STAGE_CONFIG[stage];
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const total = useMemo(
    () => opportunities.reduce((sum, o) => sum + Number(o.amount), 0),
    [opportunities],
  );

  return (
    <div
      ref={setNodeRef}
      className={`
        flex flex-col w-80 shrink-0 rounded-lg border border-gray-200 bg-gray-50
        border-t-4 ${config.colorClass} transition-colors
        ${isOver ? 'bg-indigo-50 ring-2 ring-indigo-300' : ''}
      `}
    >
      <div className="px-3 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${config.badgeClass}`}
            >
              {config.order}
            </span>
            <h3 className="text-sm font-semibold text-gray-800">{config.label}</h3>
          </div>
          <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-gray-500 border border-gray-200">
            {opportunities.length}
          </span>
        </div>
        <p className="mt-1 text-xs font-medium text-gray-500">{formatCurrencyFull(total)}</p>
      </div>

      <div className="flex-1 space-y-2 p-2 overflow-y-auto min-h-[120px]">
        {opportunities.length === 0 ? (
          <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-gray-300 text-xs text-gray-400">
            No opportunities
          </div>
        ) : (
          opportunities.map((opp) => <OpportunityCard key={opp.id} opportunity={opp} />)
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Board                                                               */
/* ------------------------------------------------------------------ */

export default function PipelineBoard() {
  const toast = useToast();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.opportunities.list({ limit: 100 });
      setOpportunities(response.data);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to load opportunities.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const grouped = useMemo(() => {
    const map: Record<BoardStage, Opportunity[]> = {
      PROSPECTING: [],
      PROPOSAL: [],
      NEGOTIATION: [],
      CLOSED_WON: [],
      CLOSED_LOST: [],
    };
    for (const opp of opportunities) {
      map[opp.stage]?.push(opp);
    }
    return map;
  }, [opportunities]);

  const activeOpportunity = useMemo(
    () => opportunities.find((o) => o.id === activeId) ?? null,
    [activeId, opportunities],
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      if (!over) return;

      const oppId = String(active.id);
      const targetStage = over.id as BoardStage;
      const opp = opportunities.find((o) => o.id === oppId);
      if (!opp) return;
      if (opp.stage === targetStage) return;

      const previousStage = opp.stage;

      // Optimistic update
      setOpportunities((prev) =>
        prev.map((o) => (o.id === oppId ? { ...o, stage: targetStage } : o)),
      );

      try {
        await api.opportunities.update(oppId, { stage: targetStage });
        toast.success(`Moved "${opp.title}" to ${STAGE_CONFIG[targetStage].label}`);
      } catch (err) {
        // Revert on failure
        setOpportunities((prev) =>
          prev.map((o) => (o.id === oppId ? { ...o, stage: previousStage } : o)),
        );
        toast.error(err instanceof ApiError ? err.message : `Failed to move "${opp.title}".`);
      }
    },
    [opportunities, toast],
  );

  if (loading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-4">
        {STAGE_ORDER.map((stage) => (
          <div key={stage} className="w-72 shrink-0 rounded-lg border border-gray-200 bg-gray-50 border-t-4 border-t-gray-200 animate-pulse">
            <div className="px-3 py-3 border-b border-gray-200">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-3 w-16 bg-gray-200 rounded mt-2" />
            </div>
            <div className="p-2 space-y-2">
              <div className="h-24 bg-gray-100 rounded" />
              <div className="h-24 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-1 px-1">
        {STAGE_ORDER.map((stage) => (
          <PipelineColumn key={stage} stage={stage} opportunities={grouped[stage]} />
        ))}
      </div>

      <DragOverlay>
        {activeOpportunity ? (
          <div className="w-72">
            <OpportunityCard opportunity={activeOpportunity} dragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}