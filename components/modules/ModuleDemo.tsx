'use client';
import { useEffect, useRef, useState } from 'react';
import { coreModules, modules, modulesCopy, sidebar, tiles } from '@/content/modules';
import { site } from '@/content/site';
import { DEFAULTS, NOTE_MS, countOn, resetModules, toggleModule, type ToggleResult } from './moduleRules';
import s from './Modules.module.css';

const LockIcon = () => (
  <svg className={s.lockic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 018 0v3" />
  </svg>
);

/** Live module-switch demo: 12 real switches with dependency rules driving a mini app window. */
export function ModuleDemo() {
  const [state, setState] = useState(DEFAULTS);
  const [note, setNote] = useState('');
  const [noteOn, setNoteOn] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const apply = ({ state: next, note: msg }: ToggleResult) => {
    setState(next);
    if (msg) {
      setNote(msg);
      setNoteOn(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setNoteOn(false), NOTE_MS);
    }
  };

  return (
    <div className={s.grid}>
      <div>
        <div className={s.list} data-testid="module-switches">
          {coreModules.map((name) => (
            <div key={name} className={`${s.row} ${s.lock}`}>
              <span>
                {name}
                <small>{modulesCopy.alwaysOn}</small>
              </span>
              <LockIcon />
            </div>
          ))}
          {modules.map((m) => (
            <button
              key={m.key}
              type="button"
              role="switch"
              aria-checked={state[m.key]}
              className={s.row}
              data-hov=""
              data-k={m.key}
              onClick={() => apply(toggleModule(state, m.key))}
            >
              <span>
                {m.name}
                <small>{m.hint}</small>
              </span>
              <i className={s.tg} aria-hidden="true" />
            </button>
          ))}
        </div>
        <button type="button" className={s.reset} onClick={() => apply(resetModules())}>
          {modulesCopy.reset}
        </button>
      </div>
      <div className={s.mini} data-r="scale" data-testid="mini-app">
        <aside>
          <div className={s.mlogo}>{site.wordmark}</div>
          <ul>
            <li className={s.core}>
              <span>Dashboard</span>
            </li>
            <li className={s.core}>
              <span>Members</span>
            </li>
            {sidebar.map(([k, label]) => (
              <li key={k} className={state[k] ? undefined : s.off} data-k={k} aria-hidden={!state[k]}>
                <span>{label}</span>
              </li>
            ))}
            <li className={s.core}>
              <span>Module Settings</span>
            </li>
          </ul>
        </aside>
        <div className={s.main}>
          <div className={s.mh}>
            <b>{modulesCopy.windowTitle}</b>
            <div className={s.cnt} data-testid="module-count">
              <span>{countOn(state)}</span>
              <small> / {modulesCopy.total}</small>
            </div>
          </div>
          <div className={s.tiles}>
            {tiles.map(([k, label, value]) => (
              <div key={k} className={`${s.tile} ${state[k] ? '' : s.off}`} data-k={k}>
                <small>{label}</small>
                <b>{value}</b>
              </div>
            ))}
          </div>
          <div className={`${s.note} ${noteOn ? s.on : ''}`} role="status" aria-live="polite" data-testid="module-note">
            {note}
          </div>
        </div>
      </div>
    </div>
  );
}
