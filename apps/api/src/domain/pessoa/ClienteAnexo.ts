// Documento anexado ao cadastro de um cliente (contrato, CNPJ, comprovante, etc.).
// Espelha o anexo de título: o arquivo vive no R2; o banco guarda só a ficha.
export interface ClienteAnexo {
  id: string;
  clienteId: string;
  nomeArquivo: string;
  tipo: string;       // mime (application/pdf, image/png, image/jpeg, image/webp)
  tamanho: number;    // bytes
  chave: string;      // object key no R2
  usuarioNome: string | null;
  criadoEm: string;   // ISO
}

export interface NovoClienteAnexo {
  clienteId: string; nomeArquivo: string; tipo: string; tamanho: number; chave: string; usuarioNome: string | null;
}

export interface ClienteAnexoRepository {
  listarPorCliente(schema: string, clienteId: string): Promise<ClienteAnexo[]>;
  buscarPorId(schema: string, id: string): Promise<ClienteAnexo | null>;
  criar(schema: string, a: NovoClienteAnexo): Promise<string>;
  remover(schema: string, id: string): Promise<void>;
}
