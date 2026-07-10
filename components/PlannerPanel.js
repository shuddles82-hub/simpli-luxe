'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';

// The Luxe Planner: weekly habit ritual, gentle to-dos with the
// Sunday reset built in, and a soft journal. Everything lives in the
// planner_entries and journal_entries tables (row-level security keeps
// each member's week her own).

const MOODS = ['Calm', 'Grateful', 'Blooming', 'Rested', 'Tender'];

const RESET_RITUAL = [
  'A 15-minute quiet tidy',
  "Pour this week's Simpli Sip",
  'Choose three gentle priorities',
  'Plan one soft morning',
  'Write one line of gratitude',
];

// Local date string (YYYY-MM-DD). toISOString would use UTC and could
// mark the wrong day in the evening.
function iso(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

// The week runs Sunday to Saturday: the brand week begins with the
// Sunday reset.
function weekDays() {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  return [...Array(7)].map((_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function weekLabel(days) {
  const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(days[0])} to ${fmt(days[6])}`;
}

export default function PlannerPanel() {
  const supabase = getSupabase();
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  const [habits, setHabits] = useState([]);
  const [checks, setChecks] = useState([]);
  const [todos, setTodos] = useState([]);
  const [journal, setJournal] = useState([]);
  const [newHabit, setNewHabit] = useState('');
  const [newTodo, setNewTodo] = useState('');
  const [jTitle, setJTitle] = useState('');
  const [jBody, setJBody] = useState('');
  const [jMood, setJMood] = useState(null);
  const [jSaved, setJSaved] = useState(false);
  const [visions, setVisions] = useState([]);
  const [visionUrls, setVisionUrls] = useState({});
  const [visionReady, setVisionReady] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [visionNote, setVisionNote] = useState('');
  const fileInput = useRef(null);

  const days = weekDays();
  const today = iso(new Date());

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data?.session || null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setReady(true);
    });
    return () => sub?.subscription?.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!supabase || !session) return;
    let cancelled = false;
    async function load() {
      const weekStart = iso(days[0]);
      const weekEnd = iso(days[6]);
      const [{ data: entries }, { data: weekChecks }, { data: entriesJ }] = await Promise.all([
        supabase
          .from('planner_entries')
          .select('*')
          .in('kind', ['habit', 'todo', 'vision'])
          .order('created_at'),
        supabase
          .from('planner_entries')
          .select('*')
          .eq('kind', 'habit_check')
          .gte('entry_date', weekStart)
          .lte('entry_date', weekEnd),
        supabase
          .from('journal_entries')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10),
      ]);
      if (cancelled) return;
      setHabits((entries || []).filter((e) => e.kind === 'habit'));
      setTodos((entries || []).filter((e) => e.kind === 'todo'));
      setChecks(weekChecks || []);
      setJournal(entriesJ || []);
      const visionRows = (entries || []).filter((e) => e.kind === 'vision');
      setVisions(visionRows);
      const paths = visionRows.map((v) => v.meta?.path).filter(Boolean);
      if (paths.length > 0) {
        const { data: signed, error: signErr } = await supabase.storage
          .from('vision-board')
          .createSignedUrls(paths, 3600);
        if (cancelled) return;
        if (signErr) {
          setVisionReady(false);
        } else {
          const urls = {};
          (signed || []).forEach((s, i) => {
            if (s.signedUrl) urls[paths[i]] = s.signedUrl;
          });
          setVisionUrls(urls);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, session]);

  if (!supabase) {
    return (
      <div className="acc">
        <div className="acc-card">
          <div className="shch">The Luxe Planner</div>
          <p className="acc-note">
            The planner is almost here. Gentle habits, a soft journal, and your weekly reset, all
            in one quiet place. Something lovely is on the way.
          </p>
          <Link href="/" className="acc-btn ghost" style={{ display: 'inline-block' }}>
            Back Home
          </Link>
        </div>
      </div>
    );
  }

  if (!ready) return <div className="empty">One moment...</div>;

  if (!session) {
    return (
      <div className="acc">
        <div className="acc-card">
          <div className="shch">Members Only, Softly</div>
          <p className="acc-note">
            The Luxe Planner is part of your member space. Sign in with your email (no password
            needed) and your habits, journal, and weekly plans will be waiting whenever you return.
          </p>
          <Link href="/account" className="acc-btn" style={{ display: 'inline-block' }}>
            Sign In to Begin
          </Link>
        </div>
      </div>
    );
  }

  const userId = session.user.id;

  async function addHabit() {
    const title = newHabit.trim();
    if (!title) return;
    const { data } = await supabase
      .from('planner_entries')
      .insert({ user_id: userId, kind: 'habit', title })
      .select()
      .single();
    if (data) setHabits((prev) => [...prev, data]);
    setNewHabit('');
  }

  async function removeHabit(habit) {
    await supabase.from('planner_entries').delete().eq('id', habit.id);
    await supabase
      .from('planner_entries')
      .delete()
      .eq('kind', 'habit_check')
      .filter('meta->>habit_id', 'eq', habit.id);
    setHabits((prev) => prev.filter((h) => h.id !== habit.id));
    setChecks((prev) => prev.filter((c) => c.meta?.habit_id !== habit.id));
  }

  async function toggleCheck(habit, date) {
    const existing = checks.find((c) => c.meta?.habit_id === habit.id && c.entry_date === date);
    if (existing) {
      await supabase.from('planner_entries').delete().eq('id', existing.id);
      setChecks((prev) => prev.filter((c) => c.id !== existing.id));
    } else {
      const { data } = await supabase
        .from('planner_entries')
        .insert({
          user_id: userId,
          kind: 'habit_check',
          title: habit.title,
          entry_date: date,
          meta: { habit_id: habit.id },
        })
        .select()
        .single();
      if (data) setChecks((prev) => [...prev, data]);
    }
  }

  async function addTodo(title) {
    const clean = title.trim();
    if (!clean) return;
    const { data } = await supabase
      .from('planner_entries')
      .insert({ user_id: userId, kind: 'todo', title: clean, entry_date: today })
      .select()
      .single();
    if (data) setTodos((prev) => [...prev, data]);
  }

  async function toggleTodo(todo) {
    await supabase.from('planner_entries').update({ done: !todo.done }).eq('id', todo.id);
    setTodos((prev) => prev.map((t) => (t.id === todo.id ? { ...t, done: !t.done } : t)));
  }

  async function removeTodo(todo) {
    await supabase.from('planner_entries').delete().eq('id', todo.id);
    setTodos((prev) => prev.filter((t) => t.id !== todo.id));
  }

  async function addResetRitual() {
    const existing = new Set(todos.map((t) => t.title));
    for (const step of RESET_RITUAL) {
      if (!existing.has(step)) await addTodo(step);
    }
  }

  async function uploadVision(file) {
    if (!file) return;
    setUploading(true);
    setVisionNote('');
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage.from('vision-board').upload(path, file);
    if (upErr) {
      // Most likely the storage area has not been created yet
      // (supabase/vision-board.sql), or the image is over 10 MB.
      setVisionNote(
        'That picture did not make it through. If this keeps happening, the vision board storage may still need its one-time setup.'
      );
      setUploading(false);
      return;
    }
    const { data } = await supabase
      .from('planner_entries')
      .insert({ user_id: userId, kind: 'vision', title: '', meta: { path } })
      .select()
      .single();
    if (data) {
      const { data: signed } = await supabase.storage
        .from('vision-board')
        .createSignedUrls([path], 3600);
      if (signed?.[0]?.signedUrl) {
        setVisionUrls((prev) => ({ ...prev, [path]: signed[0].signedUrl }));
      }
      setVisions((prev) => [...prev, data]);
    }
    setUploading(false);
  }

  async function removeVision(vision) {
    const path = vision.meta?.path;
    if (path) await supabase.storage.from('vision-board').remove([path]);
    await supabase.from('planner_entries').delete().eq('id', vision.id);
    setVisions((prev) => prev.filter((v) => v.id !== vision.id));
  }

  async function saveJournal() {
    if (!jBody.trim() && !jTitle.trim()) return;
    const { data } = await supabase
      .from('journal_entries')
      .insert({ user_id: userId, title: jTitle.trim(), body: jBody.trim(), mood: jMood })
      .select()
      .single();
    if (data) setJournal((prev) => [data, ...prev]);
    setJTitle('');
    setJBody('');
    setJMood(null);
    setJSaved(true);
    setTimeout(() => setJSaved(false), 2600);
  }

  const dayLetters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="acc">
      {/* HABITS */}
      <div className="acc-card">
        <div className="shch">Gentle Habits · {weekLabel(days)}</div>
        <p className="acc-note">
          Small rituals, kept softly. Tap a circle when a day includes one. No pressure, no
          catching up, just noticing.
        </p>
        {habits.length > 0 && (
          <div className="pl-grid">
            <span />
            {days.map((d, i) => (
              <span key={i} className={`pl-dayhead${iso(d) === today ? ' today' : ''}`}>
                {dayLetters[i]}
              </span>
            ))}
          </div>
        )}
        {habits.map((habit) => {
          const count = checks.filter((c) => c.meta?.habit_id === habit.id).length;
          return (
            <div key={habit.id} className="pl-grid">
              <span className="pl-habit" onDoubleClick={() => removeHabit(habit)} title={habit.title}>
                {habit.title}
                {count > 0 && <span className="pl-habit-week">✦ {count} this week</span>}
              </span>
              {days.map((d) => {
                const date = iso(d);
                const on = checks.some(
                  (c) => c.meta?.habit_id === habit.id && c.entry_date === date
                );
                return (
                  <button
                    key={date}
                    className={`pl-dot${on ? ' on' : ''}`}
                    onClick={() => toggleCheck(habit, date)}
                    aria-label={`${habit.title}, ${date}`}
                    aria-pressed={on}
                  />
                );
              })}
            </div>
          );
        })}
        <div className="pl-row" style={{ marginTop: 14 }}>
          <input
            className="acc-input"
            type="text"
            placeholder="A new gentle habit (morning light, evening tea...)"
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addHabit()}
          />
          <button className="acc-btn" onClick={addHabit}>
            Add
          </button>
        </div>
        {habits.length > 0 && (
          <p className="acc-note" style={{ marginBottom: 0 }}>
            To let a habit go, double tap its name. Seasons change; so can your rituals.
          </p>
        )}
      </div>

      {/* WEEKLY PLAN */}
      <div className="acc-card">
        <div className="shch">This Week, Softly</div>
        <p className="acc-note">
          A short list is a luxury. Add what matters, let the rest wait.
        </p>
        {todos.map((todo) => (
          <div key={todo.id} className="pl-todo">
            <button
              className={`pl-todo-check${todo.done ? ' done' : ''}`}
              onClick={() => toggleTodo(todo)}
              aria-pressed={todo.done}
              aria-label={todo.title}
            >
              {todo.done ? '✦' : ''}
            </button>
            <span className={`pl-todo-t${todo.done ? ' done' : ''}`}>{todo.title}</span>
            <button className="acc-remove" onClick={() => removeTodo(todo)}>
              Remove
            </button>
          </div>
        ))}
        <div className="pl-row" style={{ marginTop: 14 }}>
          <input
            className="acc-input"
            type="text"
            placeholder="Something for this week"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addTodo(newTodo);
                setNewTodo('');
              }
            }}
          />
          <button
            className="acc-btn"
            onClick={() => {
              addTodo(newTodo);
              setNewTodo('');
            }}
          >
            Add
          </button>
        </div>
        <button className="acc-btn ghost" onClick={addResetRitual}>
          ✦ Add the Sunday Reset Ritual
        </button>
      </div>

      {/* VISION BOARD */}
      <div className="acc-card">
        <div className="shch">The Vision Board</div>
        <p className="acc-note">
          Pictures of the life you are growing into. Add them as you find them; let the board
          become a quiet promise to yourself.
        </p>
        {visions.length > 0 && (
          <div className="pl-vision">
            {visions.map((v) => {
              const url = visionUrls[v.meta?.path];
              if (!url) return null;
              return (
                <div key={v.id} className="pl-vision-item">
                  <img src={url} alt="Vision board image" />
                  <button className="pl-vision-remove" onClick={() => removeVision(v)}>
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        )}
        {!visionReady && (
          <p className="acc-note">
            The vision board is one small step away: its picture storage has not been set up yet.
            The README's "vision board" section has the one-time instructions.
          </p>
        )}
        {visionNote && <p className="acc-note">{visionNote}</p>}
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            uploadVision(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
        <button className="acc-btn" disabled={uploading} onClick={() => fileInput.current?.click()}>
          {uploading ? 'Adding...' : '✦ Add a Picture'}
        </button>
      </div>

      {/* JOURNAL */}
      <div className="acc-card">
        <div className="shch">The Soft Journal</div>
        <p className="acc-note">A few honest lines are enough. How does today feel?</p>
        <div className="pl-moods">
          {MOODS.map((m) => (
            <span
              key={m}
              className={`fc${jMood === m ? ' on' : ''}`}
              onClick={() => setJMood(jMood === m ? null : m)}
            >
              {m}
            </span>
          ))}
        </div>
        <input
          className="acc-input"
          type="text"
          placeholder="A title, if you'd like one"
          value={jTitle}
          onChange={(e) => setJTitle(e.target.value)}
        />
        <textarea
          className="acc-input"
          placeholder="Write softly..."
          value={jBody}
          onChange={(e) => setJBody(e.target.value)}
        />
        <button className="acc-btn" onClick={saveJournal}>
          {jSaved ? '✦ Kept' : 'Keep This Entry'}
        </button>
        {journal.map((entry) => (
          <div key={entry.id} className="pl-journal">
            <div className="pl-journal-meta">
              <span>
                {new Date(entry.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              {entry.mood && <span>· {entry.mood}</span>}
              <button
                className="acc-remove"
                style={{ marginLeft: 'auto' }}
                onClick={async () => {
                  await supabase.from('journal_entries').delete().eq('id', entry.id);
                  setJournal((prev) => prev.filter((x) => x.id !== entry.id));
                }}
              >
                Remove
              </button>
            </div>
            {entry.title && <div className="pl-journal-t">{entry.title}</div>}
            {entry.body && <div className="pl-journal-b">{entry.body}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
