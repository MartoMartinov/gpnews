/* ============================================================
   Refreshable scroll + Feed screens (Home, Category drawer, Category list)
   ============================================================ */

/* Pull-to-refresh scroll container.
   IMPORTANT: scrolling is fully native (overflow-y:auto). The pull gesture
   is detected with PASSIVE touch listeners, which can never call
   preventDefault — so they can never block or swallow a scroll. */
const Refreshable = React.forwardRef(function Refreshable({ onRefresh, children, className, style }, ref) {
  const inner = React.useRef(null);
  const el = ref || inner;
  const [pull, setPull] = React.useState(0);
  const [refreshing, setRefreshing] = React.useState(false);
  const st = React.useRef({ active: false, y0: 0 });

  React.useEffect(() => {
    const node = el.current;
    if (!node) return undefined;
    function ts(e) {
      if (node.scrollTop <= 0 && !refreshing) {
        st.current = { active: true, y0: e.touches[0].clientY };
      } else { st.current.active = false; }
    }
    function tm(e) {
      if (!st.current.active) return;
      const d = e.touches[0].clientY - st.current.y0;
      if (d > 0 && node.scrollTop <= 0) { setPull(Math.min(d * 0.5, 80)); }
      else { setPull(0); st.current.active = false; }
    }
    function te() {
      if (!st.current.active) { setPull(0); return; }
      st.current.active = false;
      setPull((p) => {
        if (p > 52 && onRefresh) {
          setRefreshing(true);
          Promise.resolve(onRefresh());
          setTimeout(() => { setRefreshing(false); setPull(0); }, 1200);
          return 40;
        }
        return 0;
      });
    }
    const opt = { passive: true };
    node.addEventListener("touchstart", ts, opt);
    node.addEventListener("touchmove", tm, opt);
    node.addEventListener("touchend", te, opt);
    node.addEventListener("touchcancel", te, opt);
    return () => {
      node.removeEventListener("touchstart", ts);
      node.removeEventListener("touchmove", tm);
      node.removeEventListener("touchend", te);
      node.removeEventListener("touchcancel", te);
    };
  }, [onRefresh, refreshing]);

  return (
    <div className={"gp-scroll " + (className || "")} ref={el} style={style}>
      <div className="gp-ptr" style={{ height: pull }}>
        {(pull > 8 || refreshing) && (refreshing ?
        <><span className="gp-spin" /> Обновяване…</> :
        <><Icon name={pull > 52 ? "up" : "refresh"} size={14} /> {pull > 52 ? "Пусни за обновяване" : "Дръпни за обновяване"}</>)}
      </div>
      {children}
    </div>);

});

function CatIcon({ cat, size = 22 }) {
  return <Icon name={cat.icon} size={size} sw={1.6} />;
}

function ArticleThumb({ a, ratio }) {
  const cat = GPDATA.categories.find((c) => c.id === a.cat);
  return <Img id={a.img} ratio={ratio} style={{ "--cathue": `hsl(${cat ? cat.hue : 210} 45% 55%)` }} />;
}

/* ---- skeleton feed ---- */
function SkeletonFeed() {
  return (
    <div className="gp-page" style={{ paddingTop: 4 }}>
      <Skeleton w="46%" h={22} style={{ margin: "var(--s4) var(--s5) var(--s5)" }} />
      <div className="gp-card" style={{ margin: "0 var(--s5) var(--s5)" }}>
        <Skeleton w="100%" h={190} r={0} />
        <div style={{ padding: "var(--s5)" }}>
          <Skeleton w="90%" h={18} style={{ marginBottom: 10 }} />
          <Skeleton w="70%" h={18} style={{ marginBottom: 16 }} />
          <Skeleton w="40%" h={13} />
        </div>
      </div>
      {[0, 1].map((i) =>
      <div key={i} className="gp-row" style={{ alignItems: "stretch" }}>
          <Skeleton w={116} h={104} r={0} />
          <div className="rbody" style={{ flex: 1 }}>
            <Skeleton w="92%" h={14} style={{ marginBottom: 8 }} />
            <Skeleton w="75%" h={14} style={{ marginBottom: 12 }} />
            <Skeleton w="40%" h={11} />
          </div>
        </div>
      )}
    </div>);

}

