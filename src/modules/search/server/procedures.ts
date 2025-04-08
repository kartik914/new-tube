import db from "@/lib/db";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";

export const searchRouter = createTRPCRouter({
  getMany: baseProcedure
    .input(
      z.object({
        query: z.string().nullish(),
        categoryId: z.string().nullish(),
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
    .query(async ({ input }) => {
      const { cursor, limit, query, categoryId } = input;

      const data = await db.video.findMany({
        where: {
          AND: [
            {
              OR: query
                ? [
                    {
                      title: {
                        contains: query,
                      },
                    },
                    {
                      description: {
                        contains: query,
                      },
                    },
                  ]
                : undefined,
              AND: categoryId
                ? {
                    categoryId: categoryId,
                  }
                : undefined,
            },
          ],
          OR: cursor
            ? [{ updatedAt: { lt: cursor.updatedAt } }, { updatedAt: cursor.updatedAt, id: { lt: cursor.id } }]
            : undefined,
          visibility: "PUBLIC",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              VideoViews: true,
            },
          },
        },
        orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
        take: limit + 1,
      });

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;

      const lastItem = items.length > 0 ? items[items.length - 1] : null;
      const nextCursor = lastItem
        ? { id: lastItem.id, updatedAt: lastItem.updatedAt.toISOString() } // Convert back to string for transport
        : null;

      return { items, nextCursor };
    }),
});
