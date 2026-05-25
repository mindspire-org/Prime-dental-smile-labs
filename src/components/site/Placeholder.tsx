export function Placeholder({ label, className = "" }: { label: string; className?: string }) {
  return <div className={`placeholder-img ${className}`}>{`[${label}]`}</div>;
}
