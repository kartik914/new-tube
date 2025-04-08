import db from "@/lib/db";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const usersRouter = createTRPCRouter({
  // TODO: add total view counts
  getOne: baseProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      })
    )
    .query(async ({ input, ctx }) => {
      const userId = ctx.userId;

      const existingUser = await db.user.findFirst({
        where: {
          id: input.id,
        },
        select: {
          id: true,
          name: true,
          username: true,
          bannerImage: true,
          bannerImageKey: true,
          image: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              subscribers: true,
              Video: true,
            },
          },
          subscribers: {
            select: {
              viewerId: true,
              creatorId: true,
            },
            where: {
              creatorId: input.id,
              viewerId: userId,
            },
          },
        },
      });

      if (!existingUser) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const { _count, subscribers, ...user } = existingUser;

      return {
        ...user,
        isSubscribed: subscribers.length > 0,
        subscribersCount: _count.subscribers,
        // videoViewsCount: _count.VideoViews,
        videosCount: _count.Video,
      };
    }),
});
