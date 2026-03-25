export default function SidebarBrand({ subtitle = "" }) {
  return (
    <div className="rl-brand" style={{ alignItems: "flex-start" }}>
      <img
        src="/icon-512.png"
        alt="RiverLub"
        style={{
          width: 138,
          height: "auto",
          objectFit: "contain",
        }}
      />

      {subtitle ? (
        <div className="rl-brand-subtitle">{subtitle}</div>
      ) : null}
    </div>
  );
}