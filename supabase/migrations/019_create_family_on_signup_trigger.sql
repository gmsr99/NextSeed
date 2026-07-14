-- Corrige o registo: com "Confirm email" ligado no Supabase Auth, signUp()
-- não devolve sessão, logo o INSERT client-side em "families" batia sempre na
-- RLS (auth.uid() é null sem sessão) — os utilizadores de teste ficaram sem
-- família. Solução: criar a família no servidor, no mesmo insert transacional
-- de auth.users, via trigger SECURITY DEFINER (padrão oficial Supabase para
-- "criar perfil no registo"). Funciona com ou sem confirmação de email.
--
-- Aplicada em produção via MCP (apply_migration). Registada aqui para o repo
-- refletir o estado da BD. Idempotente (CREATE OR REPLACE, DROP+CREATE TRIGGER).
--
-- Cliente: AuthContext.signUp() já não insere em "families" — passa
-- family_name nos metadados do auth.signUp() e este trigger lê-o.

CREATE OR REPLACE FUNCTION public.handle_new_user_family()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.families (user_id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'family_name', ''), split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS on_auth_user_created_family ON auth.users;
CREATE TRIGGER on_auth_user_created_family
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_family();

-- Só deve correr via trigger, nunca como RPC direta (chamada direta falharia
-- de qualquer forma — NEW só existe em contexto de trigger — mas fecha-se
-- explicitamente o advisor "anon/authenticated pode executar".
REVOKE EXECUTE ON FUNCTION public.handle_new_user_family() FROM PUBLIC, anon, authenticated;
