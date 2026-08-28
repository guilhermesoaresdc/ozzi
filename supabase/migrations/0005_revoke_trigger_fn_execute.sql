-- handle_new_user() é função de gatilho: não deve ser chamável via RPC.
revoke execute on function public.handle_new_user() from anon, authenticated, public;

-- is_admin() e my_customer_id() permanecem executáveis porque as políticas de RLS
-- as avaliam no papel do chamador. Ambas só revelam fatos sobre o próprio chamador.
