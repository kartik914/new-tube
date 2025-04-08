import db from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const studioRouter = createTRPCRouter({
  getOne: protectedProcedure.input(z.object({ id: z.string().cuid() })).query(async ({ ctx, input }) => {
    const { id: userId } = ctx.user;
    const { id } = input;

    const video = await db.video.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!video) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    return video;
  }),
  getMany: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().cuid(),
            updatedAt: z.string().transform((dateStr) => {
              return new Date(dateStr);
            }), // Convert string to Date
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit } = input;
      const { id: userId } = ctx.user;

      const data = await db.video.findMany({
        where: {
          userId,
          OR: cursor
            ? [{ updatedAt: { lt: cursor.updatedAt } }, { updatedAt: cursor.updatedAt, id: { lt: cursor.id } }]
            : undefined,
        },
        include: {
          _count: {
            select: {
              Comments: true,
              VideoViews: true,
              VideoReactions: {
                where: {
                  type: "LIKE",
                },
              },
            },
          },
        },
        orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
        take: limit + 1,
      });

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;

      const formattedItems = items.map((item) => {
        const { _count, ...video } = item;
        return {
          ...video,
          viewsCount: _count.VideoViews,
          likesCount: _count.VideoReactions,
          commentsCount: _count.Comments,
        };
      });

      const lastItem = formattedItems.length > 0 ? formattedItems[formattedItems.length - 1] : null;
      const nextCursor = lastItem
        ? { id: lastItem.id, updatedAt: lastItem.updatedAt.toISOString() } // Convert back to string for transport
        : null;

      return { items: formattedItems, nextCursor };
    }),
});
