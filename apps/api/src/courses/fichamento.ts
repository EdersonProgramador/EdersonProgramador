import type { Course } from "@prisma/client";
import { resolveStudyPayload } from "./resolve-study-payload.js";
import { prisma } from "../prisma.js";

type CurriculumItem = {
  order: number;
  slug: string;
  title: string;
  module?: number | null;
  moduleTitle?: string;
};

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function getCurriculumItems(course: Course): Promise<CurriculumItem[]> {
  const payload = await resolveStudyPayload(course, "__fichamento__");
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

function noteBodyHtml(note: { docHtml: string | null } | null | undefined) {
  const html = note?.docHtml?.trim();
  if (!html) return "<p><em>Sem anotações nesta aula.</em></p>";
  return html;
}

export function compileModuleHtml(
  moduleTitle: string,
  lessons: CurriculumItem[],
  notesBySlug: Map<string, { docHtml: string | null }>
) {
  const parts: string[] = [
    `<h1>${escapeHtml(moduleTitle)}</h1>`,
    `<p class="fichamento-meta">Fichamento do módulo · ${lessons.length} aulas</p>`
  ];
  for (const lesson of lessons) {
    parts.push(`<h2>${escapeHtml(lesson.title)}</h2>`);
    parts.push(noteBodyHtml(notesBySlug.get(lesson.slug)));
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
  const items = await getCurriculumItems(course);
  const groups = groupItemsByModule(items);
  const group = groups.find(([n]) => n === moduleNumber);
  if (!group) return null;

  const [, { title, lessons }] = group;
  const notes = await loadNotesMap(
    userId,
    course.id,
    lessons.map((l) => l.slug)
  );
  const docHtml = compileModuleHtml(title, lessons, notes);

  return { moduleNumber, moduleTitle: title, docHtml, lessonCount: lessons.length };
}

export async function compileCourseDocument(course: Course, userId: string) {
  const items = await getCurriculumItems(course);
  const groups = groupItemsByModule(items);
  const moduleDocs: { moduleNumber: number; title: string; html: string }[] = [];

  for (const [moduleNumber, { title, lessons }] of groups) {
    const saved = await prisma.studyModuleFichamento.findUnique({
      where: { userId_courseId_moduleNumber: { userId, courseId: course.id, moduleNumber } }
    });
    if (saved?.docHtml?.trim()) {
      moduleDocs.push({ moduleNumber, title: saved.moduleTitle ?? title, html: saved.docHtml });
      continue;
    }
    const notes = await loadNotesMap(
      userId,
      course.id,
      lessons.map((l) => l.slug)
    );
    moduleDocs.push({
      moduleNumber,
      title,
      html: compileModuleHtml(title, lessons, notes)
    });
  }

  const docHtml = compileCourseHtml(course.title, moduleDocs);
  return { docHtml, moduleCount: moduleDocs.length };
}
