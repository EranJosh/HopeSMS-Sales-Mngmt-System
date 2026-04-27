-- ============================================================
-- Migration 002: Auth / Rights Tables
-- Creates the user, Module, rights, user_module,
-- and UserModule_Rights tables used for RBAC.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user (
  userId        VARCHAR(50) PRIMARY KEY,
  username      VARCHAR(50),
  firstName     VARCHAR(50),
  lastName      VARCHAR(50),
  email         VARCHAR(100),
  user_type     VARCHAR(20) DEFAULT 'USER',
  record_status VARCHAR(10) DEFAULT 'INACTIVE',
  stamp         VARCHAR(60)
);

CREATE TABLE IF NOT EXISTS public.Module (
  moduleId      VARCHAR(20) PRIMARY KEY,
  moduleName    VARCHAR(50),
  record_status VARCHAR(10),
  stamp         VARCHAR(60)
);

CREATE TABLE IF NOT EXISTS public.rights (
  rightId       VARCHAR(20) PRIMARY KEY,
  rightName     VARCHAR(50),
  right_value   INTEGER,
  moduleId      VARCHAR(20) REFERENCES public.Module(moduleId),
  record_status VARCHAR(10),
  stamp         VARCHAR(60)
);

CREATE TABLE IF NOT EXISTS public.user_module (
  userId       VARCHAR(50) REFERENCES public.user(userId),
  moduleId     VARCHAR(20) REFERENCES public.Module(moduleId),
  rights_value INTEGER DEFAULT 0,
  PRIMARY KEY (userId, moduleId)
);

CREATE TABLE IF NOT EXISTS public.UserModule_Rights (
  userId      VARCHAR(50) REFERENCES public.user(userId),
  rightId     VARCHAR(20) REFERENCES public.rights(rightId),
  right_value INTEGER DEFAULT 0,
  PRIMARY KEY (userId, rightId)
);
