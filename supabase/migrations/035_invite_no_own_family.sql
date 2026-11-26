-- 035 — Quem entra por convite não ganha uma família própria (T-12, 26 nov)
--
-- O problema: o convite (generateLink type "invite") cria o utilizador em
-- auth.users e o trigger da 019 criava-lhe logo uma família nova, vazia e com
-- o onboarding por fazer. Como my_family_id() e o AuthContext dão prioridade
-- à família de que se é dono, o adulto convidado via essa família vazia em vez
-- da família que o convidou, e era mandado para o wizard ("adicionem pelo
-- menos uma criança"). Criar crianças aí duplicava-as numa família à parte.
--
-- A correção:
--   1. O trigger não cria família quando o utilizador vem de um convite
--      (os metadados do convite trazem family_id).
--   2. accept_family_invite apaga a família própria do convidado se estiver
--      vazia (sem crianças e com o onboarding por concluir) — cobre convites
--      enviados antes desta migração.
--   3. Limpeza única dos convidados já afetados, com as mesmas condições.
--
-- Idempotente. Aplicar dentro de begin; … commit; a partir do main.

-- 1. Trigger: sem família própria para quem vem de um convite
CREATE OR REPLACE FUNCTION public.handle_new_user_family()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
AS $function$
BEGIN
  IF NULLIF(NEW.raw_user_meta_data->>'family_id', '') IS NOT NULL THEN
    RETURN NEW;  -- convite: junta-se à família que o convidou em accept_family_invite
  END IF;

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

REVOKE EXECUTE ON FUNCTION public.handle_new_user_family() FROM PUBLIC, anon, authenticated;

-- 2. Aceitar o convite remove a família própria, se estiver vazia
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

  -- Família criada automaticamente e nunca usada: sai, para não tapar a do convite.
  DELETE FROM public.families f
  WHERE f.user_id = auth.uid()
    AND f.id <> p_family_id
    AND f.onboarding_completed_at IS NULL
    AND NOT EXISTS (SELECT 1 FROM public.children c WHERE c.family_id = f.id);

  INSERT INTO public.family_members (family_id, user_id, email, role)
  VALUES (p_family_id, auth.uid(), v_email, 'member')
  ON CONFLICT (family_id, user_id)
  DO UPDATE SET email = EXCLUDED.email;

  UPDATE public.family_invites
  SET status = 'accepted'
  WHERE family_id = p_family_id AND lower(email) = lower(v_email);
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.accept_family_invite(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.accept_family_invite(uuid) TO authenticated;

-- 3. Limpeza única: convidados que já aceitaram e ficaram com uma família vazia
DELETE FROM public.families f
WHERE f.onboarding_completed_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM public.children c WHERE c.family_id = f.id)
  AND EXISTS (
    SELECT 1 FROM public.family_members m
    WHERE m.user_id = f.user_id AND m.family_id <> f.id
  );
