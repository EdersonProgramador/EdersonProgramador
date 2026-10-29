import { randomBytes } from "node:crypto";
import type { Course } from "@prisma/client";
import { academyLoginUrl, sendAcademyAccessEmail } from "../mail/send-academy-access-email.js";
import { hashPassword } from "../auth.js";
import { prisma } from "../prisma.js";
import { courseContentReady } from "./resolve-study-payload.js";

function temporaryPassword(): string {
  return randomBytes(9).toString("base64url").slice(0, 12);
}

export async function listPublicSaleCourses() {
  const courses = await prisma.course.findMany({
    where: {
      status: "PUBLISHED",
      visibility: "PUBLIC_SALE",
      priceCents: { gt: 0 }
    },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }]
  });

  const cards = [];
  for (const course of courses) {
    cards.push({
      id: course.id,
      slug: course.slug,
      title: course.title,
      summary: course.summary,
      priceCents: course.priceCents,
      currency: course.currency,
      coverUrl: course.coverUrl,
      contentReady: await courseContentReady(course)
    });
  }
  return cards;
}

export async function fulfillAcademyPurchase(input: {
  course: Course;
  name: string;
  email: string;
  phone?: string | null;
  paymentMethod: "PIX" | "CARD";
  log: { info: (obj: unknown, msg?: string) => void; warn: (obj: unknown, msg?: string) => void };
}) {
  const email = input.email.trim().toLowerCase();
  let user = await prisma.user.findUnique({ where: { email } });
  let isNewAccount = false;
  let tempPassword: string | undefined;

  if (!user) {
    isNewAccount = true;
    tempPassword = temporaryPassword();
    user = await prisma.user.create({
      data: {
        name: input.name.trim(),
        email,
        passwordHash: await hashPassword(tempPassword),
        role: "CLIENT",
        status: "ACTIVE",
        company: input.phone?.trim() ? `WhatsApp: ${input.phone.trim()}` : null
      }
    });
  } else if (user.status !== "ACTIVE") {
    throw Object.assign(new Error("Conta inativa. Fale com o suporte."), { statusCode: 403 });
  } else if (input.name.trim() && user.name !== input.name.trim()) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { name: input.name.trim() }
    });
  }

  const order = await prisma.courseOrder.create({
    data: {
      userId: user.id,
      courseId: input.course.id,
      amountCents: input.course.priceCents!,
      status: "PAID",
      paymentMethod: input.paymentMethod,
      provider: "MANUAL_SIM",
      paidAt: new Date()
    }
  });

  await prisma.courseEnrollment.upsert({
    where: { userId_courseId: { userId: user.id, courseId: input.course.id } },
    create: {
      userId: user.id,
      courseId: input.course.id,
      source: "PURCHASE",
      status: "ACTIVE",
      orderId: order.id
    },
    update: {
      status: "ACTIVE",
      source: "PURCHASE",
      orderId: order.id
    }
  });

  const mail = await sendAcademyAccessEmail(
    {
      to: email,
      name: user.name,
      courseTitle: input.course.title,
      loginUrl: academyLoginUrl(),
      isNewAccount,
      temporaryPassword: tempPassword
    },
    input.log
  );

  return {
    orderId: order.id,
    emailSent: mail.sent,
    isNewAccount,
    loginUrl: academyLoginUrl()
  };
}
