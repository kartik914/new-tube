import db from "@/lib/db";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const commentsRouter = createTRPCRouter({
  remove: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      const { id: userId } = ctx.user;

      const deletedComment = await db.comments.delete({
        where: {
          id: id,
          userId: userId,
        },
      });

      if (!deletedComment) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return deletedComment;
    }),
  create: protectedProcedure
    .input(
      z.object({
        parentId: z.string().cuid().nullish(),
        videoId: z.string().cuid(),
        comment: z.string().min(1).max(500),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { parentId, videoId, comment } = input;
      const { id: userId } = ctx.user;

      const [existingComment] = await db.comments.findMany({
        where: {
          id: parentId || "",
          videoId,
        },
      });

      if (!existingComment && parentId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Something Went Wrong" });
      }

      if (existingComment?.parentId && parentId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Something Went Wrong" });
      }

      const createdComment = await db.comments.create({
        data: {
          userId,
          videoId,
          comment: comment,
          parentId: parentId,
        },
      });

      return createdComment;
    }),
  getMany: baseProcedure
    .input(
      z.object({
        videoId: z.string().cuid(),
        parentId: z.string().cuid().nullish(),
        cursor: z
          .object({
            id: z.string().cuid(),
            updatedAt: z.string().transform((dateStr) => {
              return new Date(dateStr);
            }),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ input, ctx }) => {
      const userId = ctx.userId;
      const { videoId, parentId, cursor, limit } = input;

      const totalCount = await db.comments.count({
        where: {
          videoId,
        },
      });

      const comments = await db.comments.findMany({
        where: {
          videoId,
          parentId: parentId
            ? {
                equals: parentId,
              }
            : null,
          OR: cursor
            ? [{ updatedAt: { lt: cursor.updatedAt } }, { updatedAt: cursor.updatedAt, id: { lt: cursor.id } }]
            : undefined,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          commentReactions: {
            select: {
              userId: true,
              type: true,
            },
          },
        },
        orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
        take: limit + 1,
      });

      // TODO: Fix this if found any better way to do this
      const formattedComments = await Promise.all(
        comments.map(async (comment) => {
          // const commentReactionCounts = await db.commentReactions.groupBy({
          //   by: ["type"],
          //   where: {
          //     commentId: comment.id,
          //   },
          //   _count: {
          //     id: true,
          //   },
          // });

          const commentReplyCount = await db.comments.count({
            where: {
              parentId: comment.id,
            },
          });

          const { commentReactions, ...rest } = comment;

          return {
            ...rest,
            likeCount: commentReactions.filter((reaction) => reaction.type === "LIKE").length,
            dislikeCount: commentReactions.filter((reaction) => reaction.type === "DISLIKE").length,
            viewerReaction: commentReactions.filter((reaction) => reaction.userId === userId)[0]?.type || null,
            replyCount: commentReplyCount,
          };
        })
      );

      const hasMore = formattedComments.length > limit;
      const items = hasMore ? formattedComments.slice(0, -1) : formattedComments;

      const lastItem = items.length > 0 ? items[items.length - 1] : null;
      const nextCursor = lastItem
        ? { id: lastItem.id, updatedAt: lastItem.updatedAt.toISOString() } // Convert back to string for transport
        : null;

      return { totalComments: totalCount, items, nextCursor };
    }),
});
