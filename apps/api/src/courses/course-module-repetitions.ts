import type { Course } from "@prisma/client";
import { resolveStudyPayload } from "./resolve-study-payload.js";
import { prisma } from "../prisma.js";
import type { RepetitionDto } from "./course-repetitions.js";

export type ModuleRepetitionDto = RepetitionDto & {
  moduleNumber: number;
  moduleTitle: string;
};

async function listModulesOrdered(courseId: string) {
  return prisma.courseModule.findMany({
    where: { courseId },
    orderBy: { sortOrder: "asc" },
    select: { id: true, title: true }
  });
}

export async function resolveModuleByNumber(course: Course, moduleNumber: number) {
  const modules = await listModulesOrdered(course.id);
  const mod = modules[moduleNumber - 1];
  if (!mod) return null;
  return { moduleNumber, moduleId: mod.id, moduleTitle: mod.title };
}

async function moduleLessonSlugs(course: Course, moduleNumber: number, userId: string) {
  const payload = await resolveStudyPayload(course, userId);
  if (!payload) return [];
  return payload.curriculum.items.filter((i) => i.module === moduleNumber).map((i) => i.slug);
}

export async function getModuleProgressSummary(
  course: Course,
  userId: string,
  moduleNumber: number
) {
  const required = await moduleLessonSlugs(course, moduleNumber, userId);
  const rows = await prisma.lessonProgress.findMany({
    where: { userId, courseId: course.id, lessonSlug: { in: required } },
    select: { lessonSlug: true, completedAt: true }
  });
  const completedSet = new Set(rows.map((r) => r.lessonSlug));
  const completed = required.filter((s) => completedSet.has(s)).length;
  const total = required.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isComplete = total > 0 && completed === total;
  return { required, completed, total, percent, isComplete, rows };
}

async function getOrCreateModuleStudyState(userId: string, moduleId: string) {
  return prisma.courseModuleUserStudyState.upsert({
    where: { userId_moduleId: { userId, moduleId } },
    create: { userId, moduleId, activeRepetitionCycle: 1 },
    update: {}
  });
}

export async function getModuleRepetitionDto(
  course: Course,
  userId: string,
  moduleNumber: number
): Promise<ModuleRepetitionDto | null> {
  const resolved = await resolveModuleByNumber(course, moduleNumber);
  if (!resolved) return null;

  const summary = await getModuleProgressSummary(course, userId, moduleNumber);
  if (summary.total === 0) return null;

  const [state, completions] = await Promise.all([
    getOrCreateModuleStudyState(userId, resolved.moduleId),
    prisma.courseModuleRepetitionCompletion.findMany({
      where: { userId, moduleId: resolved.moduleId },
      orderBy: { cycleNumber: "asc" }
    })
  ]);

  const completedCount = completions.length;
  const goalMax = course.repetitionGoalMax;
  const unlimited = goalMax == null;
  const goalReached = !unlimited && completedCount >= goalMax;
  const cycleRecorded = completions.some((row) => row.cycleNumber === state.activeRepetitionCycle);
  const canStartNext = summary.isComplete && cycleRecorded;

  return {
    moduleNumber: resolved.moduleNumber,
    moduleTitle: resolved.moduleTitle,
    goalMax,
    completedCount,
    activeCycle: state.activeRepetitionCycle,
    goalReached,
    unlimited,
    canStartNext
  };
}

export async function getAllModuleRepetitionsDto(course: Course, userId: string) {
  const modules = await listModulesOrdered(course.id);
  const out: ModuleRepetitionDto[] = [];
  for (let i = 0; i < modules.length; i++) {
    const dto = await getModuleRepetitionDto(course, userId, i + 1);
    if (dto) out.push(dto);
  }
  return out;
}

export async function recordModuleRepetitionIfComplete(
  course: Course,
  userId: string,
  moduleNumber: number
) {
  const resolved = await resolveModuleByNumber(course, moduleNumber);
  if (!resolved) {
    return { recorded: false as const, cycleNumber: null, moduleRepetitions: await getAllModuleRepetitionsDto(course, userId) };
  }

  const summary = await getModuleProgressSummary(course, userId, moduleNumber);
  if (!summary.isComplete) {
    return { recorded: false as const, cycleNumber: null, moduleRepetitions: await getAllModuleRepetitionsDto(course, userId) };
  }

  const state = await getOrCreateModuleStudyState(userId, resolved.moduleId);
  const existing = await prisma.courseModuleRepetitionCompletion.findUnique({
    where: {
      userId_moduleId_cycleNumber: {
        userId,
        moduleId: resolved.moduleId,
        cycleNumber: state.activeRepetitionCycle
      }
    }
  });

  if (existing) {
    return {
      recorded: false as const,
      cycleNumber: existing.cycleNumber,
      moduleRepetitions: await getAllModuleRepetitionsDto(course, userId)
    };
  }

  const row = await prisma.courseModuleRepetitionCompletion.create({
    data: {
      userId,
      moduleId: resolved.moduleId,
      cycleNumber: state.activeRepetitionCycle,
      lessonCount: summary.total
    }
  });

  return {
    recorded: true as const,
    cycleNumber: row.cycleNumber,
    moduleRepetitions: await getAllModuleRepetitionsDto(course, userId)
  };
}

export async function startNextModuleRepetition(course: Course, userId: string, moduleNumber: number) {
  const resolved = await resolveModuleByNumber(course, moduleNumber);
  if (!resolved) {
    throw Object.assign(new Error("Módulo não encontrado."), { statusCode: 404 });
  }

  const state = await getOrCreateModuleStudyState(userId, resolved.moduleId);
  const recorded = await prisma.courseModuleRepetitionCompletion.findUnique({
    where: {
      userId_moduleId_cycleNumber: {
        userId,
        moduleId: resolved.moduleId,
        cycleNumber: state.activeRepetitionCycle
      }
    }
  });

  if (!recorded) {
    const summary = await getModuleProgressSummary(course, userId, moduleNumber);
    if (!summary.isComplete) {
      throw Object.assign(new Error("Conclua 100% das aulas deste módulo antes de iniciar a próxima repetição."), {
        statusCode: 400
      });
    }
    await recordModuleRepetitionIfComplete(course, userId, moduleNumber);
  }

  const goalMax = course.repetitionGoalMax;
  if (goalMax != null) {
    const count = await prisma.courseModuleRepetitionCompletion.count({
      where: { userId, moduleId: resolved.moduleId }
    });
    if (count >= goalMax) {
      throw Object.assign(
        new Error(`Meta de ${goalMax} repetição${goalMax === 1 ? "" : "ões"} deste módulo concluída.`),
        { statusCode: 400 }
      );
    }
  }

  const slugs = await moduleLessonSlugs(course, moduleNumber, userId);
  const nextCycle = state.activeRepetitionCycle + 1;

  await prisma.$transaction([
    prisma.lessonProgress.deleteMany({
      where: { userId, courseId: course.id, lessonSlug: { in: slugs } }
    }),
    prisma.courseModuleUserStudyState.update({
      where: { userId_moduleId: { userId, moduleId: resolved.moduleId } },
      data: { activeRepetitionCycle: nextCycle }
    })
  ]);

  return getAllModuleRepetitionsDto(course, userId);
}

export async function moduleNumberForLessonSlug(course: Course, userId: string, lessonSlug: string) {
  const payload = await resolveStudyPayload(course, userId);
  if (!payload) return null;
  const item = payload.curriculum.items.find((i) => i.slug === lessonSlug);
  return item?.module ?? null;
}
