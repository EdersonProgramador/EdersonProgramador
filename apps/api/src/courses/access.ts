import type { Course } from "@prisma/client";
import { prisma } from "../prisma.js";

export async function userCanAccessCourse(
  userId: string,
  role: string,
  course: Course
): Promise<boolean> {
  if (role === "ADMIN") return true;
  if (course.status !== "PUBLISHED") return false;

  if (course.visibility === "INTERNAL") {
    return true;
  }

  if (course.visibility === "PUBLIC_SALE") {
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: { userId_courseId: { userId, courseId: course.id } }
    });
    return enrollment?.status === "ACTIVE";
  }

  return false;
}
