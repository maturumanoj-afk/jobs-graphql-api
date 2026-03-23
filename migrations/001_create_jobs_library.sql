-- Migration: Create Jobs Library table
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS jobs_library (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_title        VARCHAR(200)   NOT NULL,
  department       VARCHAR(100)   NOT NULL,
  level            VARCHAR(50)    NOT NULL,
  location         VARCHAR(150)   NOT NULL,
  market_median    NUMERIC(12, 2),
  internal_median  NUMERIC(12, 2),
  compa_ratio      NUMERIC(5, 4),
  status           VARCHAR(50)    NOT NULL DEFAULT 'active',
  employment_type  VARCHAR(50)    NOT NULL DEFAULT 'full_time',
  remote_eligible  BOOLEAN        NOT NULL DEFAULT false,
  headcount_budget INT                     DEFAULT 1,
  created_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- Index for common filter patterns
CREATE INDEX IF NOT EXISTS idx_jobs_status     ON jobs_library (status);
CREATE INDEX IF NOT EXISTS idx_jobs_department ON jobs_library (department);
CREATE INDEX IF NOT EXISTS idx_jobs_level      ON jobs_library (level);
