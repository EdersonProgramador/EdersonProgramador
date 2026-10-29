import { isAcademyInternalAdmin } from "@ederson-agencia/shared";
import type { AgencyRole } from "@ederson-agencia/shared";
import type { Course } from "@prisma/client";
import { prisma } from "../prisma.js";

export async function userCanAccessCourse(
  userId: string,
  role: string,
  email: string,
  course: Course
): Promise<boolean> {
  const internalAdmin = isAcademyInternalAdmin({ role: role as AgencyRole, email });

  if (course.visibility === "INTERNAL") {
    return internalAdmin;
  }

  if (internalAdmin) return true;

  if (course.status !== "PUBLISHED") return false;

  if (course.visibility === "PUBLIC_SALE") {
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: { userId_courseId: { userId, courseId: course.id } }
    });
    return enrollment?.status === "ACTIVE";
  }

  return false;
}
