import db from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";

export const videoReactionRouter = createTRPCRouter({
  like: protectedProcedure
    .input(
      z.object({
        videoId: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { videoId } = input;
      const { id: userId } = ctx.user;

      const existingVideoReaction = await db.videoReactions.findFirst({
        where: {
          videoId,
          userId,
        },
      });

      if (existingVideoReaction) {
        const deletedVideoReaction = await db.videoReactions.delete({
          where: {
            id: existingVideoReaction.id,
          },
        });

        if (deletedVideoReaction.type === "LIKE") {
          return deletedVideoReaction;
        }
      }

      const createdVideoReaction = await db.videoReactions.create({
        data: {
          videoId,
          userId,
          type: "LIKE",
        },
      });

      return createdVideoReaction;
    }),
    dislike: protectedProcedure
    .input(
      z.object({
        videoId: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { videoId } = input;
      const { id: userId } = ctx.user;

      const existingVideoReaction = await db.videoReactions.findFirst({
        where: {
          videoId,
          userId,
        },
      });

      if (existingVideoReaction) {
        const deletedVideoReaction = await db.videoReactions.delete({
          where: {
            id: existingVideoReaction.id,
          },
        });

        if (deletedVideoReaction.type === "DISLIKE") {
          return deletedVideoReaction;
        }
      }

      const createdVideoReaction = await db.videoReactions.create({
        data: {
          videoId,
          userId,
          type: "DISLIKE",
        },
      });

      return createdVideoReaction;
    }),
});
