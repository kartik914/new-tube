import { auth } from "@/auth";
import db from "@/lib/db";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";
import { z } from "zod";

const f = createUploadthing();

export const ourFileRouter = {
  bannerUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const session = await auth();

      if (!session) throw new UploadThingError("Unauthorized");

      if (!session.user) throw new UploadThingError("Unauthorized");

      if (!session.user.id) throw new UploadThingError("Unauthorized");

      const existingUser = await db.user.findFirst({
        where: {
          id: session.user.id,
        },
      });

      if (!existingUser) throw new UploadThingError("User not found");

      if (existingUser.bannerImageKey) {
        const utapi = new UTApi();
        await utapi.deleteFiles(existingUser.bannerImageKey);

        await db.user.update({
          where: { id: existingUser.id },
          data: {
            bannerImage: null,
            bannerImageKey: null,
          },
        });
      }

      return { userId: existingUser.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await db.user.update({
        where: { id: metadata.userId },
        data: {
          bannerImage: file.ufsUrl,
          bannerImageKey: file.key,
        },
      });

      return { uploadedBy: metadata.userId };
    }),
  thumbnailUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .input(
      z.object({
        videoId: z.string().cuid(),
      })
    )
    .middleware(async ({ input }) => {
      const session = await auth();

      if (!session) throw new UploadThingError("Unauthorized");

      if (!session.user) throw new UploadThingError("Unauthorized");

      if (!session.user.id) throw new UploadThingError("Unauthorized");

      const existingVideo = await db.video.findFirst({
        select: {
          thumbnailKey: true,
        },
        where: {
          id: input.videoId,
          userId: session.user.id,
        },
      });

      if (!existingVideo) throw new UploadThingError("Video not found");

      if (existingVideo.thumbnailKey) {
        const utapi = new UTApi();
        await utapi.deleteFiles(existingVideo.thumbnailKey);

        await db.video.update({
          where: { id: input.videoId, userId: session.user.id },
          data: {
            thumbnailUrl: null,
            thumbnailKey: null,
          },
        });
      }

      return { userId: session.user.id, ...input };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await db.video.update({
        where: { id: metadata.videoId, userId: metadata.userId },
        data: {
          thumbnailUrl: file.ufsUrl,
          thumbnailKey: file.key,
        },
      });

      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
