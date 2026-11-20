function getConfig({ env = process.env } = {}) {
  const port = Number(env.PORT) || 3000;
  const rawCatalogPath = typeof env.CATALOG_PATH === 'string' ? env.CATALOG_PATH.trim() : '';
  const catalogPath = rawCatalogPath ? rawCatalogPath : null;
  return { port, catalogPath };
}

module.exports = { getConfig };
