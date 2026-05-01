/**
 * Matches `next.config.ts` basePath from `NEXT_PUBLIC_BASE_PATH` (GitHub Pages).
 */
export function appBasePath(): string {
  const raw = process.env.NEXT_PUBLIC_BASE_PATH?.trim() ?? "";
  if (!raw || raw === "/") return "";
  return raw.startsWith("/") ? raw.replace(/\/$/, "") : `/${raw.replace(/\/$/, "")}`;
}

export function withBasePath(path: string): string {
  const base = appBasePath();
  const p = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${p}` : p;
}
