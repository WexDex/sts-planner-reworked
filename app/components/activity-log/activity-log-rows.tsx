'use client';

import {
  ACTIVITY_LOG_COLORS,
  ACTIVITY_LOG_ICONS,
  CARD_TYPE_BG,
  CARD_TYPE_COLORS,
} from '@/app/constants/colors';
import type {
  ActivityLogCardRef,
  ActivityLogContextLine,
  ActivityLogEntry,
} from '@/app/types/gameTypes';
import type { ActivityLogType } from '@/app/utils/activityLogger';

export type ActivityLogInlineDensity = 'minimal' | 'detailed';

type LogColors = (typeof ACTIVITY_LOG_COLORS)[keyof typeof ACTIVITY_LOG_COLORS];

/** Extra chrome for phase-bar “turn started” milestones (amber spine + soft ring). */
const TURN_START_LOG_CHROME =
  'shadow-[inset_4px_0_0_rgba(251,191,36,0.92)] ring-1 ring-amber-400/25 ring-inset';

function turnStartRowChrome(entry: ActivityLogEntry): string {
  return entry.type === 'turn-start' ? TURN_START_LOG_CHROME : '';
}

export function getActivityLogColors(type?: ActivityLogType): LogColors {
  const logType = type || 'info';
  return (ACTIVITY_LOG_COLORS as Record<string, LogColors>)[logType] || ACTIVITY_LOG_COLORS.info;
}

export function getActivityLogIcon(type?: ActivityLogType): string {
  const logType = type || 'info';
  return (ACTIVITY_LOG_ICONS as Record<string, string>)[logType] || '•';
}

function cardTypeClasses(cardType?: string) {
  const t = cardType as keyof typeof CARD_TYPE_COLORS | undefined;
  const text = (t && CARD_TYPE_COLORS[t]) || 'text-slate-200';
  const bg = (t && CARD_TYPE_BG[t]) || 'bg-slate-800/80';
  return { text, bg };
}

export function ActivityLogCardChips({ cards, size = 'sm' }: { cards: ActivityLogCardRef[]; size?: 'sm' | 'md' }) {
  const md = size === 'md';
  return (
    <div className="flex flex-wrap gap-1.5" aria-label="Cards involved">
      {cards.map((c, i) => {
        const { text, bg } = cardTypeClasses(c.cardType);
        return (
          <span
            key={`${c.name}-${i}`}
            title={c.cardType ? `${c.name} · ${c.cardType}` : c.name}
            className={`inline-flex max-w-full items-baseline gap-1 truncate rounded-lg border border-white/10 font-semibold shadow-sm ${text} ${bg} ${md ? 'px-2.5 py-1 text-sm' : 'px-2 py-0.5 text-[11px]'}`}
          >
            <span className="truncate">{c.name}</span>
            {c.cardType ? (
              <span className="shrink-0 text-[9px] font-bold uppercase tracking-wide opacity-85">({c.cardType})</span>
            ) : null}
          </span>
        );
      })}
    </div>
  );
}