function MetaRow({ a, app, onComments }) {
  const n = app.commentCount(a.id);
  return (
    <div className="gp-meta">
      <span>{a.date}</span>
      <span className="dot" />
      <a className="cc" onClick={(e) => {e.stopPropagation();onComments && onComments();}}>
        <Icon name="comment" size={14} sw={2} /><b>{n}</b>
      </a>
    </div>);

}

/* ---- HOME ---- */
function CatSection({ cat, lead, more, app, nav }) {
  return (
    <div className="gp-catsec">
      <button className="gp-section-head as-link" onClick={() => nav.openCategory(cat.id)} style={{ fontSize: "6px" }}>
        <span className="t" style={{ color: "rgba(23, 23, 15, 0.61)", fontSize: "16px" }}>{cat.name}</span>
        <span className="more"><Icon name="fwd" size={20} /></span>
      </button>

      <div className="gp-hero gp-card gp-card-hero" onClick={() => nav.go("article", { id: lead.id })}>
        <ArticleThumb a={lead} ratio="16/10" />
        <div className="body">
          <h2>{lead.title}</h2>
          <MetaRow a={lead} app={app} onComments={() => nav.go("article", { id: lead.id, scroll: "comments" })} />
        </div>
      </div>

      {more.map((a) =>
      <div key={a.id} className="gp-row" onClick={() => nav.go("article", { id: a.id })}>
          <div className="thumb"><ArticleThumb a={a} ratio="1/1" /></div>
          <div className="rbody">
            <h3>{a.title}</h3>
            <MetaRow a={a} app={app} onComments={() => nav.go("article", { id: a.id, scroll: "comments" })} />
          </div>
        </div>
      )}
    </div>);

}

function HomeScreen({ app, nav }) {
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {const t = setTimeout(() => setLoading(false), 850);return () => clearTimeout(t);}, []);

  if (loading) return <div className="gp-scroll"><SkeletonFeed /></div>;

  const arts = app.feed();

  // Per-category sections: leading article + up to 2 more.
  // "Новини" shows only its leading article (no list items).
  const sections = GPDATA.categories.
  map((cat) => {
    const list = app.byCat(cat.id);
    const more = cat.id === "news" ? [] : list.slice(1, 3);
    return { cat, lead: list[0], more };
  }).
  filter((s) => s.lead);

  return (
    <Refreshable onRefresh={() => {setLoading(true);setTimeout(() => setLoading(false), 1000);}}>
      {sections.map((s, i) =>
      <React.Fragment key={s.cat.id}>
          <CatSection cat={s.cat} lead={s.lead} more={s.more} app={app} nav={nav} />
          {i === 0 && app.auth.loggedIn === false &&
        <div className="gp-gate" style={{ margin: "var(--s2) var(--s5) var(--s5)" }}>
              <div className="gate-ico"><Icon name="shield" size={26} sw={1.6} /></div>
              <div className="gate-txt">
                <b>Регистрирай се за достъп</b>
                <span>до цялото съдържание и известия от бранша.</span>
              </div>
              <Btn variant="primary" size="sm" onClick={() => nav.go("auth")}>Вход</Btn>
            </div>
        }
        </React.Fragment>
      )}
      <div style={{ height: "var(--s6)" }} />
    </Refreshable>);

}

/* ---- CATEGORY DRAWER (new vertical list + Add News CTA) ---- */
function CategoryDrawer({ app, nav }) {
  const cats = GPDATA.categories;
  return (
    <div className="gp-drawer-scrim gp-screen-anim" onClick={() => nav.closeDrawer()}>
      <div className="gp-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <span className="t">Категории</span>
          <button className="icbtn" onClick={() => nav.closeDrawer()}><Icon name="close" size={22} /></button>
        </div>
        <div className="drawer-list">
          {cats.map((c) => {
            const on = app.selectedCat === c.id;
            return (
              <button key={c.id} className={"drawer-item" + (on ? " on" : "")}
              onClick={() => nav.openCategory(c.id)}>
                <span className="di-ic"><CatIcon cat={c} size={21} /></span>
                <span className="di-name">{c.name}</span>
                <span className="di-count">{app.catCount(c.id)}</span>
                <Icon name="fwd" size={17} className="di-arrow" />
              </button>);

          })}
        </div>
        <div className="drawer-foot">
          <Btn variant="primary" size="lg" full icon="plus"
          onClick={() => nav.addNews()}>Добави новина</Btn>
        </div>
      </div>
    </div>);

}

