export default function getFullImageUrl(input) {
  if (!input) return null;

  // já é absoluta? (http, https ou protocolo-agnóstica //)
  if (/^https?:\/\//i.test(input) || /^\/\//.test(input)) return input;

  // WORKAROUND: Corrige caminhos absolutos indevidos vindos do back-end
  // Ex: C:/.../uploads/imagem.png -> uploads/imagem.png
  const uploadPathMatch = String(input).match(/[\\/]uploads[\\/].*/i);
  if (uploadPathMatch && uploadPathMatch[0]) {
    // eslint-disable-next-line no-param-reassign
    input = uploadPathMatch[0];
  }

  // normaliza backslashes e remove espaços
  const raw = String(input).trim().replace(/\\/g, "/");

  // se já começa com "/", é relativo à raiz do host
  const cleanPath = raw.startsWith("/") ? raw.slice(1) : raw;

  // base de API vinda do env (produção/dev)
  const base = (process.env.REACT_APP_API_URL || "").trim().replace(/\/+$/, "");
  if (!base) {
    // fallback para a origem atual (em dev/local)
    const origin = window?.location?.origin?.replace(/\/+$/, "") || "";
    return `${origin}/${cleanPath}`;
  }

  return `${base}/${cleanPath}`;
}
