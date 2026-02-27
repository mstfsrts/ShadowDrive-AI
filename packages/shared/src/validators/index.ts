// ─── ShadowDrive AI — Zod Validators ───
// Shared validation schemas used by backend and frontend.

import { z } from 'zod';

// ─── Scenario Generation ───

export const GenerateRequestSchema = z.object({
  topic: z.string().min(1).max(200),
  difficulty: z.enum(['A0-A1', 'A2', 'B1', 'B2', 'C1-C2']),
});

export const DialogueLineSchema = z.object({
  id: z.number(),
  targetText: z.string(),
  nativeText: z.string(),
  pauseMultiplier: z.number().min(0.5).max(3.0),
});

export const ScenarioSchema = z.object({
  title: z.string(),
  targetLang: z.string(),
  nativeLang: z.string(),
  lines: z.array(DialogueLineSchema).min(4).max(15),
});

// ─── Auth ───

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  displayName: z.string().min(1).max(100).optional(),
});

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// ─── Progress ───

export const SaveProgressSchema = z.object({
  lessonId: z.number().int().positive(),
  completed: z.boolean(),
});

// ─── Favorites ───

export const ToggleFavoriteSchema = z.object({
  type: z.enum(['course', 'scenario']),
  targetId: z.number().int().positive(),
});

// ─── Inferred Types ───

export type GenerateRequestInput = z.infer<typeof GenerateRequestSchema>;
export type DialogueLineInput = z.infer<typeof DialogueLineSchema>;
export type ScenarioInput = z.infer<typeof ScenarioSchema>;
export type RegisterInput = z.infer<typeof RegisterRequestSchema>;
export type LoginInput = z.infer<typeof LoginRequestSchema>;
export type SaveProgressInput = z.infer<typeof SaveProgressSchema>;
export type ToggleFavoriteInput = z.infer<typeof ToggleFavoriteSchema>;