export function ActivityLogContextRows({ context, dense }: { context: ActivityLogContextLine[]; dense?: boolean }) {
  return (
    <dl className={`grid gap-1.5 ${dense ? '' : 'sm:grid-cols-2'}`}>
      {context.map((row, i) => (
        <div
          key={`${row.label}-${i}`}
          className={`rounded-lg border border-slate-700/55 bg-slate-950/40 ${dense ? 'px-2 py-1.5' : 'px-3 py-2'}`}
        >
          <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{row.label}</dt>
          <dd className={`mt-0.5 break-words text-slate-200 ${dense ? 'text-xs' : 'text-sm'}`}>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function logEntryMatchesFilter(entry: ActivityLogEntry, q: string): boolean {
  if (
    entry.title.toLowerCase().includes(q) ||
    (entry.details?.toLowerCase().includes(q) ?? false) ||
    (entry.before?.toLowerCase().includes(q) ?? false) ||
    (entry.after?.toLowerCase().includes(q) ?? false)
  ) {
    return true;
  }
  if (entry.cardsInvolved?.some((c) => c.name.toLowerCase().includes(q) || (c.cardType?.toLowerCase().includes(q) ?? false))) {
    return true;
  }
  if (entry.context?.some((c) => c.label.toLowerCase().includes(q) || c.value.toLowerCase().includes(q))) {
    return true;
  }
  return false;
}

/** Hide raw "Cards: …" line when structured chips are shown. */
export function shouldShowDetailsText(entry: ActivityLogEntry): boolean {
  if (!entry.details?.trim()) return false;
  if (entry.cardsInvolved?.length && /^cards:\s/i.test(entry.details.trim())) return false;
  return true;
}

export function ActivityLogRowMinimal({ entry }: { entry: ActivityLogEntry }) {
  const colors = getActivityLogColors(entry.type);
  const icon = getActivityLogIcon(entry.type);
  const metaLine =
    entry.after ||
    entry.before ||
    entry.context?.map((c) => `${c.label}: ${c.value}`).join(' · ') ||
    (shouldShowDetailsText(entry) ? entry.details : undefined);

  return (
    <div
      className={`group flex gap-2 border-b border-slate-800/50 border-l-2 py-2 pl-2 pr-2 transition-colors last:border-b-0 hover:bg-slate-900/35 ${colors.border} ${turnStartRowChrome(entry)}`}
    >
      <div className="flex min-w-0 flex-1 items-start gap-2">
        <span className="shrink-0 text-sm leading-none opacity-90" aria-hidden>
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className={`min-w-0 truncate text-[13px] font-semibold leading-tight ${colors.text}`}>{entry.title}</p>
            <time className="shrink-0 text-[10px] tabular-nums text-slate-500">{entry.timestamp}</time>
          </div>
          {entry.cardsInvolved && entry.cardsInvolved.length > 0 ? (
            <p className="mt-0.5 min-w-0 truncate text-[11px] leading-tight">
              {entry.cardsInvolved.map((c, i) => {
                const { text } = cardTypeClasses(c.cardType);
                return (
                  <span key={`${c.name}-${i}`} className={`font-medium ${text}`}>
                    {i > 0 ? <span className="font-normal text-slate-600">, </span> : null}
                    <span className="inline max-w-[12rem] truncate align-bottom">{c.name}</span>
                  </span>
                );
              })}
            </p>
          ) : metaLine ? (
            <p className="mt-0.5 truncate text-[11px] text-slate-500" title={metaLine}>
              {metaLine}
            </p>
          ) : (
            <p className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-600">
              {(entry.type ?? 'info').replace(/-/g, ' ')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function ActivityLogRowDetailed({ entry }: { entry: ActivityLogEntry }) {
  const colors = getActivityLogColors(entry.type);
  const icon = getActivityLogIcon(entry.type);
  const hasDelta = Boolean(entry.before || entry.after);
  const showDetails = shouldShowDetailsText(entry);
  const hasBody = Boolean(
    hasDelta || showDetails || (entry.context && entry.context.length > 0) || (entry.cardsInvolved && entry.cardsInvolved.length > 0),
  );

  return (
    <div className="group relative flex gap-3 py-2 pl-1 pr-2">
      <div className="relative flex w-5 shrink-0 flex-col items-center pt-1">
        <span
          className={`z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm shadow-sm transition-transform duration-200 group-hover:scale-105 ${colors.border} ${colors.bg}`}
          aria-hidden
        >
          {icon}
        </span>
      </div>
      <div
        className={`min-w-0 flex-1 rounded-xl border px-3 py-2 transition-shadow duration-200 group-hover:shadow-md ${colors.border} ${colors.bg}`}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
          <p className={`min-w-0 text-sm font-semibold leading-snug ${colors.text}`}>{entry.title}</p>
          <div className="flex shrink-0 items-center gap-2">
            <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${colors.badge} ${colors.text}`}>
              {(entry.type ?? 'info').replace(/-/g, ' ')}
            </span>
            <time className="text-[11px] tabular-nums text-slate-500">{entry.timestamp}</time>
          </div>
        </div>

        {entry.cardsInvolved && entry.cardsInvolved.length > 0 ? (
          <div className="mt-2 border-t border-slate-700/30 pt-2">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Cards</p>
            <ActivityLogCardChips cards={entry.cardsInvolved} />
          </div>
        ) : null}

        {entry.context && entry.context.length > 0 ? (
          <div className="mt-2 border-t border-slate-700/30 pt-2">
            <ActivityLogContextRows context={entry.context} dense />
          </div>
        ) : null}

        {hasBody && (hasDelta || showDetails) ? (
          <div className="mt-2 space-y-1.5 border-t border-slate-700/40 pt-2 text-[11px]">
            {hasDelta ? (
              <div className="flex flex-wrap items-stretch gap-2">
                {entry.before != null && entry.before !== '' && (
                  <div className="min-w-0 flex-1 rounded-lg border border-slate-700/60 bg-slate-950/40 px-2 py-1">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Before</span>
                    <p className="mt-0.5 font-mono text-xs text-slate-300 break-words">{entry.before}</p>
                  </div>
                )}
                {entry.before && entry.after ? (
                  <span className="hidden shrink-0 self-center text-slate-600 sm:inline" aria-hidden>
                    →
                  </span>
                ) : null}
                {entry.after != null && entry.after !== '' && (
                  <div className="min-w-0 flex-1 rounded-lg border border-slate-700/60 bg-slate-950/40 px-2 py-1">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">After</span>
                    <p className={`mt-0.5 font-mono text-xs font-semibold break-words ${colors.text}`}>{entry.after}</p>
                  </div>
                )}
              </div>
            ) : null}
            {showDetails ? (
              <p className="text-slate-400 leading-relaxed line-clamp-2 group-hover:line-clamp-none">{entry.details}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function ActivityLogRowInline({
  entry,
  density,
}: {
  entry: ActivityLogEntry;
  density: ActivityLogInlineDensity;
}) {
  if (density === 'minimal') return <ActivityLogRowMinimal entry={entry} />;
  return <ActivityLogRowDetailed entry={entry} />;
}

export function ActivityLogRowExpanded({ entry }: { entry: ActivityLogEntry }) {
  const colors = getActivityLogColors(entry.type);
  const icon = getActivityLogIcon(entry.type);
  const showDetails = shouldShowDetailsText(entry);

  return (
    <article
      className={`rounded-2xl border-2 p-5 md:p-6 ${colors.border} ${colors.bg} ${turnStartRowChrome(entry)}`}
    >
      <div className="flex flex-wrap items-start gap-3 border-b border-slate-700/50 pb-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-600/50 bg-slate-950/50 text-2xl shadow-inner">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className={`text-lg font-bold leading-snug md:text-xl ${colors.text}`}>{entry.title}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={`rounded-lg px-2 py-1 text-xs font-semibold uppercase tracking-wide ${colors.badge} ${colors.text}`}>
              {(entry.type ?? 'info').replace(/-/g, ' ')}
            </span>
            {entry.target ? (
              <span className="rounded-lg border border-slate-600 bg-slate-900/80 px-2 py-1 text-xs text-slate-300">
                {entry.target}
              </span>
            ) : null}
            <time className="text-sm tabular-nums text-slate-400">{entry.timestamp}</time>
          </div>
        </div>
      </div>

      {entry.cardsInvolved && entry.cardsInvolved.length > 0 ? (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Cards</p>
          <ActivityLogCardChips cards={entry.cardsInvolved} size="md" />
        </div>
      ) : null}

      {entry.context && entry.context.length > 0 ? (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Context</p>
          <ActivityLogContextRows context={entry.context} />
        </div>
      ) : null}

      {(entry.before || entry.after) && (
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-stretch">
          {entry.before != null && entry.before !== '' && (
            <div className="min-w-0 flex-1 rounded-xl border border-slate-700/70 bg-slate-950/55 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Before</p>
              <p className="mt-2 font-mono text-base leading-relaxed text-slate-200 whitespace-pre-wrap break-words">
                {entry.before}
              </p>
            </div>
          )}
          {entry.before && entry.after ? (
            <div className="flex shrink-0 items-center justify-center md:px-1" aria-hidden>
              <span className="rounded-full border border-slate-600 bg-slate-900 px-3 py-1.5 text-sm text-slate-400">→</span>
            </div>
          ) : null}
          {entry.after != null && entry.after !== '' && (
            <div className="min-w-0 flex-1 rounded-xl border border-slate-700/70 bg-slate-950/55 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">After</p>
              <p className={`mt-2 font-mono text-base font-semibold leading-relaxed whitespace-pre-wrap break-words ${colors.text}`}>
                {entry.after}
              </p>
            </div>
          )}
        </div>
      )}

      {showDetails ? (
        <div className="mt-4 rounded-xl border border-slate-700/70 bg-slate-950/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Details</p>
          <p className="mt-2 text-base leading-relaxed text-slate-200 whitespace-pre-wrap break-words">{entry.details}</p>
        </div>
      ) : null}
    </article>
  );
}