/* ---- CATEGORY ARTICLE LIST ---- */
function CategoryListScreen({ app, nav, params }) {
  const cat = GPDATA.categories.find((c) => c.id === params.catId) || GPDATA.categories[0];
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {setLoading(true);const t = setTimeout(() => setLoading(false), 700);return () => clearTimeout(t);}, [params.catId]);
  const arts = app.byCat(cat.id);

  return (
    <Refreshable onRefresh={() => {setLoading(true);setTimeout(() => setLoading(false), 900);}}>
      <div className="gp-section-head"><span className="t">{cat.name}</span></div>
      {loading ?
      <div className="gp-page" style={{ paddingTop: 0 }}>
          {[0, 1, 2].map((i) =>
        <div key={i} className="gp-row" style={{ alignItems: "stretch" }}>
              <Skeleton w={116} h={104} r={0} />
              <div className="rbody" style={{ flex: 1 }}><Skeleton w="90%" h={14} style={{ marginBottom: 8 }} /><Skeleton w="60%" h={14} style={{ marginBottom: 12 }} /><Skeleton w="40%" h={11} /></div>
            </div>
        )}
        </div> :
      arts.length === 0 ?
      <EmptyState icon={cat.icon} title="Все още няма новини"
      text={"В „" + cat.name + "“ още няма публикувани статии. Бъди първият автор."}
      action={<Btn variant="outline" size="sm" icon="plus" onClick={() => nav.addNews()} style={{ marginTop: 12 }}>Добави новина</Btn>} /> :

      <>
          {arts.map((a) =>
        <div key={a.id} className="gp-row" onClick={() => nav.go("article", { id: a.id })}>
              <div className="thumb"><ArticleThumb a={a} ratio="1/1" /></div>
              <div className="rbody"><h3>{a.title}</h3><MetaRow a={a} app={app} onComments={() => nav.go("article", { id: a.id, scroll: "comments" })} /></div>
            </div>
        )}
          <div style={{ height: "var(--s6)" }} />
        </>
      }
    </Refreshable>);

}

/* ---- SEARCH ---- */
function SearchScreen({ app, nav }) {
  const [q, setQ] = React.useState("");
  const inputRef = React.useRef(null);
  React.useEffect(() => { setTimeout(() => { if (inputRef.current) inputRef.current.focus(); }, 80); }, []);

  const trimmed = q.trim();
  const results = trimmed.length > 1 ? app.search(trimmed) : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <div className="search-topbar">
        <button className="icbtn" onClick={() => nav.back()}><Icon name="back" size={22} /></button>
        <input ref={inputRef} className="search-input" placeholder="Търси новини…" value={q}
          onChange={(e) => setQ(e.target.value)} />
        {q ? <button className="icbtn" onClick={() => setQ("")}><Icon name="close" size={20} /></button>
           : <div style={{ width: 40 }} />}
      </div>

      <div className="gp-scroll">
        {trimmed.length < 2 ? (
          <EmptyState icon="search" title="Търси в новините" text="Въведи поне 2 символа, за да видиш резултати." />
        ) : results.length === 0 ? (
          <EmptyState icon="search" title="Няма резултати" text={`Не намерихме нищо за „${trimmed}".`} />
        ) : (
          <>
            <div className="search-count">{results.length} {results.length === 1 ? "резултат" : "резултата"}</div>
            {results.map((a) => (
              <div key={a.id} className="gp-row" onClick={() => nav.go("article", { id: a.id })}>
                <div className="thumb"><ArticleThumb a={a} ratio="1/1" /></div>
                <div className="rbody">
                  <h3>{a.title}</h3>
                  <MetaRow a={a} app={app} onComments={() => nav.go("article", { id: a.id, scroll: "comments" })} />
                </div>
              </div>
            ))}
            <div style={{ height: "var(--s6)" }} />
          </>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { Refreshable, HomeScreen, CategoryDrawer, CategoryListScreen, ArticleThumb, MetaRow, CatIcon, SkeletonFeed, SearchScreen });