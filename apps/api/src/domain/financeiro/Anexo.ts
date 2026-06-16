// Documento anexado a um título financeiro (NF do fornecedor, conta de energia, etc.).
// O arquivo vive no R2; o banco guarda só a ficha (nome, tipo, tamanho, chave no R2).
export interface TituloAnexo {
  id: string;
  tituloId: string;
  nomeArquivo: string;
  tipo: string;       // mime (application/pdf, image/png, image/jpeg)
  tamanho: number;    // bytes
  chave: string;      // object key no R2
  usuarioNome: string | null;
  criadoEm: string;   // ISO
}

export interface NovoTituloAnexo {
  tituloId: string; nomeArquivo: string; tipo: string; tamanho: number; chave: string; usuarioNome: string | null;
}

export interface TituloAnexoRepository {
  listarPorTitulo(schema: string, tituloId: string): Promise<TituloAnexo[]>;
  buscarPorId(schema: string, id: string): Promise<TituloAnexo | null>;
  criar(schema: string, a: NovoTituloAnexo): Promise<string>;
  remover(schema: string, id: string): Promise<void>;
}
