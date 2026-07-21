/*
  # Relax activation_requests NOT NULL constraints

  The app has two flavors of activation requests:
  - Audience activation (audience_* fields present)
  - Moment activation (moment_* fields present)

  Some environments created `activation_requests` manually with NOT NULL constraints
  on fields like company/audience_display_name, causing moment requests to fail.
  We only require `email` to be present; everything else should be optional.
*/

DO $$
BEGIN
  -- If the table doesn't exist (fresh env), nothing to relax here.
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'activation_requests'
  ) THEN
    RETURN;
  END IF;

  -- Drop NOT NULL on any of these columns if they exist.
  -- (We use dynamic SQL because Postgres doesn't support ALTER COLUMN IF EXISTS.)
  PERFORM 1;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='activation_requests' AND column_name='company') THEN
    EXECUTE 'ALTER TABLE activation_requests ALTER COLUMN company DROP NOT NULL';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='activation_requests' AND column_name='looking_for') THEN
    EXECUTE 'ALTER TABLE activation_requests ALTER COLUMN looking_for DROP NOT NULL';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='activation_requests' AND column_name='request_kind') THEN
    EXECUTE 'ALTER TABLE activation_requests ALTER COLUMN request_kind DROP NOT NULL';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='activation_requests' AND column_name='audience_id') THEN
    EXECUTE 'ALTER TABLE activation_requests ALTER COLUMN audience_id DROP NOT NULL';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='activation_requests' AND column_name='audience_name') THEN
    EXECUTE 'ALTER TABLE activation_requests ALTER COLUMN audience_name DROP NOT NULL';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='activation_requests' AND column_name='audience_display_name') THEN
    EXECUTE 'ALTER TABLE activation_requests ALTER COLUMN audience_display_name DROP NOT NULL';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='activation_requests' AND column_name='moment_id') THEN
    EXECUTE 'ALTER TABLE activation_requests ALTER COLUMN moment_id DROP NOT NULL';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='activation_requests' AND column_name='moment_name') THEN
    EXECUTE 'ALTER TABLE activation_requests ALTER COLUMN moment_name DROP NOT NULL';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='activation_requests' AND column_name='notes') THEN
    EXECUTE 'ALTER TABLE activation_requests ALTER COLUMN notes DROP NOT NULL';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='activation_requests' AND column_name='app_variant') THEN
    EXECUTE 'ALTER TABLE activation_requests ALTER COLUMN app_variant DROP NOT NULL';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='activation_requests' AND column_name='client_id') THEN
    EXECUTE 'ALTER TABLE activation_requests ALTER COLUMN client_id DROP NOT NULL';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='activation_requests' AND column_name='user_name') THEN
    EXECUTE 'ALTER TABLE activation_requests ALTER COLUMN user_name DROP NOT NULL';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='activation_requests' AND column_name='user_role') THEN
    EXECUTE 'ALTER TABLE activation_requests ALTER COLUMN user_role DROP NOT NULL';
  END IF;
END $$;

