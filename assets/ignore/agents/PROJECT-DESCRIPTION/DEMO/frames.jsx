/* ============================================================
   Device frames — iOS & Android chrome
   Exposes window.Phone
   ============================================================ */
function StatusBar({ platform, time }) {
  if (platform === "android") {
    return (
      <div className="gp-status">
        <span>{time}</span>
        <span className="right">
          <span className="bars"><i style={{ height: 6 }} /><i style={{ height: 8 }} /><i style={{ height: 10 }} /><i style={{ height: 11 }} /></span>
          <svg width="15" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4C7 4 3 7 1 10l11 11L23 10C21 7 17 4 12 4Z" opacity=".9"/></svg>
          <span className="gp-batt"><i /></span>
        </span>
      </div>
    );
  }
  return (
    <div className="gp-status">
      <span>{time}</span>
      <span className="right">
        <span className="bars"><i style={{ height: 5 }} /><i style={{ height: 7 }} /><i style={{ height: 9 }} /><i style={{ height: 11 }} /></span>
        <svg width="16" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4C7 4 3 7 1 10l11 11L23 10C21 7 17 4 12 4Z"/></svg>
        <span className="gp-batt"><i /></span>
      </span>
    </div>
  );
}

function Phone({ platform = "ios", time = "9:41", children, label }) {
  return (
    <div className="gp-phone-wrap">
      <div className="gp-phone-label">
        <Icon name={platform === "ios" ? "user" : "user"} size={13} sw={1.8} style={{ display: "none" }} />
        <span>{platform === "ios" ? "iOS · iPhone" : "Android · Pixel"}</span>
        {label && <b>{label}</b>}
      </div>
      <div className={"gp-phone " + platform}>
        <div className="gp-screen">
          {platform === "ios" && <div className="gp-notch" />}
          {platform === "android" && <div className="gp-punch" />}
          <StatusBar platform={platform} time={time} />
          {children}
          {platform === "ios"
            ? <div className="gp-homebar" />
            : <div className="gp-navbtns"><span className="b tri" /><span className="b cir" /><span className="b sq" /></div>}
        </div>
      </div>
    </div>
  );
}

window.Phone = Phone;
