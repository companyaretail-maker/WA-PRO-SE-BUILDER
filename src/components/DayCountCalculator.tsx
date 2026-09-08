import React, { useState } from 'react';
import { Calendar, AlertTriangle } from 'lucide-react';
import { countDays, parseLocalDate, type CountingMode, type Direction } from '../utils/deadlineCalculator';

export const DayCountCalculator: React.FC = () => {
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [days, setDays] = useState(14);
  const [mode, setMode] = useState<CountingMode>('court');
  const [direction, setDirection] = useState<Direction>('backward');
  const [showWork, setShowWork] = useState(false);

  const result = countDays(parseLocalDate(startDate), Math.max(0, Math.min(365, days)), { mode, direction });

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-white">
      <div className="bg-[#111] border border-ink-faint p-6">
        <h2 className="font-oswald text-2xl uppercase tracking-wide text-accent mb-2 flex items-center gap-2">
          <Calendar className="w-5 h-5" /> Day Count Calculator
        </h2>
        <p className="text-sm text-ink-muted">
          Counts a procedural period, excluding Saturdays, Sundays and Washington legal holidays
          (RCW 1.16.050) when you select court days.
        </p>
      </div>

      <div className="bg-[#0d0d0e] border border-ink-faint p-6 grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase text-ink-muted">
            {direction === 'backward' ? 'Hearing / target date' : 'Date of the triggering act'}
          </span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-black border border-ink-faint p-2 text-white"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase text-ink-muted">Number of days</span>
          <input
            type="number"
            min={0}
            max={365}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="bg-black border border-ink-faint p-2 text-white"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase text-ink-muted">Count</span>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as CountingMode)}
            className="bg-black border border-ink-faint p-2 text-white"
          >
            <option value="court">Court days (skip weekends &amp; legal holidays)</option>
            <option value="calendar">Calendar days</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase text-ink-muted">Direction</span>
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value as Direction)}
            className="bg-black border border-ink-faint p-2 text-white"
          >
            <option value="backward">Backward from the hearing (working copies, confirmation)</option>
            <option value="forward">Forward from an act (response, service)</option>
          </select>
        </label>
      </div>

      <div className="bg-black border border-accent/40 p-6">
        <div className="font-mono text-[10px] uppercase text-ink-muted mb-1">Computed date</div>
        <div className="text-2xl font-bold text-accent">{result.formatted}</div>
        {result.notes.map((n) => (
          <p key={n} className="text-xs text-ink-muted mt-3">{n}</p>
        ))}
        <button
          onClick={() => setShowWork((v) => !v)}
          className="mt-4 font-mono text-[10px] uppercase text-accent border border-accent/50 px-3 py-1.5 cursor-pointer"
        >
          {showWork ? 'Hide' : 'Show'} the count
        </button>
        {showWork && (
          <ol className="mt-4 space-y-1 font-mono text-[11px]">
            {result.steps.map((s, i) => (
              <li key={i} className={s.counted ? 'text-white' : 'text-ink-muted'}>
                {s.date} — {s.reason}
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="bg-[#111] border border-yellow-500/40 p-4 flex gap-3">
        <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
        <p className="text-xs text-ink-muted leading-relaxed">
          Whether a particular deadline is counted in court days or calendar days is set by the rule
          that creates it (CR 6(a) and any applicable local rule), not by this tool. Confirm the
          counting method against the current rule text before you rely on this date.
        </p>
      </div>
    </div>
  );
};
