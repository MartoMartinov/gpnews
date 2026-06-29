/* ============================================================
   Notifications (Известия) + Polls (Анкети)
   ============================================================ */

/* ---------------- NOTIFICATIONS ---------------- */
function NotificationsScreen({ app, nav }) {
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => { const t = setTimeout(() => setLoading(false), 650); return () => clearTimeout(t); }, []);
  const items = app.notifications();

  return (
    <Refreshable onRefresh={() => { setLoading(true); setTimeout(() => setLoading(false), 900); }}>
      <div className="gp-section-head"><span className="t">Известия</span>
        {!loading && items.some((n) => !n.read) && (
          <button className="notif-readall" onClick={() => app.markAllRead()}>Отбележи всички</button>
        )}
      </div>

      {loading ? (
        <div className="gp-page" style={{ paddingTop: 0 }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="notif-card" style={{ pointerEvents: "none" }}>
              <Skeleton w={42} h={42} r={12} />
              <div style={{ flex: 1 }}>
                <Skeleton w="92%" h={13} style={{ marginBottom: 8 }} />
                <Skeleton w="60%" h={13} />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon="bell" title="Няма известия" text="Когато има нещо ново от бранша, ще го видиш тук." />
      ) : (
        <div className="notif-list">
          {items.map((n) => (
            <button key={n.id} className={"notif-card" + (n.read ? "" : " unread")}
              onClick={() => { app.markRead(n.id); if (n.art) nav.go("article", { id: n.art }); }}>
              <span className="notif-ic"><Icon name="clock" size={20} sw={1.7} /></span>
              <span className="notif-body">
                <span className="notif-title">{n.title}</span>
              </span>
              <span className="notif-ago">{n.ago}</span>
              {!n.read && <span className="notif-dot" />}
            </button>
          ))}
          <div style={{ height: "var(--s6)" }} />
        </div>
      )}
    </Refreshable>
  );
}

/* ---------------- POLLS LIST ---------------- */
function PollsScreen({ app, nav }) {
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => { const t = setTimeout(() => setLoading(false), 600); return () => clearTimeout(t); }, []);
  const polls = app.polls();

  return (
    <Refreshable onRefresh={() => { setLoading(true); setTimeout(() => setLoading(false), 900); }}>
      <div className="gp-section-head"><span className="t">Анкети</span></div>

      {loading ? (
        <div className="gp-page" style={{ paddingTop: 0 }}>
          {[0, 1, 2].map((i) => <Skeleton key={i} w="100%" h={62} r={16} style={{ margin: "0 0 var(--s3)" }} />)}
        </div>
      ) : polls.length === 0 ? (
        <EmptyState icon="news" title="Няма активни анкети" text="В момента няма анкети за попълване." />
      ) : (
        <div className="poll-list">
          {polls.map((p) => {
            const done = !!app.pollVote(p.id);
            return (
              <button key={p.id} className="poll-row" onClick={() => nav.go("poll", { id: p.id })}>
                <span className="poll-row-play"><Icon name="fwd" size={16} sw={2.4} /></span>
                <span className="poll-row-body">
                  <span className="poll-row-title">{p.title}</span>
                  <span className="poll-row-meta">{p.closes} · {p.total} гласа</span>
                </span>
                {done
                  ? <Chip tone="ok" icon="check">Гласувано</Chip>
                  : <Icon name="fwd" size={18} className="poll-row-arrow" />}
              </button>
            );
          })}
          <div style={{ height: "var(--s6)" }} />
        </div>
      )}
    </Refreshable>
  );
}

/* ---------------- POLL DETAIL ---------------- */
function PollScreen({ app, nav, params }) {
  const poll = app.getPoll(params.id);
  const existing = app.pollVote(poll.id);
  const [sel, setSel] = React.useState(existing);
  const [saved, setSaved] = React.useState(!!existing);
  const [busy, setBusy] = React.useState(false);
  const showResults = saved;

  const liveTotal = poll.total + (existing ? 0 : (saved ? 1 : 0));
  function pct(o) {
    const extra = saved && sel === o.id && !existing ? 1 : 0;
    return liveTotal ? Math.round(((o.votes + extra) / liveTotal) * 100) : 0;
  }

  function save() {
    if (!sel) return;
    setBusy(true);
    setTimeout(() => { app.castVote(poll.id, sel); setBusy(false); setSaved(true); }, 700);
  }

  return (
    <div className="gp-scroll">
      <div className="poll-detail">
        <button className="poll-back" onClick={() => nav.back()}><Icon name="back" size={22} /> Анкети</button>
        <h1 className="poll-q">{poll.question}</h1>

        <div className="poll-opts">
          {poll.options.map((o) => {
            const checked = sel === o.id;
            return (
              <button key={o.id} className={"poll-opt" + (checked ? " on" : "") + (showResults ? " result" : "")}
                disabled={showResults} onClick={() => setSel(o.id)}>
                {showResults && <span className="poll-bar" style={{ width: pct(o) + "%" }} />}
                <span className={"poll-radio" + (checked ? " on" : "")}>{checked && <span className="dot" />}</span>
                <span className="poll-opt-text">{o.text}</span>
                {showResults && <span className="poll-pct">{pct(o)}%</span>}
              </button>
            );
          })}
        </div>

        {showResults ? (
          <div className="poll-voted">
            <Icon name="checkc" size={18} sw={2} />
            <span>Благодарим! Гласът ти е записан · {liveTotal} гласа общо</span>
          </div>
        ) : (
          <Btn variant="dark" size="lg" full loading={busy} disabled={!sel} onClick={save}>Запази</Btn>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { NotificationsScreen, PollsScreen, PollScreen });
