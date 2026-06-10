// Nome de schema vem do nosso proprio registro de empresas, mas validamos
// estritamente antes de interpolar em SQL (defesa contra injecao).
const RE = /^[a-z][a-z0-9_]{1,40}$/;

export function validarSchema(schema: string): string {
  if (!RE.test(schema)) {
    throw new Error(`Nome de schema invalido: ${schema}`);
  }
  return schema;
}
