import { Box } from "lucide-react";

export function BauEmblem({ size = 25, className = "" }) {
  return (
    <span className={`bau-emblem ${className}`} aria-hidden="true">
      <Box size={size} />
      <span className="bau-emblem-lock" />
    </span>
  );
}