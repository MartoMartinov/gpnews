/* ============================================================
   Article detail + Comments (threaded, likes, sort)
   ============================================================ */

function CommentComposer({ app, nav, onSubmit, placeholder, compact, autoFocus }) {
  const [v, setV] = React.useState("");
  const ref = React.useRef(null);
  React.useEffect(() => { if (autoFocus && ref.current) ref.current.focus(); }, [autoFocus]);
  function send() {
    const t = v.trim();
    if (!t) return;
    onSubmit(t); setV("");
  }
  return (
    <div className={"cmt-composer" + (compact ? " compact" : "")}>
      <Avatar user={app.auth.user} size={compact ? 30 : 36} />
      <div className="cc-input">
        <textarea ref={ref} className="gp-textarea" rows={2} value={v}
          placeholder={placeholder || "Напиши коментар…"} onChange={(e) => setV(e.target.value)} />
      </div>
      <button className={"cc-send" + (v.trim() ? " on" : "")} onClick={send} aria-label="Изпрати">
        <Icon name="send" size={20} sw={2} fill={!!v.trim()} />
      </button>
    </div>
  );
}

function CommentItem({ c, app, nav, articleId }) {
  return (
    <div className="cmt">
      <Avatar user={c.user} size={38} />
      <div className="cmt-body">
        <div className="cmt-head">
          <span className="cmt-name">{c.user.name}{c.user.official && <Icon name="checkc" size={13} sw={2.5} style={{ color: "var(--accent)" }} />}</span>
          <span className="cmt-time">{fmtAgo(c.ago)}</span>
        </div>
        <p className="cmt-text">{c.text}</p>
      </div>
    </div>
  );
}

function CommentsSection({ app, nav, articleId, sectionRef }) {
  const list = app.getComments(articleId);
  const total = app.commentCount(articleId);
  const sorted = [...list].sort((a, b) => a.ago - b.ago);

  return (
    <div className="cmt-section" ref={sectionRef}>
      <div className="cmt-sec-head">
        <h3>Коментари <span>{total}</span></h3>
      </div>

      {app.auth.loggedIn
        ? <CommentComposer app={app} nav={nav} onSubmit={(t) => app.addComment(articleId, t, null)} />
        : (
          <div className="cmt-locked" onClick={() => nav.go("auth")}>
            <Icon name="user" size={18} sw={1.8} />
            <span>Влез в профила си, за да коментираш</span>
            <Icon name="fwd" size={16} />
          </div>
        )}

      {list.length === 0 ? (
        <EmptyState icon="comment" title="Все още няма коментари"
          text={app.auth.loggedIn ? "Бъди първият, който ще се включи в разговора." : "Влез, за да започнеш разговора."} />
      ) : (
        <div className="cmt-list">
          {sorted.map((c) => <CommentItem key={c.id} c={c} app={app} nav={nav} articleId={articleId} />)}
        </div>
      )}
    </div>
  );
}

function ArticleScreen({ app, nav, params }) {
  const a = app.getArticle(params.id);
  const cat = GPDATA.categories.find((c) => c.id === a.cat);
  const [loading, setLoading] = React.useState(true);
  const scrollRef = React.useRef(null);
  const cmtRef = React.useRef(null);

  React.useEffect(() => { const t = setTimeout(() => setLoading(false), 650); return () => clearTimeout(t); }, [params.id]);

  function scrollToComments() {
    const sc = scrollRef.current, el = cmtRef.current;
    if (!sc || !el) return;
    const top = el.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - 8;
    sc.scrollTo({ top, behavior: "smooth" });
  }
  React.useEffect(() => {
    if (!loading && params.scroll === "comments") {
      const t = setTimeout(scrollToComments, 220); return () => clearTimeout(t);
    }
  }, [loading, params.scroll]);

  const n = app.commentCount(a.id);

  return (
    <div className="gp-scroll" ref={scrollRef}>
      <div className="art-hero">
        <ArticleThumb a={a} ratio="16/11" />
        <div className="art-hero-grad" />
        <button className="art-back" onClick={() => nav.back()}><Icon name="back" size={22} /></button>

        <span className="art-cat gp-cat-tag"><CatIcon cat={cat} size={12} />{cat.name}</span>
      </div>

      <div className="art-body">
        {loading ? (
          <>
            <Skeleton w="95%" h={26} style={{ marginBottom: 12 }} />
            <Skeleton w="70%" h={26} style={{ marginBottom: 20 }} />
            <Skeleton w="50%" h={14} style={{ marginBottom: 24 }} />
            <Skeleton w="100%" h={14} style={{ marginBottom: 10 }} />
            <Skeleton w="100%" h={14} style={{ marginBottom: 10 }} />
            <Skeleton w="80%" h={14} />
          </>
        ) : (
          <>
            <h1 className="art-title">{a.title}</h1>
            <div className="art-sub">
              <span>Публикувано {a.date}</span>
              <span className="dot" />
              <a className="art-cc" onClick={scrollToComments}>
                <Icon name="comment" size={15} sw={2} /><b>{n}</b> {n === 1 ? "коментар" : "коментара"}
              </a>
            </div>
            {a.pending && (
              <div className="art-pending"><Icon name="hourglass" size={17} sw={1.8} />
                <span>Тази статия чака одобрение от администратор.</span></div>
            )}
            <p className="art-lead">{a.lead}</p>
            {a.body.map((p, i) => <p key={i} className="art-p">{p}</p>)}
            <div className="art-author">
              <Avatar user={a.author || GPDATA.users.desk} size={40} />
              <div><b>{(a.author || GPDATA.users.desk).name}</b><span>Автор · ID {(a.author || GPDATA.users.desk).id}</span></div>
            </div>

            <CommentsSection app={app} nav={nav} articleId={a.id} sectionRef={cmtRef} />
          </>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { ArticleScreen, CommentsSection });
