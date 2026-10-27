import { randomBytes } from "node:crypto";
import type { Course } from "@prisma/client";
import { resolveStudyPayload } from "./resolve-study-payload.js";
import { prisma } from "../prisma.js";

function newVerificationCode() {
  return `EP-${randomBytes(5).toString("hex").toUpperCase()}`;
}

export async function listCourseLessonSlugs(course: Course) {
  const payload = await resolveStudyPayload(course, "__certificate__");
  if (!payload) return [];
  return payload.curriculum.items.map((item) => item.slug);
}

export async function getCourseProgressSummary(course: Course, userId: string) {
  const required = await listCourseLessonSlugs(course);
  const rows = await prisma.lessonProgress.findMany({
    where: { userId, courseId: course.id },
    select: { lessonSlug: true, completedAt: true }
  });
  const completedSet = new Set(rows.map((r) => r.lessonSlug));
  const completed = required.filter((s) => completedSet.has(s)).length;
  const total = required.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isComplete = total > 0 && completed === total;

  return { required, completed, total, percent, isComplete, rows };
}

export async function ensureCourseCertificate(course: Course, userId: string) {
  const summary = await getCourseProgressSummary(course, userId);
  if (!summary.isComplete) {
    return { issued: false as const, summary };
  }

  const completedAt =
    summary.rows.length > 0
      ? summary.rows.reduce(
          (max, r) => (r.completedAt > max ? r.completedAt : max),
          summary.rows[0]!.completedAt
        )
      : new Date();

  const existing = await prisma.courseCertificate.findUnique({
    where: { userId_courseId: { userId, courseId: course.id } }
  });

  if (existing) {
    return { issued: true as const, certificate: existing, summary, created: false };
  }

  let code = newVerificationCode();
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const certificate = await prisma.courseCertificate.create({
        data: {
          userId,
          courseId: course.id,
          verificationCode: code,
          completedAt,
          lessonCount: summary.total
        }
      });
      return { issued: true as const, certificate, summary, created: true };
    } catch {
      code = newVerificationCode();
    }
  }

  throw new Error("Não foi possível gerar código do certificado.");
}

export function certificateToDto(
  certificate: {
    verificationCode: string;
    issuedAt: Date;
    completedAt: Date;
    lessonCount: number;
  },
  course: { title: string; slug: string },
  student: { name: string },
  verifyBaseUrl: string
) {
  const verifyUrl = `${verifyBaseUrl.replace(/\/$/, "")}/certificado/${certificate.verificationCode}`;
  return {
    studentName: student.name,
    courseTitle: course.title,
    courseSlug: course.slug,
    verificationCode: certificate.verificationCode,
    issuedAt: certificate.issuedAt.toISOString(),
    completedAt: certificate.completedAt.toISOString(),
    lessonCount: certificate.lessonCount,
    verifyUrl
  };
}
