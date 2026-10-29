import { createReadStream } from "node:fs";
import { extname } from "node:path";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { homePathAfterLogin } from "@ederson-agencia/shared";
import { getAuthUser, toAuthUser } from "../auth.js";
import { prisma } from "../prisma.js";
import { removeAvatarFilesForUser, resolveAvatarFile, saveAvatarUpload } from "../uploads/avatar-storage.js";

const avatarFileParam = z
  .string()
  .regex(/^[a-z0-9]{10,40}\.(jpg|jpeg|png|webp|gif)$/i, "Arquivo inválido.");

function contentTypeForExt(filename: string): string {
  const ext = extname(filename).toLowerCase();
  switch (ext) {
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".jpeg":
    case ".jpg":
    default:
      return "image/jpeg";
  }
}

export async function registerUploadRoutes(app: FastifyInstance) {
  app.get("/uploads/avatars/:filename", async (request, reply) => {
    const { filename } = z.object({ filename: avatarFileParam }).parse(request.params);
    const full = resolveAvatarFile(`/uploads/avatars/${filename}`);
    if (!full) {
      return reply.code(404).send({ message: "Imagem não encontrada." });
    }
    reply.header("Cache-Control", "public, max-age=3600");
    reply.type(contentTypeForExt(filename));
    return reply.send(createReadStream(full));
  });

  app.post("/auth/profile/avatar", async (request, reply) => {
    const tokenUser = await getAuthUser(request);
    if (!tokenUser) {
      return reply.code(401).send({ message: "Faça login para enviar a foto." });
    }

    const part = await request.file();
    if (!part) {
      return reply.code(400).send({ message: "Selecione uma imagem (campo avatar)." });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: tokenUser.id } });
    if (!dbUser || dbUser.status !== "ACTIVE") {
      return reply.code(401).send({ message: "Sessão expirada." });
    }

    const context = tokenUser.authContext ?? "agency";

    try {
      const { avatarUrl } = await saveAvatarUpload(dbUser.id, part.mimetype, part.file);

      const updated = await prisma.user.update({
        where: { id: dbUser.id },
        data: { avatarUrl }
      });

      const authUser = toAuthUser(updated, context);
      const token = await reply.jwtSign(authUser);

      return {
        token,
        user: authUser,
        authContext: context,
        homePath: homePathAfterLogin(authUser.role, context),
        message: "Foto de perfil atualizada."
      };
    } catch (error) {
      const statusCode = (error as { statusCode?: number }).statusCode ?? 400;
      return reply.code(statusCode).send({ message: (error as Error).message });
    }
  });

  app.delete("/auth/profile/avatar", async (request, reply) => {
    const tokenUser = await getAuthUser(request);
    if (!tokenUser) {
      return reply.code(401).send({ message: "Faça login para remover a foto." });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: tokenUser.id } });
    if (!dbUser || dbUser.status !== "ACTIVE") {
      return reply.code(401).send({ message: "Sessão expirada." });
    }

    const context = tokenUser.authContext ?? "agency";
    removeAvatarFilesForUser(dbUser.id);

    const updated = await prisma.user.update({
      where: { id: dbUser.id },
      data: { avatarUrl: null }
    });

    const authUser = toAuthUser(updated, context);
    const token = await reply.jwtSign(authUser);

    return {
      token,
      user: authUser,
      authContext: context,
      homePath: homePathAfterLogin(authUser.role, context),
      message: "Foto removida."
    };
  });
}
