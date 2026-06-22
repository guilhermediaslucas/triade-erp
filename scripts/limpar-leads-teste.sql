-- Remove todos os LEADS (oportunidades em estágio 'lead') da empresa de TESTE.
-- O schema do tenant é 't_' + código da empresa. A empresa "Teste" normalmente vira 't_teste'.
--
-- 1) Confirme o schema correto (lista os schemas de tenant existentes):
--      SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE 't_%';
--    e/ou veja o código pela tabela public.empresa:
--      SELECT codigo, nome, schema_name FROM public.empresa;
--
-- 2) Ajuste o schema abaixo se necessário e rode no Neon (SQL editor).
--    As interações ligadas a esses leads são removidas em cascata (FK ON DELETE CASCADE).

-- Quantos leads existem (confira antes de apagar):
SELECT count(*) AS leads_a_remover
  FROM "t_teste".oportunidade
 WHERE estagio = 'lead';

-- Remoção dos leads:
DELETE FROM "t_teste".oportunidade
 WHERE estagio = 'lead';

-- (Opcional) Para apagar TODAS as oportunidades de teste (qualquer estágio), use:
-- DELETE FROM "t_teste".oportunidade;
