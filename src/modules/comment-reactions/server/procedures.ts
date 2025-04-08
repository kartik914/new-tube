import db from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";

export const commentReactionRouter = createTRPCRouter({
  like: protectedProcedure
    .input(
      z.object({
        commentId: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { commentId } = input;
      const { id: userId } = ctx.user;

      const existingCommentReaction = await db.commentReactions.findFirst({
        where: {
          commentId,
          userId,
        },
      });

      if (existingCommentReaction) {
        const deletedCommentReaction = await db.commentReactions.delete({
          where: {
            id: existingCommentReaction.id,
          },
        });

        if (deletedCommentReaction.type === "LIKE") {
          return deletedCommentReaction;
        }
      }

      const createdCommentReaction = await db.commentReactions.create({
        data: {
          commentId,
          userId,
          type: "LIKE",
        },
      });

      return createdCommentReaction;
    }),
  dislike: protectedProcedure
    .input(
      z.object({
        commentId: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { commentId } = input;
      const { id: userId } = ctx.user;

      const existingCommentReaction = await db.commentReactions.findFirst({
        where: {
          commentId,
          userId,
        },
      });

      if (existingCommentReaction) {
        const deletedCommentReaction = await db.commentReactions.delete({
          where: {
            id: existingCommentReaction.id,
          },
        });

        if (deletedCommentReaction.type === "DISLIKE") {
          return deletedCommentReaction;
        }
      }

      const createdCommentReaction = await db.commentReactions.create({
        data: {
          commentId,
          userId,
          type: "DISLIKE",
        },
      });

      return createdCommentReaction;
    }),
});
