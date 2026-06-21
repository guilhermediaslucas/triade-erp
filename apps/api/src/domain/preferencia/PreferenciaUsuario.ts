// Preferências de UI por usuário (chave livre + valor em JSON).
// Usado, por ex., para a ordem/visibilidade/largura das colunas das listas.
export interface PreferenciaUsuarioRepository {
  // Retorna o valor (objeto/array/escalar) salvo, ou null se não houver.
  obter(schema: string, usuarioId: string, chave: string): Promise<unknown | null>;
  salvar(schema: string, usuarioId: string, chave: string, valor: unknown): Promise<void>;
}
