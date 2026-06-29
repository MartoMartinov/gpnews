/* ============================================================
   G.P. News — UI kit: icons, placeholders, shared components
   Exposes to window: Icon, ICON_NAMES, Img, Avatar, Btn, Chip,
   Skeleton, Toast, EmptyState, Blueprint, fmtAgo
   ============================================================ */

/* ---------- Icons (stroke, currentColor) ---------- */
const ICONS = {
  // category line icons
  news:   "M4 5h12v14H6a2 2 0 0 1-2-2V5Zm12 0h3a1 1 0 0 1 1 1v11a2 2 0 0 1-2 2M7 8h6M7 11h6M7 14h4",
  road:   "M12 3v3M12 10v3M12 17v3M5 21l2-18M19 21l-2-18",
  metro:  "M7 4h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 6h10M9 19l-2 2m8-2 2 2M9.5 13h.01M14.5 13h.01",
  tower:  "M4 21V9l5-3 5 3M14 21V5l3-2 3 2v16M7 12h.01M7 16h.01M11 12h.01M11 16h.01M17 9h.01M17 13h.01M2 21h20",
  train:  "M6 4h12a2 2 0 0 1 2 2v7a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V6a2 2 0 0 1 2-2Zm0 6h12M8.5 13h.01M15.5 13h.01M8 19l-2 2m12-2 2 2",
  water:  "M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z",
  bolt:   "M13 2 4 14h6l-1 8 9-12h-6l1-8Z",
  people: "M16 19a4 4 0 0 0-8 0M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM5 21h14",
  helmet: "M4 16a8 8 0 0 1 16 0M2 16h20M9 16V9a3 3 0 0 1 3-3M12 6v3",
  smile:  "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8.5 14a4 4 0 0 0 7 0M9 9.5h.01M15 9.5h.01",
  ball:   "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 3l3 5-3 4-3-4 3-5ZM4 9l5 3M20 9l-5 3M7.5 19 9 13M16.5 19 15 13",
  dots:   "M5 12h.01M12 12h.01M19 12h.01",
  // ui glyphs
  menu:   "M4 7h16M4 12h16M4 17h16",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3",
  home:   "M3 11 12 3l9 8M5 9.5V21h14V9.5",
  user:   "M16 19a4 4 0 0 0-8 0M12 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z",
  back:   "M15 5l-7 7 7 7",
  fwd:    "M9 5l7 7-7 7",
  up:     "M5 15l7-7 7 7",
  eye:    "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  eyeoff: "M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M9.4 5.2A9.7 9.7 0 0 1 12 5c6.5 0 10 7 10 7a16 16 0 0 1-2.4 3.2M6.1 6.2A16 16 0 0 0 2 12s3.5 7 10 7a9.6 9.6 0 0 0 3-.5",
  image:  "M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1ZM8 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM3 17l5-4 4 3 4-4 5 5",
  send:   "M4 12l16-8-5 16-3.5-6.5L4 12Z",
  heart:  "M12 20s-7-4.5-9.5-9A4.6 4.6 0 0 1 12 6a4.6 4.6 0 0 1 9.5 5C19 15.5 12 20 12 20Z",
  comment:"M4 5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z",
  share:  "M6 12a3 3 0 1 0 0-0.01M18 6a3 3 0 1 0 0-0.01M18 18a3 3 0 1 0 0-0.01M8.6 10.6l6.8-3.6M8.6 13.4l6.8 3.6",
  plus:   "M12 5v14M5 12h14",
  check:  "M20 6 9 17l-5-5",
  checkc: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8.5 12l2.5 2.5L16 9",
  refresh:"M21 12a9 9 0 1 1-2.6-6.3M21 4v4h-4",
  sort:   "M3 6h12M3 12h9M3 18h5M17 8V18M17 18l3-3M17 18l-3-3",
  close:  "M6 6l12 12M18 6 6 18",
  camera: "M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1ZM12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z",
  clock:  "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3.5 2",
  more:   "M12 6h.01M12 12h.01M12 18h.01",
  bell:   "M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0",
  pen:    "M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z",
  trash:  "M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13",
  logout: "M14 7V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2M9 12h12M21 12l-3-3M21 12l-3 3",
  shield: "M12 3l8 3v6c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V6l8-3ZM9 12l2 2 4-4",
  hourglass:"M7 3h10M7 21h10M8 3c0 4 8 5 8 9s-8 5-8 9M16 3c0 4-8 5-8 9s8 5 8 9",
  filter: "M3 5h18l-7 8v6l-4-2v-4L3 5Z",
  tray:   "M3 13l2.5-7a1 1 0 0 1 .95-.7h11.1a1 1 0 0 1 .95.7L21 13M3 13v5a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-5M3 13h5l1.5 2.2h5L16 13h5",
};
const ICON_NAMES = Object.keys(ICONS);

function Icon({ name, size = 22, sw = 1.7, fill = false, style, className }) {
  const d = ICONS[name];
  if (!d) return null;
  const segs = d.split(" M").map((s, i) => (i === 0 ? s : "M" + s));
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}
      style={style} fill={fill ? "currentColor" : "none"} stroke="currentColor"
      strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {segs.map((seg, i) => <path key={i} d={seg} />)}
    </svg>
  );
}

