import db from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const subscriptionsRouter = createTRPCRouter({
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
    .query(async ({ input, ctx }) => {
      const { cursor, limit } = input;
      const userId = ctx.userId;

      const data = await db.subscription.findMany({
        where: {
          OR: cursor
            ? [{ updatedAt: { lt: cursor.updatedAt } }, { updatedAt: cursor.updatedAt, id: { lt: cursor.id } }]
            : undefined,
          viewerId: userId,
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              image: true,
              email: true,
              username: true,
              _count: {
                select: {
                  subscribers: true,
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

      const lastItem = items.length > 0 ? items[items.length - 1] : null;
      const nextCursor = lastItem
        ? { id: lastItem.id, updatedAt: lastItem.updatedAt.toISOString() } // Convert back to string for transport
        : null;

      return { items, nextCursor };
    }),
  create: protectedProcedure
    .input(
      z.object({
        userId: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = input;

      if (userId === ctx.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot subscribe to yourself.",
        });
      }

      if (!ctx.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User ID is missing.",
        });
      }

      const subscription = await db.subscription.create({
        data: {
          viewerId: ctx.userId,
          creatorId: userId,
        },
      });

      return subscription;
    }),

  remove: protectedProcedure
    .input(
      z.object({
        userId: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = input;

      if (userId === ctx.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot subscribe to yourself.",
        });
      }

      if (!ctx.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User ID is missing.",
        });
      }

      const deletedSubscription = await db.subscription.delete({
        where: {
          viewerId_creatorId: {
            viewerId: ctx.userId,
            creatorId: userId,
          },
        },
      });

      return deletedSubscription;
    }),
});
