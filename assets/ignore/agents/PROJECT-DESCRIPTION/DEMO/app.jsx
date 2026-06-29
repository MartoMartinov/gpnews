/* ============================================================
   GPApp — self-contained app instance (one per phone)
   Owns navigation stack, auth, comments, submissions.
   ============================================================ */

function countComments(list) {
  return (list || []).reduce((n, c) => n + 1 + (c.replies ? c.replies.length : 0), 0);
}

function GPApp({ platform, start }) {
  const [history, setHistory] = React.useState([{ name: "splash", params: {} }]);
  const [tab, setTabState] = React.useState("home");
  const [auth, setAuth] = React.useState({ loggedIn: false, user: null });
  const [drawer, setDrawer] = React.useState(false);
  const [addOpen, setAddOpen] = React.useState(false);
  const [selectedCat, setSelectedCat] = React.useState("news");
  const [comments, setComments] = React.useState(() => structuredClone(GPDATA.comments));
  const [extra, setExtra] = React.useState([]); // submitted (pending) articles
  const [notifs, setNotifs] = React.useState(() => structuredClone(GPDATA.notifications));
  const [votes, setVotes] = React.useState({}); // pollId -> optionId (plus any pre-seeded)
  React.useEffect(() => {
    const seed = {};
    GPDATA.polls.forEach((p) => { if (p.voted) seed[p.id] = p.voted; });
    setVotes(seed);
  }, []);
  const [toast, setToast] = React.useState(null);
  const [meta, setMeta] = React.useState({}); // _loginBanner / _prefillEmail
  const toastTimer = React.useRef(null);
  const firstRun = React.useRef(true);

  const cur = history[history.length - 1];

  function applyStart(s) {
    if (s === "home-user") {
      setAuth({ loggedIn: true, user: { ...GPDATA.users.me } });
      setHistory([{ name: "home", params: {} }]); setTabState("home");
    } else if (s === "home-guest") {
      setAuth({ loggedIn: false, user: null });
      setHistory([{ name: "home", params: {} }]); setTabState("home");
    } else {
      setAuth({ loggedIn: false, user: null });
      setHistory([{ name: "splash", params: {} }]); setTabState("home");
    }
    setDrawer(false); setAddOpen(false);
  }
  React.useEffect(() => { applyStart(start); /* runs on mount + when start changes */ }, [start]);

  function showToast(msg, type = "success") {
    clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => {
      setToast((t) => (t ? { ...t, leaving: true } : t));
      setTimeout(() => setToast(null), 280);
    }, 2400);
  }

  const nav = {
    go: (name, params = {}) => setHistory((h) => [...h, { name, params }]),
    replace: (name, params = {}) => setHistory((h) => [...h.slice(0, -1), { name, params }]),
    back: () => setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h)),
    setTab: (t) => {
      setTabState(t);
      const screen = t === "home" ? "home" : t;
      setHistory([{ name: screen, params: {} }]);
      setAddOpen(false); setDrawer(false);
    },
    guest: () => { setAuth({ loggedIn: false, user: null }); setHistory([{ name: "home", params: {} }]); setTabState("home"); },
    login: (user) => { setAuth({ loggedIn: true, user }); setHistory([{ name: "home", params: {} }]); setTabState("home"); setMeta({}); showToast("Добре дошъл, " + user.name.split(" ")[0] + "!", "success"); },
    afterSignup: (email) => { setMeta({ _loginBanner: "Успешна регистрация! Влез с данните си по-долу.", _prefillEmail: email }); setHistory((h) => [...h.slice(0, -1), { name: "auth", params: {} }]); },
    logout: () => { setAuth({ loggedIn: false, user: null }); setHistory([{ name: "home", params: {} }]); setTabState("home"); showToast("Излезе от профила", "info"); },
    requireLogin: () => { showToast("Влез в профила си, за да продължиш", "info"); setHistory((h) => [...h, { name: "auth", params: {} }]); },
    openDrawer: () => setDrawer(true),
    closeDrawer: () => setDrawer(false),
    openCategory: (catId) => { setSelectedCat(catId); setDrawer(false); setHistory((h) => [...h, { name: "category", params: { catId } }]); },
    addNews: () => { setDrawer(false); if (!auth.loggedIn) { showToast("Влез, за да добавиш новина", "info"); setHistory((h) => [...h, { name: "auth", params: {} }]); return; } setAddOpen(true); },
    closeAddNews: () => { setAddOpen(false); setHistory([{ name: "home", params: {} }]); setTabState("home"); },
  };

  const app = {
    auth, selectedCat,
    feed: () => [...GPDATA.articles],
    byCat: (id) => GPDATA.articles.filter((a) => a.cat === id),
    catCount: (id) => GPDATA.articles.filter((a) => a.cat === id).length,
    getArticle: (id) => GPDATA.articles.find((a) => a.id === id) || extra.find((a) => a.id === id),
    myArticles: () => extra,
    getComments: (id) => comments[id] || [],
    commentCount: (id) => countComments(comments[id]),
    likeComment: (aid, cid) => {
      if (!auth.loggedIn) { nav.requireLogin(); return; }
      setComments((prev) => {
        const next = structuredClone(prev);
        const walk = (arr) => arr.forEach((c) => {
          if (c.id === cid) { c.liked = !c.liked; c.likes += c.liked ? 1 : -1; }
          if (c.replies) walk(c.replies);
        });
        walk(next[aid] || []);
        return next;
      });
    },
    addComment: (aid, text, parentId) => {
      const newC = { id: "u" + Date.now(), user: auth.user, text, ago: 0, likes: 0, liked: false, replies: [] };
      setComments((prev) => {
        const next = structuredClone(prev);
        if (!next[aid]) next[aid] = [];
        if (parentId) {
          const p = next[aid].find((c) => c.id === parentId);
          if (p) { p.replies = p.replies || []; p.replies.push(newC); }
        } else { next[aid].unshift(newC); }
        return next;
      });
      showToast(parentId ? "Отговорът е публикуван" : "Коментарът е публикуван", "success");
    },
    submitArticle: ({ cat, title, body, img }) => {
      const id = "GPN-" + Math.floor(1000 + Math.random() * 9000);
      const art = { id, cat, title, date: "днес", iso: "2026-06-03", lead: body.slice(0, 90) + "…",
        img: img ? "upload" : "other", body: [body], tags: ["Изпратена"], pending: true, author: auth.user };
      setExtra((e) => [art, ...e]);
      return id;
    },
    showToast,
    notifications: () => notifs,
    unreadCount: () => notifs.filter((n) => !n.read).length,
    markRead: (id) => setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n))),
    markAllRead: () => { setNotifs((prev) => prev.map((n) => ({ ...n, read: true }))); showToast("Всички известия са отбелязани", "success"); },
    polls: () => GPDATA.polls,
    getPoll: (id) => GPDATA.polls.find((p) => p.id === id),
    pollVote: (id) => votes[id] || null,
    castVote: (id, optId) => { setVotes((v) => ({ ...v, [id]: optId })); showToast("Гласът ти е записан", "success"); },
    search: (q) => {
      const lq = q.toLowerCase();
      return GPDATA.articles.filter((a) =>
        a.title.toLowerCase().includes(lq) || a.lead.toLowerCase().includes(lq)
      );
    },
  };
  app._loginBanner = meta._loginBanner; app._prefillEmail = meta._prefillEmail;

  /* ---- render ---- */
  const SHELL_TOPBAR = ["home", "category", "profile", "polls", "notifications"];
  const SHELL_TABBAR = ["home", "category", "profile", "article", "polls", "notifications", "poll", "search"];
  const showTop = SHELL_TOPBAR.includes(cur.name) && !addOpen;
  const showTab = SHELL_TABBAR.includes(cur.name) && !addOpen;

  function renderScreen() {
    const key = cur.name + JSON.stringify(cur.params);
    const P = { app, nav, params: cur.params, platform };
    let el;
    switch (cur.name) {
      case "splash": el = <SplashScreen {...P} />; break;
      case "onboarding": el = <OnboardingScreen {...P} />; break;
      case "auth": el = <LoginScreen {...P} />; break;
      case "signup": el = <SignupScreen {...P} />; break;
      case "home": el = <HomeScreen {...P} />; break;
      case "category": el = <CategoryListScreen {...P} />; break;
      case "article": el = <ArticleScreen {...P} />; break;
      case "profile": el = <ProfileScreen {...P} />; break;
      case "polls": el = <PollsScreen {...P} />; break;
      case "poll": el = <PollScreen {...P} />; break;
      case "notifications": el = <NotificationsScreen {...P} />; break;
      case "search": el = <SearchScreen {...P} />; break;
      default: el = <HomeScreen {...P} />;
    }
    return <div className="gp-screen-anim" key={key} style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>{el}</div>;
  }

  return (
    <div className="gp-view">
      {showTop && (
        <div className="gp-topbar">
          <button className="icbtn" onClick={() => nav.openDrawer()}><Icon name="menu" size={24} sw={2} /></button>
          <GPLogo />
          <button className="icbtn" onClick={() => nav.go("search")}><Icon name="search" size={22} sw={2} /></button>
        </div>
      )}

      {renderScreen()}

      {showTab && (
        auth.loggedIn ? (
          <div className="gp-tabbar">
            <button className={"gp-tab" + (tab === "home" ? " on" : "")} onClick={() => nav.setTab("home")}>
              <Icon name="home" size={23} className="ic" /><span>Начало</span>
            </button>
            <button className={"gp-tab" + (tab === "polls" ? " on" : "")} onClick={() => nav.setTab("polls")}>
              <Icon name="tray" size={23} className="ic" /><span>Анкети</span>
            </button>
            <button className={"gp-tab" + (tab === "notifications" ? " on" : "")} onClick={() => nav.setTab("notifications")}>
              <span className="gp-tab-ic-wrap">
                <Icon name="bell" size={23} className="ic" />
                {app.unreadCount() > 0 && <span className="gp-tab-badge">{app.unreadCount()}</span>}
              </span>
              <span>Известия</span>
            </button>
            <button className={"gp-tab" + (tab === "profile" ? " on" : "")} onClick={() => nav.setTab("profile")}>
              <Icon name="user" size={23} className="ic" /><span>Профил</span>
            </button>
          </div>
        ) : (
          <div className="gp-tabbar">
            <button className={"gp-tab" + (tab === "home" ? " on" : "")} onClick={() => nav.setTab("home")}>
              <Icon name="home" size={23} className="ic" /><span>Начало</span>
            </button>
            <button className="gp-tab" onClick={() => nav.go("auth")}>
              <Icon name="user" size={23} className="ic" /><span>Вход</span>
            </button>
          </div>
        )
      )}

      {drawer && <CategoryDrawer app={app} nav={nav} />}
      {addOpen && <div className="gp-overlay gp-modal-anim"><AddNewsScreen app={app} nav={nav} /></div>}
      <Toast toast={toast} />
    </div>
  );
}

window.GPApp = GPApp;
