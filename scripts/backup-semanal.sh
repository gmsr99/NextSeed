#!/usr/bin/env bash
# Backup semanal da base de dados da NexSeed (B-05). Corre no computador do
# dono do repositório; nunca no GitHub (o repositório é público).
#
# Precisa de: pg_dump (versão igual ou superior à do Postgres do Supabase) e gpg.
# Variáveis (num ficheiro .env.backup, que o git ignora, ou no terminal):
#   SUPABASE_DB_URL   ligação "Session pooler" do Supabase (Project Settings → Database)
#   BACKUP_DIR        pasta de destino (ex.: uma pasta sincronizada com a cloud)
#   BACKUP_PASSPHRASE frase para cifrar o ficheiro (guardar num gestor de passwords)
set -euo pipefail

cd "$(dirname "$0")/.."
[ -f .env.backup ] && set -a && . ./.env.backup && set +a

: "${SUPABASE_DB_URL:?Falta SUPABASE_DB_URL}"
: "${BACKUP_DIR:?Falta BACKUP_DIR}"
: "${BACKUP_PASSPHRASE:?Falta BACKUP_PASSPHRASE}"
KEEP_WEEKS="${KEEP_WEEKS:-8}"

mkdir -p "$BACKUP_DIR"
stamp="$(date +%Y-%m-%d)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

echo "→ A exportar a base de dados…"
pg_dump "$SUPABASE_DB_URL" \
  --format=custom --no-owner --no-privileges \
  --schema=public --schema=auth --schema=storage \
  --file="$tmp/nexseed-$stamp.dump"

echo "→ A cifrar…"
gpg --batch --yes --pinentry-mode loopback --passphrase "$BACKUP_PASSPHRASE" \
  --symmetric --cipher-algo AES256 \
  --output "$BACKUP_DIR/nexseed-$stamp.dump.gpg" "$tmp/nexseed-$stamp.dump"

echo "→ A verificar que o ficheiro se lê…"
gpg --batch --quiet --pinentry-mode loopback --passphrase "$BACKUP_PASSPHRASE" \
  --decrypt "$BACKUP_DIR/nexseed-$stamp.dump.gpg" > "$tmp/check.dump"
tables="$(pg_restore --list "$tmp/check.dump" | grep -c ' TABLE DATA ' || true)"
echo "   $tables tabelas com dados no backup."
[ "$tables" -gt 10 ] || { echo "✗ Backup suspeito: poucas tabelas." >&2; exit 1; }

echo "→ A apagar backups com mais de $KEEP_WEEKS semanas…"
find "$BACKUP_DIR" -name 'nexseed-*.dump.gpg' -mtime +"$((KEEP_WEEKS * 7))" -print -delete

echo "✓ Backup feito: $BACKUP_DIR/nexseed-$stamp.dump.gpg"
