/* ============================================================
   Add News editor (+ moderation success) and Profile
   ============================================================ */

function AddNewsScreen({ app, nav }) {
  const [step, setStep] = React.useState("edit"); // edit | submitting | done
  const [cat, setCat] = React.useState("news");
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [img, setImg] = React.useState(false);
  const [err, setErr] = React.useState({});
  const submitId = React.useRef(null);

  function publish() {
    const e = {};
    if (title.trim().length < 6) e.title = "Заглавието трябва да е поне 6 символа";
    if (body.trim().length < 20) e.body = "Съдържанието е твърде кратко (мин. 20 символа)";
    setErr(e);
    if (Object.keys(e).length) return;
    setStep("submitting");
    setTimeout(() => {
      submitId.current = app.submitArticle({ cat, title: title.trim(), body: body.trim(), img });
      setStep("done");
    }, 1300);
  }

  if (step === "done") {
    return (
      <div className="gp-view standalone">
        <div className="addnews-done gp-modal-anim">
          <div className="done-ic"><Icon name="checkc" size={40} sw={1.6} /></div>
          <h1>Изпратено за одобрение</h1>
          <p>Благодарим! Статията ти е получена и ще бъде публикувана след преглед от администратор.</p>
          <div className="done-card">
            <div className="dc-row"><span>Статус</span><Chip tone="warn" icon="hourglass">Изчаква одобрение</Chip></div>
            <div className="dc-row"><span>Публикувал</span><b>{app.auth.user.name}</b></div>
            <div className="dc-row"><span>ID на автора</span><code>{app.auth.user.id}</code></div>
            <div className="dc-row"><span>Номер</span><code>{submitId.current}</code></div>
          </div>
          <div className="done-foot">
            <Btn variant="primary" size="lg" full onClick={() => { nav.closeAddNews(); app.showToast("Статията е изпратена за одобрение", "success"); }}>Към началото</Btn>
            <button className="addnews-secondary" onClick={() => nav.go("profile")}>Виж моите публикации</button>
          </div>
        </div>
      </div>
    );
  }

  const busy = step === "submitting";
  return (
    <div className="gp-view standalone">
      <div className="addnews-top">
        <button className="icbtn" onClick={() => nav.closeAddNews()}><Icon name="close" size={22} /></button>
        <span className="t">Добави новина</span>
        <button className="addnews-pub" disabled={busy} onClick={publish}>{busy ? <span className="gp-spin" /> : "Публикувай"}</button>
      </div>
      <div className="gp-scroll addnews-scroll">
        <div className="addnews-note"><Icon name="shield" size={16} sw={1.8} /><span>Публикациите се преглеждат от администратор преди да станат видими.</span></div>

        <label className="fl">Категория</label>
        <div className="addnews-cats">
          {GPDATA.categories.map((c) => (
            <button key={c.id} className={"anc" + (cat === c.id ? " on" : "")} onClick={() => setCat(c.id)}>
              <CatIcon cat={c} size={16} />{c.name}
            </button>
          ))}
        </div>

        <button className={"addnews-upload" + (img ? " has" : "")} onClick={() => setImg(!img)}>
          {img ? (
            <>
              <Img id="upload" label="КАЧЕНО ИЗОБРАЖЕНИЕ" ratio="16/9" radius="var(--r-md)" />
              <span className="up-remove" onClick={(e) => { e.stopPropagation(); setImg(false); }}><Icon name="trash" size={15} /> Премахни</span>
            </>
          ) : (
            <div className="up-empty">
              <Icon name="image" size={26} sw={1.6} />
              <b>Добави изображение</b>
              <span>Снимка от обекта · JPG, PNG до 10 MB</span>
            </div>
          )}
        </button>

        <div className={"gp-field" + (err.title ? " err" : "")}>
          <label>Заглавие</label>
          <input className="gp-input" placeholder="Кратко и ясно заглавие" value={title}
            maxLength={120} onChange={(e) => setTitle(e.target.value)} />
          {err.title ? <div className="errmsg"><Icon name="close" size={13} sw={2.5} />{err.title}</div>
            : <div className="fl-help">{title.length}/120</div>}
        </div>

        <div className={"gp-field" + (err.body ? " err" : "")}>
          <label>Съдържание</label>
          <textarea className="gp-textarea" rows={7} placeholder="Опиши новината — какво, къде и кога се случва…"
            value={body} onChange={(e) => setBody(e.target.value)} />
          {err.body && <div className="errmsg"><Icon name="close" size={13} sw={2.5} />{err.body}</div>}
        </div>

        <Btn variant="primary" size="lg" full loading={busy} onClick={publish} icon="check">Публикувай за одобрение</Btn>
        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

/* ---- CHANGE PASSWORD ---- */
function ChangePasswordSection({ app }) {
  const [current, setCurrent] = React.useState("");
  const [next, setNext] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showNext, setShowNext] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [err, setErr] = React.useState({});
  const [busy, setBusy] = React.useState(false);

  function save() {
    const e = {};
    if (!current) e.current = "Въведи текущата парола";
    if (next.length < 6) e.next = "Паролата трябва да е поне 6 символа";
    if (next !== confirm) e.confirm = "Паролите не съвпадат";
    setErr(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setCurrent(""); setNext(""); setConfirm("");
      app.showToast("Паролата е сменена успешно", "success");
    }, 900);
  }

  return (
    <div className="prof-section">
      <div className="prof-sec-title">Смяна на парола</div>

      <div className={"gp-field" + (err.current ? " err" : "")}>
        <label>Текуща парола</label>
        <div className="gp-input-wrap">
          <input className="gp-input" type={showCurrent ? "text" : "password"}
            placeholder="••••••••" value={current} onChange={(e) => setCurrent(e.target.value)} />
          <button className="gp-input-eye" onClick={() => setShowCurrent((v) => !v)} tabIndex={-1}>
            <Icon name={showCurrent ? "eyeoff" : "eye"} size={17} sw={1.7} />
          </button>
        </div>
        {err.current && <div className="errmsg"><Icon name="close" size={13} sw={2.5} />{err.current}</div>}
      </div>

      <div className={"gp-field" + (err.next ? " err" : "")}>
        <label>Нова парола</label>
        <div className="gp-input-wrap">
          <input className="gp-input" type={showNext ? "text" : "password"}
            placeholder="••••••••" value={next} onChange={(e) => setNext(e.target.value)} />
          <button className="gp-input-eye" onClick={() => setShowNext((v) => !v)} tabIndex={-1}>
            <Icon name={showNext ? "eyeoff" : "eye"} size={17} sw={1.7} />
          </button>
        </div>
        {err.next && <div className="errmsg"><Icon name="close" size={13} sw={2.5} />{err.next}</div>}
      </div>

      <div className={"gp-field" + (err.confirm ? " err" : "")}>
        <label>Потвърди новата парола</label>
        <div className="gp-input-wrap">
          <input className="gp-input" type={showConfirm ? "text" : "password"}
            placeholder="••••••••" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          <button className="gp-input-eye" onClick={() => setShowConfirm((v) => !v)} tabIndex={-1}>
            <Icon name={showConfirm ? "eyeoff" : "eye"} size={17} sw={1.7} />
          </button>
        </div>
        {err.confirm && <div className="errmsg"><Icon name="close" size={13} sw={2.5} />{err.confirm}</div>}
      </div>

      <Btn variant="ghost" size="md" full loading={busy} onClick={save}>Смени паролата</Btn>
    </div>
  );
}

