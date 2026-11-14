# Backup semanal da base de dados (B-05)

O Supabase gratuito não faz backups. Este guia é para o dono do repositório fazer uma cópia por semana, cifrada, guardada fora do Supabase. Demora uns 15 minutos a montar e 1 minuto por semana.

> ⚠️ Nunca pôr o backup no GitHub (nem como artefacto de uma Action): o repositório é público e o backup tem dados de crianças.

## 1. Uma vez: preparar

1. **Instalar as ferramentas** no computador:
   - macOS: `brew install postgresql@17 gnupg` (a versão do `pg_dump` tem de ser igual ou superior à do Postgres do Supabase; vê em Project Settings → Infrastructure).
   - Linux: pacotes `postgresql-client-17` e `gnupg`.
2. **Copiar a ligação à base de dados:** no Supabase, botão **Connect** → *Session pooler* → copiar a *connection string* e trocar `[YOUR-PASSWORD]` pela password da base de dados.
3. **Escolher onde guardar:** uma pasta fora do computador ou sincronizada (Google Drive, iCloud, disco externo). Não pode ser pública.
4. **Criar uma frase de cifra** longa e guardá-la num gestor de passwords. Sem ela, o backup não se abre.
5. Na raiz do repositório, criar o ficheiro `.env.backup` (o git ignora-o):

   ```
   SUPABASE_DB_URL=postgresql://postgres.xxxx:PASSWORD@aws-0-eu-xxx.pooler.supabase.com:5432/postgres
   BACKUP_DIR=/caminho/para/a/pasta/de/backups
   BACKUP_PASSPHRASE=a frase longa do gestor de passwords
   ```

## 2. Todas as semanas: correr

```
./scripts/backup-semanal.sh
```

O script exporta os esquemas `public`, `auth` e `storage`, cifra o ficheiro (AES-256), confirma que o ficheiro se volta a abrir e apaga os backups com mais de 8 semanas. No fim diz quantas tabelas foram copiadas.

Para não te esqueceres: um lembrete semanal no calendário, ou um `cron` no computador (ex.: domingo às 21h):

```
0 21 * * 0 cd /caminho/para/NextSeed && ./scripts/backup-semanal.sh >> ~/nexseed-backup.log 2>&1
```

## 3. Uma vez por mês: testar a reposição

Um backup que nunca foi reposto não está testado. Num Postgres local ou num projeto Supabase de teste (nunca no de produção):

```
gpg --decrypt nexseed-AAAA-MM-DD.dump.gpg > nexseed.dump
pg_restore --no-owner --no-privileges --dbname "postgresql://…base-de-teste…" nexseed.dump
```

Depois, confirmar que as tabelas `families`, `children` e `activities` têm linhas. Apagar o ficheiro `nexseed.dump` decifrado no fim.

## 4. O que este backup não cobre

- **As fotos** (bucket `activity-photos`): o `pg_dump` só copia a lista de ficheiros, não as imagens. Para as copiar: Project Settings → Storage → S3 Connection, criar uma chave de acesso e sincronizar com `rclone` para a mesma pasta privada. Fica para um segundo passo.
- **As edge functions e as migrações**: estão no repositório.
- **Os secrets** (chaves do Gemini, Resend): guardar no gestor de passwords.

## 5. Quando fizeres o primeiro

Diz ao Elton a data. Fecha o B-05 e é o que permite reabrir o B-04 (acesso do Claude a uma cópia de teste, nunca à produção).
