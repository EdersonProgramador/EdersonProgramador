import type { Course } from "@prisma/client";
import { getCourseProgressSummary } from "./certificate.js";
import { prisma } from "../prisma.js";

export type RepetitionDto = {
  goalMax: number | null;
  completedCount: number;
  activeCycle: number;
  goalReached: boolean;
  unlimited: boolean;
  canStartNext: boolean;
};

export async function getOrCreateStudyState(userId: string, courseId: string) {
  return prisma.courseUserStudyState.upsert({
    where: { userId_courseId: { userId, courseId } },
    create: { userId, courseId, activeRepetitionCycle: 1 },
    update: {}
  });
}

export async function getRepetitionDto(course: Course, userId: string): Promise<RepetitionDto> {
  const [state, completions, summary] = await Promise.all([
    getOrCreateStudyState(userId, course.id),
    prisma.courseRepetitionCompletion.findMany({
      where: { userId, courseId: course.id },
      orderBy: { cycleNumber: "asc" }
    }),
    getCourseProgressSummary(course, userId)
  ]);

  const completedCount = completions.length;
  const goalMax = course.repetitionGoalMax;
  const unlimited = goalMax == null;
  const goalReached = !unlimited && completedCount >= goalMax;
  const cycleRecorded = completions.some((row) => row.cycleNumber === state.activeRepetitionCycle);
  const canStartNext = summary.isComplete && cycleRecorded;

  return {
    goalMax,
    completedCount,
    activeCycle: state.activeRepetitionCycle,
    goalReached,
    unlimited,
    canStartNext
  };
}

/** Registra repetição ao atingir 100% no ciclo atual (idempotente). */
export async function recordRepetitionIfComplete(course: Course, userId: string) {
  const summary = await getCourseProgressSummary(course, userId);
  if (!summary.isComplete) {
    return { recorded: false as const, cycleNumber: null, repetitions: await getRepetitionDto(course, userId) };
  }

  const state = await getOrCreateStudyState(userId, course.id);
  const existing = await prisma.courseRepetitionCompletion.findUnique({
    where: {
      userId_courseId_cycleNumber: {
        userId,
        courseId: course.id,
        cycleNumber: state.activeRepetitionCycle
      }
    }
  });

  if (existing) {
    return {
      recorded: false as const,
      cycleNumber: existing.cycleNumber,
      repetitions: await getRepetitionDto(course, userId)
    };
  }

  const row = await prisma.courseRepetitionCompletion.create({
    data: {
      userId,
      courseId: course.id,
      cycleNumber: state.activeRepetitionCycle,
      lessonCount: summary.total
    }
  });

  return {
    recorded: true as const,
    cycleNumber: row.cycleNumber,
    repetitions: await getRepetitionDto(course, userId)
  };
}

export async function startNextRepetition(course: Course, userId: string) {
  const state = await getOrCreateStudyState(userId, course.id);
  const recorded = await prisma.courseRepetitionCompletion.findUnique({
    where: {
      userId_courseId_cycleNumber: {
        userId,
        courseId: course.id,
        cycleNumber: state.activeRepetitionCycle
      }
    }
  });

  if (!recorded) {
    const summary = await getCourseProgressSummary(course, userId);
    if (!summary.isComplete) {
      throw Object.assign(new Error("Conclua 100% das aulas desta repetição antes de iniciar a próxima."), {
        statusCode: 400
      });
    }
    await recordRepetitionIfComplete(course, userId);
  }

  const goalMax = course.repetitionGoalMax;
  if (goalMax != null) {
    const count = await prisma.courseRepetitionCompletion.count({ where: { userId, courseId: course.id } });
    if (count >= goalMax) {
      throw Object.assign(
        new Error(`Meta de ${goalMax} repetição${goalMax === 1 ? "" : "ões"} concluída. Peça ao admin para ampliar a meta, se necessário.`),
        { statusCode: 400 }
      );
    }
  }

  const nextCycle = state.activeRepetitionCycle + 1;

  await prisma.$transaction([
    prisma.lessonProgress.deleteMany({ where: { userId, courseId: course.id } }),
    prisma.courseUserStudyState.update({
      where: { userId_courseId: { userId, courseId: course.id } },
      data: { activeRepetitionCycle: nextCycle }
    })
  ]);

  return getRepetitionDto(course, userId);
}