/* ---------- Blueprint texture (brand background) ---------- */
function Blueprint({ opacity = 1, style }) {
  return (
    <svg className="gp-blueprint" style={{ opacity, ...style }} viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.9">
        <path d="M-20 70 L300 30 L460 60" />
        <path d="M-20 80 L300 40 L460 70" />
        <path d="M40 30 L60 90 L20 92 L40 30Z" />
        <path d="M120 26 L150 86 L100 90 Z" />
        <path d="M210 20 L246 80 L196 84 Z" />
        <circle cx="60" cy="90" r="3" /><circle cx="150" cy="86" r="3" />
        <circle cx="246" cy="80" r="3" />
        <path d="M30 200 h140 v70 h-140 Z" />
        <path d="M30 200 l140 70 M170 200 l-140 70" strokeDasharray="3 4" />
        <path d="M210 210 h120 M210 230 h120 M210 250 h90" />
        <path d="M250 210 v50 M290 210 v50" strokeDasharray="2 3" />
        <text x="34" y="196" fontSize="7" fill="currentColor" stroke="none" fontFamily="monospace">M 1:500</text>
      </g>
    </svg>
  );
}

/* ---------- Photo placeholder (on-brand blueprint panel) ---------- */
const IMG_LABELS = {
  conf: "КРЪГЛА МАСА", rosenec: "ОБЕКТ · РОСЕНЕЦ", "tunnel-dig": "ТУНЕЛ 3 · ИЗКОП",
  drill: "ГАРА ЛОЗОВО", "metro-station": "МЕТРОСТАНЦИЯ", "metro-plan": "СИТУАЦИЯ МС-6",
  "tunnel-road": "ТУНЕЛ ЖЕЛЕЗНИЦА", "infra-truck": "ОБЕКТ МС-4", signing: "ПОДПИСВАНЕ",
  safety: "БЕЗОПАСНОСТ", tower: "ВИСОКО СТР.", water: "ВиК МРЕЖА",
};
function Img({ id, ratio = "16/9", label, radius, className, style }) {
  return (
    <div className={"gp-img " + (className || "")} data-ph={id}
      style={{ aspectRatio: ratio, borderRadius: radius, ...style }}>
      <div className="gp-img-tex"><Blueprint opacity={0.5} /></div>
    </div>
  );
}

/* ---------- Avatar ---------- */
function Avatar({ user, size = 38 }) {
  const off = !!(user && user.official);
  return (
    <div className={"gp-avatar" + (off ? " is-official" : "")}
      style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {user ? user.initials : "?"}
    </div>
  );
}

/* ---------- Button ---------- */
function Btn({ children, variant = "primary", icon, size = "md", full, disabled, loading, onClick, type, style }) {
  return (
    <button type={type || "button"} disabled={disabled || loading} onClick={onClick}
      className={`gp-btn v-${variant} s-${size}` + (full ? " full" : "")} style={style}>
      {loading && <span className="gp-spin" />}
      {!loading && icon && <Icon name={icon} size={size === "sm" ? 16 : 19} sw={2} />}
      <span>{children}</span>
    </button>
  );
}

/* ---------- Chip / Tag ---------- */
function Chip({ children, tone = "default", icon }) {
  return (
    <span className={"gp-chip tone-" + tone}>
      {icon && <Icon name={icon} size={13} sw={2} />}{children}
    </span>
  );
}

/* ---------- Skeleton ---------- */
function Skeleton({ w, h, r = 8, style }) {
  return <div className="gp-skel" style={{ width: w, height: h, borderRadius: r, ...style }} />;
}

/* ---------- Empty state ---------- */
function EmptyState({ icon = "comment", title, text, action }) {
  return (
    <div className="gp-empty">
      <div className="gp-empty-ico"><Icon name={icon} size={30} sw={1.6} /></div>
      <div className="gp-empty-title">{title}</div>
      {text && <div className="gp-empty-text">{text}</div>}
      {action}
    </div>
  );
}

/* ---------- Toast ---------- */
function Toast({ toast }) {
  if (!toast) return null;
  const icon = toast.type === "error" ? "close" : toast.type === "info" ? "bell" : "checkc";
  return (
    <div className={"gp-toast t-" + (toast.type || "success") + (toast.leaving ? " leaving" : "")}>
      <Icon name={icon} size={20} sw={2} />
      <span>{toast.msg}</span>
    </div>
  );
}

/* ---------- helpers ---------- */
function fmtAgo(mins) {
  if (mins < 1) return "сега";
  if (mins < 60) return "преди " + mins + " мин";
  const h = Math.floor(mins / 60);
  if (h < 24) return "преди " + h + " ч";
  const d = Math.floor(h / 24);
  return "преди " + d + " д";
}

Object.assign(window, {
  Icon, ICON_NAMES, Blueprint, Img, Avatar, Btn, Chip, Skeleton, EmptyState, Toast, fmtAgo,
});
