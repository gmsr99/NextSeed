-- FASE 1 / Passo 1.5 — Endurecer funções SECURITY DEFINER.
-- Aplicada em produção em 2026-06-12 via MCP (apply_migration). Registada aqui
-- para o repo refletir o estado da BD. Operações idempotentes (CREATE OR REPLACE,
-- REVOKE/GRANT), seguras de reaplicar.
--
-- Corrige os advisors:
--   - function_search_path_mutable (search_path fixo + nomes qualificados)
--   - anon_security_definer_function_executable (REVOKE de anon/PUBLIC)

CREATE OR REPLACE FUNCTION public.handle_updated_at()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path = ''
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.my_family_id()
  RETURNS uuid
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = ''
AS $function$
  SELECT COALESCE(
    (SELECT id FROM public.families WHERE user_id = auth.uid() LIMIT 1),
    (SELECT family_id FROM public.family_members WHERE user_id = auth.uid() LIMIT 1)
  )
$function$;

CREATE OR REPLACE FUNCTION public.accept_family_invite(p_family_id uuid)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
AS $function$
DECLARE
  v_email text;
BEGIN
  SELECT email INTO v_email FROM auth.users WHERE id = auth.uid();

  IF NOT EXISTS (
    SELECT 1 FROM public.family_invites
    WHERE family_id = p_family_id
      AND lower(email) = lower(v_email)
      AND status = 'pending'
  ) THEN
    RAISE EXCEPTION 'Convite não encontrado ou já utilizado';
  END IF;

  INSERT INTO public.family_members (family_id, user_id, email, role)
  VALUES (p_family_id, auth.uid(), v_email, 'member')
  ON CONFLICT (family_id, user_id)
  DO UPDATE SET email = EXCLUDED.email;

  UPDATE public.family_invites
  SET status = 'accepted'
  WHERE family_id = p_family_id AND lower(email) = lower(v_email);
END;
$function$;

CREATE OR REPLACE FUNCTION public.remove_family_member(p_user_id uuid)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.families
    WHERE id = public.my_family_id() AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Apenas o responsável da família pode remover membros';
  END IF;

  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Não podes remover-te a ti próprio';
  END IF;

  DELETE FROM public.family_members
  WHERE family_id = public.my_family_id() AND user_id = p_user_id;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.my_family_id()             FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.accept_family_invite(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.remove_family_member(uuid) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.my_family_id()              TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_family_invite(uuid)  TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_family_member(uuid)  TO authenticated;
