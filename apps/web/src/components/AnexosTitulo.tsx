import { useI18n } from '../i18n/I18nContext.js';
import { AnexosDocumentos } from './AnexosDocumentos.js';

// Anexos de um título financeiro (NF, conta de energia, etc.). Reaproveita o
// componente genérico AnexosDocumentos com as URLs do financeiro.
export function AnexosTitulo({ tituloId, numero, podeGerenciar, onFechar }: {
  tituloId: string; numero: string; podeGerenciar: boolean; onFechar: () => void;
}) {
  const { t } = useI18n();
  return (
    <AnexosDocumentos
      titulo={`${t('anexo.titulo')} — ${numero}`}
      podeGerenciar={podeGerenciar}
      onFechar={onFechar}
      urls={{
        listar: `/financeiro/titulos/${tituloId}/anexos`,
        enviar: `/financeiro/titulos/${tituloId}/anexos`,
        conteudo: (id) => `/financeiro/anexos/${id}/conteudo`,
        remover: (id) => `/financeiro/anexos/${id}`,
      }}
    />
  );
}
