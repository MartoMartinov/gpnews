/* ============================================================
   Screens: Splash, Onboarding, Login, Signup
   Each is a function component receiving { app, nav, platform }
   ============================================================ */

function GPLogo({ big }) {
  return <div className={"gp-logo" + (big ? " big" : "")} role="img" aria-label="G.P. Group JSC." />;
}

/* real onboarding illustrations cropped from the original app */
function OnbArt({ src }) {
  return (
    <div className="onb-art">
      <img className="onb-illu" src={src} alt="" draggable="false" />
    </div>);

}

function SplashScreen({ nav }) {
  React.useEffect(() => {
    const t = setTimeout(() => nav.replace("onboarding"), 1700);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="gp-view splash">
      <div className="splash-bg"><Blueprint opacity={0.5} /></div>
      <div className="splash-mid">
        <GPLogo big />
        <div className="gp-spin" style={{ marginTop: 40, color: "var(--accent)" }} />
      </div>
    </div>);

}

const ONB = [
{ img: "assets/onb-1.png", title: "G.P. News", text: "Бърз и лесен достъп до полезна информация от строителния бранш — на едно място." },
{ img: "assets/onb-2.png", title: "Премиум съдържание", text: "Регистрирай се за пълен достъп до внимателно подбрано съдържание и известия за важното в бранша." },
{ img: "assets/onb-3.png", title: "Готов ли си?", text: "Чети, коментирай и споделяй новини от обектите. Включи се в разговора." }];


function OnboardingScreen({ nav }) {
  const [i, setI] = React.useState(0);
  const last = i === ONB.length - 1;
  const s = ONB[i];
  return (
    <div className="gp-view onb">
      <button className="onb-skip" onClick={() => nav.replace("auth")}>Пропусни</button>
      <div className="onb-scroll">
        <OnbArt src={s.img} key={i} />
        <h1 className="onb-title">{s.title}</h1>
        <p className="onb-text">{s.text}</p>
      </div>
      <div className="onb-foot">
        <Btn variant="dark" size="lg" full onClick={() => last ? nav.replace("auth") : setI(i + 1)}>
          {last ? "Започни" : "Напред"}
        </Btn>
        <div className="onb-dots">
          {ONB.map((_, k) => <span key={k} className={k === i ? "on" : ""} onClick={() => setI(k)} />)}
        </div>
      </div>
    </div>);

}

function PwField({ label, value, onChange, placeholder, err }) {
  const [show, setShow] = React.useState(false);
  return (
    <div className={"gp-field" + (err ? " err" : "")}>
      {label && <label>{label}</label>}
      <div className="gp-input-wrap">
        <input className="gp-input" type={show ? "text" : "password"} value={value}
        placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
        <button className="eye" onClick={() => setShow(!show)} tabIndex={-1}>
          <Icon name={show ? "eye" : "eyeoff"} size={20} />
        </button>
      </div>
      {err && <div className="errmsg"><Icon name="close" size={13} sw={2.5} />{err}</div>}
    </div>);

}

function LoginScreen({ app, nav }) {
  const [email, setEmail] = React.useState(app._prefillEmail || "");
  const [pw, setPw] = React.useState("");
  const [err, setErr] = React.useState({});
  const [busy, setBusy] = React.useState(false);
  const banner = app._loginBanner;

  function submit() {
    const e = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Невалиден имейл адрес";
    if (pw.length < 4) e.pw = "Паролата е твърде кратка";
    setErr(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      nav.login({ ...GPDATA.users.me, email });
    }, 1100);
  }

  return (
    <div className="gp-view auth">
      <div className="auth-bg"><Blueprint opacity={0.4} /></div>
      <div className="auth-scroll">
        <div className="auth-logo"><GPLogo /></div>
        {banner && <div className="auth-banner"><Icon name="checkc" size={20} sw={2} /><span>{banner}</span></div>}
        <div className="gp-field">
          <input className="gp-input" type="email" placeholder="Имейл адрес"
          value={email} onChange={(e) => {setEmail(e.target.value);}} style={{ borderRadius: "14px" }} />
          {err.email && <div className="errmsg"><Icon name="close" size={13} sw={2.5} />{err.email}</div>}
        </div>
        <PwField placeholder="Парола" value={pw} onChange={setPw} err={err.pw} />
        <p className="auth-cta-sub">Нямаш профил?<br /><a onClick={() => nav.go("signup")}>Регистрирай се за пълен достъп</a></p>
        <Btn variant="primary" size="lg" full loading={busy} onClick={submit}>Вход</Btn>
        <button className="auth-guest" onClick={() => nav.guest()}>Продължи като гост</button>
      </div>
    </div>);

}

function SignupScreen({ nav }) {
  const [f, setF] = React.useState({ name: "", email: "", pw: "", pw2: "" });
  const [err, setErr] = React.useState({});
  const [busy, setBusy] = React.useState(false);
  const set = (k) => (v) => setF((s) => ({ ...s, [k]: v }));

  function submit() {
    const e = {};
    if (f.name.trim().length < 3) e.name = "Въведи име и фамилия";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Невалиден имейл адрес";
    if (f.pw.length < 6) e.pw = "Минимум 6 символа";
    if (f.pw2 !== f.pw) e.pw2 = "Паролите не съвпадат";
    setErr(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      nav.afterSignup(f.email);
    }, 1100);
  }

  return (
    <div className="gp-view auth">
      <div className="auth-bg"><Blueprint opacity={0.4} /></div>
      <div className="auth-scroll">
        <button className="auth-back" onClick={() => nav.back()}><Icon name="back" size={22} /></button>
        <div className="auth-logo sm"><GPLogo /></div>
        <h1 className="auth-h1">Регистрация</h1>
        <div className={"gp-field" + (err.name ? " err" : "")}>
          <input className="gp-input" placeholder="Име и фамилия" value={f.name} onChange={(e) => set("name")(e.target.value)} />
          {err.name && <div className="errmsg"><Icon name="close" size={13} sw={2.5} />{err.name}</div>}
        </div>
        <div className={"gp-field" + (err.email ? " err" : "")}>
          <input className="gp-input" type="email" placeholder="Имейл адрес" value={f.email} onChange={(e) => set("email")(e.target.value)} />
          {err.email && <div className="errmsg"><Icon name="close" size={13} sw={2.5} />{err.email}</div>}
        </div>
        <PwField placeholder="Парола" value={f.pw} onChange={set("pw")} err={err.pw} />
        <PwField placeholder="Повтори паролата" value={f.pw2} onChange={set("pw2")} err={err.pw2} />
        <p className="auth-cta-sub">Имаш регистрация? <a onClick={() => nav.back()}>Влез от тук.</a></p>
        <Btn variant="primary" size="lg" full loading={busy} onClick={submit}>Регистрация</Btn>
      </div>
    </div>);

}

Object.assign(window, { GPLogo, SplashScreen, OnboardingScreen, LoginScreen, SignupScreen });