import type { Course } from "@prisma/client";
import { resolveStudyPayload } from "./resolve-study-payload.js";
import { prisma } from "../prisma.js";

export type CurriculumItem = {
  order: number;
  slug: string;
  title: string;
  module?: number | null;
  moduleTitle?: string;
  section?: number;
  sectionTitle?: string;
  breadcrumb?: string[];
};

type LessonPanelContent = {
  title: string;
  contextLine: string | null;
  descriptionHtml: string | null;
};

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function getCurriculumItems(course: Course, userId = "__fichamento__"): Promise<CurriculumItem[]> {
  const payload = await resolveStudyPayload(course, userId);
  if (!payload) return [];
  return payload.curriculum.items as CurriculumItem[];
}

export function groupItemsByModule(items: CurriculumItem[]) {
  const map = new Map<number, { title: string; lessons: CurriculumItem[] }>();
  for (const item of items) {
    const mod = item.module ?? 0;
    if (!map.has(mod)) {
      map.set(mod, { title: item.moduleTitle ?? `Módulo ${mod}`, lessons: [] });
    }
    map.get(mod)!.lessons.push(item);
  }
  for (const g of map.values()) {
    g.lessons.sort((a, b) => a.order - b.order);
  }
  return [...map.entries()].sort(([a], [b]) => a - b);
}

function stripTags(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function isNoteContentEmpty(html: string | null | undefined): boolean {
  if (!html?.trim()) return true;
  const text = stripTags(html);
  if (!text) return true;
  if (/^sem anotações nesta aula\.?$/i.test(text)) return true;
  return false;
}

async function loadLessonPanelMap(course: Course, userId: string) {
  const payload = await resolveStudyPayload(course, userId);
  const map = new Map<string, LessonPanelContent>();
  if (!payload) return map;

  const notes = payload.lessonNotes ?? {};
  for (const raw of payload.curriculum.items as CurriculumItem[]) {
    const note = notes[raw.slug];
    const title = note?.displayTitle?.trim() || raw.title;
    const contextLine = raw.breadcrumb?.length ? raw.breadcrumb.join(" › ") : null;
    const descriptionHtml = note?.html?.trim() || null;
    map.set(raw.slug, { title, contextLine, descriptionHtml });
  }
  return map;
}

function buildLessonBlock(
  lesson: CurriculumItem,
  panels: Map<string, LessonPanelContent>,
  notesBySlug: Map<string, { docHtml: string | null }>
) {
  const panel = panels.get(lesson.slug);
  const title = panel?.title ?? lesson.title;
  const contextLine = panel?.contextLine ?? null;
  const description = panel?.descriptionHtml ?? null;
  const studentHtml = notesBySlug.get(lesson.slug)?.docHtml ?? null;

  const parts: string[] = [];

  if (contextLine) {
    parts.push(`<p class="fichamento-lesson-context">${escapeHtml(contextLine)}</p>`);
  }

  parts.push(`<h2>${escapeHtml(title)}</h2>`);

  if (description && !isNoteContentEmpty(description)) {
    parts.push(`<div class="fichamento-lesson-desc">${description}</div>`);
  }

  if (!isNoteContentEmpty(studentHtml)) {
    parts.push(`<div class="fichamento-lesson-notes">${studentHtml!.trim()}</div>`);
  }

  return parts.join("\n");
}

export function compileModuleHtml(
  moduleTitle: string,
  lessons: CurriculumItem[],
  panels: Map<string, LessonPanelContent>,
  notesBySlug: Map<string, { docHtml: string | null }>
) {
  const parts: string[] = [
    `<h1>${escapeHtml(moduleTitle)}</h1>`,
    `<p class="fichamento-meta">Fichamento do módulo · ${lessons.length} aulas · mesmo conteúdo da aula (título, trilha, descrição) + suas anotações</p>`
  ];

  const ordered = [...lessons].sort((a, b) => a.order - b.order);
  for (const lesson of ordered) {
    parts.push(buildLessonBlock(lesson, panels, notesBySlug));
    parts.push("<hr />");
  }

  return parts.join("\n");
}

export function compileCourseHtml(
  courseTitle: string,
  modules: { moduleNumber: number; title: string; html: string }[]
) {
  const parts: string[] = [
    `<h1>Fichamento completo — ${escapeHtml(courseTitle)}</h1>`,
    `<p class="fichamento-meta">Compilado em ${new Date().toLocaleDateString("pt-BR")} · ${modules.length} módulos</p>`
  ];
  for (const mod of modules) {
    parts.push(`<h1>${escapeHtml(mod.title)}</h1>`);
    parts.push(mod.html.replace(/^<h1>[\s\S]*?<\/h1>/i, "").replace(/<p class="fichamento-meta">[\s\S]*?<\/p>/i, ""));
    parts.push("<hr />");
  }
  return parts.join("\n");
}

export async function loadNotesMap(userId: string, courseId: string, slugs: string[]) {
  if (slugs.length === 0) return new Map<string, { docHtml: string | null; docJson: string | null }>();
  const rows = await prisma.studyLessonNote.findMany({
    where: { userId, courseId, lessonSlug: { in: slugs } }
  });
  return new Map(rows.map((r) => [r.lessonSlug, { docHtml: r.docHtml, docJson: r.docJson }]));
}

export async function compileModuleDocument(course: Course, userId: string, moduleNumber: number) {
  const items = await getCurriculumItems(course, userId);
  const groups = groupItemsByModule(items);
  const group = groups.find(([n]) => n === moduleNumber);
  if (!group) return null;

  const [, { title, lessons }] = group;
  const slugs = lessons.map((l) => l.slug);
  const [panels, notes] = await Promise.all([
    loadLessonPanelMap(course, userId),
    loadNotesMap(userId, course.id, slugs)
  ]);
  const docHtml = compileModuleHtml(title, lessons, panels, notes);

  return { moduleNumber, moduleTitle: title, docHtml, lessonCount: lessons.length };
}

export async function compileCourseDocument(course: Course, userId: string) {
  const items = await getCurriculumItems(course, userId);
  const groups = groupItemsByModule(items);
  const panels = await loadLessonPanelMap(course, userId);
  const moduleDocs: { moduleNumber: number; title: string; html: string }[] = [];

  for (const [moduleNumber, { title, lessons }] of groups) {
    const notes = await loadNotesMap(
      userId,
      course.id,
      lessons.map((l) => l.slug)
    );
    moduleDocs.push({
      moduleNumber,
      title,
      html: compileModuleHtml(title, lessons, panels, notes)
    });
  }

  const docHtml = compileCourseHtml(course.title, moduleDocs);
  return { docHtml, moduleCount: moduleDocs.length };
}