/* ---- DELETE ACCOUNT ---- */
function DeleteAccountSection({ app, nav }) {
  const [step, setStep] = React.useState(0); // 0=hidden, 1=warning, 2=confirm
  const [typed, setTyped] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const KEYWORD = "ИЗТРИВАНЕ";

  function doDelete() {
    if (typed !== KEYWORD) return;
    setBusy(true);
    setTimeout(() => { nav.logout(); app.showToast("Профилът е изтрит", "info"); }, 1100);
  }

  return (
    <>
      {step === 0 && (
        <div style={{ textAlign: "center", padding: "0 var(--s5) var(--s6)" }}>
          <button className="del-account-trigger" onClick={() => setStep(1)}>
            Изтриване на профил
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="del-account-panel gp-modal-anim">
          <div className="del-icon"><Icon name="trash" size={22} sw={1.6} /></div>
          <h3>Изтриване на профил</h3>
          <p>Това действие е необратимо. Всички твои данни, публикации и коментари ще бъдат изтрити завинаги.</p>
          <div className="del-checklist">
            <span><Icon name="close" size={13} sw={2.5} />Всички твои публикации</span>
            <span><Icon name="close" size={13} sw={2.5} />Всички твои коментари</span>
            <span><Icon name="close" size={13} sw={2.5} />Данните на профила ти</span>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <Btn variant="ghost" size="md" full onClick={() => setStep(0)}>Откажи</Btn>
            <Btn variant="outline" size="md" full onClick={() => setStep(2)}>Продължи</Btn>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="del-account-panel gp-modal-anim">
          <div className="del-icon danger"><Icon name="trash" size={22} sw={1.6} /></div>
          <h3>Последна стъпка</h3>
          <p>Напиши <b>{KEYWORD}</b> в полето по-долу, за да потвърдиш окончателното изтриване.</p>
          <div className={"gp-field" + (typed && typed !== KEYWORD ? " err" : "")} style={{ marginTop: 16 }}>
            <input className="gp-input" placeholder={KEYWORD} value={typed}
              onChange={(e) => setTyped(e.target.value.toUpperCase())} />
            {typed && typed !== KEYWORD && (
              <div className="errmsg"><Icon name="close" size={13} sw={2.5} />Текстът не съвпада</div>
            )}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn variant="ghost" size="md" full onClick={() => { setStep(0); setTyped(""); }}>Откажи</Btn>
            <button className={"del-confirm-btn" + (typed === KEYWORD ? " ready" : "")}
              disabled={typed !== KEYWORD || busy} onClick={doDelete}>
              {busy ? <span className="gp-spin" /> : <><Icon name="trash" size={15} sw={2} />Изтрий</>}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* ---- PROFILE ---- */
function ProfileScreen({ app, nav }) {
  if (!app.auth.loggedIn) {
    return (
      <div className="gp-scroll">
        <div className="gp-section-head"><span className="t">Профил</span></div>
        <EmptyState icon="user" title="Не си влязъл в профил"
          text="Влез или се регистрирай, за да създаваш новини, да коментираш и да получаваш известия."
          action={<div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <Btn variant="primary" size="md" onClick={() => nav.go("auth")}>Вход</Btn>
            <Btn variant="outline" size="md" onClick={() => nav.go("signup")}>Регистрация</Btn>
          </div>} />
      </div>
    );
  }
  const u = app.auth.user;
  const mine = app.myArticles();
  const [name, setName] = React.useState(u.name);
  return (
    <div className="gp-scroll">
      <div className="prof-head">
        <Avatar user={u} size={72} />
        <h1>{u.name}</h1>
        <span className="prof-email">{u.email}</span>
      </div>

      <div className="prof-section">
        <div className="prof-sec-title">Моите публикации</div>
        {mine.length === 0 ? (
          <EmptyState icon="news" title="Нямаш публикации"
            text="Сподели новина от обекта — ще се появи тук след одобрение."
            action={<Btn variant="outline" size="sm" icon="plus" onClick={() => nav.addNews()} style={{ marginTop: 12 }}>Добави новина</Btn>} />
        ) : mine.map((a) => (
          <div key={a.id} className="prof-art" onClick={() => nav.go("article", { id: a.id })}>
            <div className="pa-ic"><CatIcon cat={GPDATA.categories.find((c) => c.id === a.cat)} size={18} /></div>
            <div className="pa-body"><b>{a.title}</b><span>{a.date}</span></div>
            {a.pending ? <Chip tone="warn" icon="hourglass">Изчаква</Chip> : <Chip tone="ok" icon="check">Публикувана</Chip>}
          </div>
        ))}
      </div>

      <div className="prof-section">
        <div className="prof-sec-title">Настройки</div>
        <div className="gp-field"><label>Име и фамилия</label>
          <input className="gp-input" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="gp-field"><label>Имейл адрес</label>
          <input className="gp-input" value={u.email} disabled /></div>
        <Btn variant="ghost" size="md" full onClick={() => app.showToast("Промените са запазени", "success")}>Запази промените</Btn>
      </div>

      <ChangePasswordSection app={app} />

      <button className="prof-logout" onClick={() => nav.logout()}><Icon name="logout" size={18} sw={1.8} /> Изход от профила</button>
      <div style={{ height: 12 }} />
      <DeleteAccountSection app={app} nav={nav} />
    </div>
  );
}

Object.assign(window, { AddNewsScreen, ProfileScreen });
