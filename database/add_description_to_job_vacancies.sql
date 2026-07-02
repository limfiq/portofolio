-- SQL Migration: Add description column to job_vacancies table
-- Run this in your Supabase SQL Editor

ALTER TABLE public.job_vacancies ADD COLUMN IF NOT EXISTS description TEXT;
