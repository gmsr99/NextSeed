-- FASE 5 / Passo 5.6 — RPCs de métricas para o dashboard da equipa.
-- Aplicada em produção via MCP (apply_migration). Registada aqui para o repo
-- refletir o estado da BD. Idempotente (CREATE OR REPLACE).
--
-- SECURITY DEFINER guardadas por is_team_admin(): agregam analytics_events
-- entre utilizadores (o que a RLS por-utilizador não permitiria a uma view).

-- Painel semanal: famílias ativas, planos gerados vs. consultados a meio da
-- semana (ter/qua/qui), e taxa de edição de planos, por semana ISO.
CREATE OR REPLACE FUNCTION public.admin_weekly_metrics(p_weeks int DEFAULT 8)
  RETURNS TABLE (
    week_start date,
    active_families int,
    plans_generated int,
    plans_viewed_midweek int,
    plan_edit_rate numeric
  )
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
AS $function$
BEGIN
  IF NOT public.is_team_admin() THEN RAISE EXCEPTION 'forbidden'; END IF;

  RETURN QUERY
  WITH weeks AS (
    SELECT generate_series(
      (date_trunc('week', now()) - make_interval(weeks => p_weeks - 1))::date,
      date_trunc('week', now())::date,
      interval '1 week'
    )::date AS wk
  ),
  ev AS (
    SELECT
      date_trunc('week', created_at)::date AS wk,
      event,
      family_id,
      props->>'day_of_week' AS dow
    FROM public.analytics_events
    WHERE created_at >= date_trunc('week', now()) - make_interval(weeks => p_weeks - 1)
  )
  SELECT
    w.wk,
    count(DISTINCT e.family_id)::int AS active_families,
    count(*) FILTER (WHERE e.event = 'plan_generated')::int AS plans_generated,
    count(*) FILTER (WHERE e.event = 'plan_viewed' AND e.dow IN ('2','3','4'))::int AS plans_viewed_midweek,
    round(
      count(DISTINCT e.family_id) FILTER (WHERE e.event = 'plan_edited')::numeric
      / nullif(count(DISTINCT e.family_id) FILTER (WHERE e.event = 'plan_generated'), 0)
    , 2) AS plan_edit_rate
  FROM weeks w
  LEFT JOIN ev e ON e.wk = w.wk
  GROUP BY w.wk
  ORDER BY w.wk;
END;
$function$;

-- Funil registo → 1.º plano + mediana de horas até ao primeiro plano.
CREATE OR REPLACE FUNCTION public.admin_funnel()
  RETURNS TABLE (
    registos int,
    com_primeiro_plano int,
    mediana_horas numeric
  )
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
AS $function$
BEGIN
  IF NOT public.is_team_admin() THEN RAISE EXCEPTION 'forbidden'; END IF;

  RETURN QUERY
  WITH first_plan AS (
    SELECT family_id, min(created_at) AS first_at
    FROM public.analytics_events
    WHERE event = 'plan_generated' AND family_id IS NOT NULL
    GROUP BY family_id
  )
  SELECT
    (SELECT count(*) FROM public.families)::int,
    (SELECT count(*) FROM first_plan)::int,
    (SELECT round(
        percentile_cont(0.5) WITHIN GROUP (
          ORDER BY extract(epoch FROM (fp.first_at - f.created_at)) / 3600.0
        )::numeric, 1)
     FROM first_plan fp
     JOIN public.families f ON f.id = fp.family_id);
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.admin_weekly_metrics(int) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_funnel()            FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.admin_weekly_metrics(int) TO authenticated;
GRANT  EXECUTE ON FUNCTION public.admin_funnel()            TO authenticated;
