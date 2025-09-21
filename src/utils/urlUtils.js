export const joinUrlPaths = (baseUrl, path) => {
  // Remove barras no final da URL base
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  // Remove barras no início do caminho
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  return `${cleanBase}/${cleanPath}`;
};
