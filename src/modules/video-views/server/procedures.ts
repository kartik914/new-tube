import db from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";

export const videoViewRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        videoId: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { videoId } = input;
      const { id: userId } = ctx.user;

      const existingVideoView = await db.videoViews.findFirst({
        where: {
          videoId,
          userId,
        },
      });

      if (existingVideoView) {
        return existingVideoView;
      }

      const createdVideoView = await db.videoViews.create({
        data: {
          videoId,
          userId,
        },
      });

      return createdVideoView;
    }),
});
