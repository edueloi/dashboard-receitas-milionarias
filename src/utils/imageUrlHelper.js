export default function getFullImageUrl(input) {
  if (!input) return null;

  if (/^https?:\/\//i.test(input) || /^\/\//.test(input)) return input;

  const uploadPathMatch = String(input).match(/[\\/]uploads[\\/].*/i);
  if (uploadPathMatch && uploadPathMatch[0]) {
    // eslint-disable-next-line no-param-reassign
    input = uploadPathMatch[0];
  }

  const raw = String(input).trim().replace(/\\/g, "/");
  const cleanPath = raw.startsWith("/") ? raw.slice(1) : raw;

  const base = (process.env.REACT_APP_API_URL || "").trim().replace(/\/+$/, "");

  if (!base && process.env.NODE_ENV !== "production") {
    const origin = window?.location?.origin?.replace(/\/+$/, "") || "";
    return `${origin}/${cleanPath}`;
  }

  return `${base}/${cleanPath}`;
}
