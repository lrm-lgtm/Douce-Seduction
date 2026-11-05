-- RLS permite consulta anônima da tabela de administradores apenas como
-- subconsulta vazia: nenhuma linha é exposta, pois não há policy SELECT para anon.
-- Evita erro 42501 ao consultar produtos públicos.
grant select on public.douce_catalog_admins to anon;
