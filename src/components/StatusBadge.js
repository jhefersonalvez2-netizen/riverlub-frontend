export default function StatusBadge({ status }) {
  function getClass() {
    if (status === "FINALIZADA") return "rl-badge rl-badge-final";
    if (status === "ABERTA") return "rl-badge rl-badge-open";
    if (status === "APROVADO") return "rl-badge rl-badge-final";
    if (status === "REJEITADO") return "rl-badge rl-badge-danger";
    if (status === "PENDENTE") return "rl-badge rl-badge-open";
    return "rl-badge rl-badge-default";
  }

  return <span className={getClass()}>{status || "SEM STATUS"}</span>;
}