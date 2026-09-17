"use client";

import type { ReactNode } from "react";
import { Button } from "./ui";

type Props<T> = {
  items: T[];
  onChange: (items: T[]) => void;
  blank: () => T;
  max: number;
  addLabel: string;
  emptyText: string;
  renderRow: (item: T, update: (patch: Partial<T>) => void, index: number) => ReactNode;
};

/** Rows of small inputs with move-up, move-down and remove. Used for the schedule and the contacts. */
export function ListEditor<T>({ items, onChange, blank, max, addLabel, emptyText, renderRow }: Props<T>) {
  const update = (i: number, patch: Partial<T>) => onChange(items.map((it, k) => (k === i ? { ...it, ...patch } : it)));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const remove = (i: number) => onChange(items.filter((_, k) => k !== i));

  return (
    <div className="space-y-2">
      {items.length === 0 && <p className="text-[13px] text-muted">{emptyText}</p>}
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          {/* Drag handle is drawn but inert in v1 (docs/05). */}
          <span aria-hidden className="mt-2 select-none text-[14px] leading-none text-muted/60">
            ⋮⋮
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row">{renderRow(item, (p) => update(i, p), i)}</div>
          <div className="flex shrink-0 gap-0.5">
            <Button size="sm" variant="ghost" aria-label="Naik" disabled={i === 0} onClick={() => move(i, -1)}>
              ↑
            </Button>
            <Button size="sm" variant="ghost" aria-label="Turun" disabled={i === items.length - 1} onClick={() => move(i, 1)}>
              ↓
            </Button>
            <Button size="sm" variant="ghost" aria-label="Buang baris" className="text-danger" onClick={() => remove(i)}>
              ×
            </Button>
          </div>
        </div>
      ))}
      <Button size="sm" disabled={items.length >= max} onClick={() => onChange([...items, blank()])}>
        + {addLabel}
      </Button>
    </div>
  );
}
