import db from "@/lib/db";
import { mux } from "@/lib/mux";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { UTApi } from "uploadthing/server";
import { VideoSchema } from "@/schemas/video-schema";

export const videoRouter = createTRPCRouter({
  // TODO: Uncomment when trending is implemented
  // getTrending: baseProcedure
  //   .input(
  //     z.object({
  //       cursor: z
  //         .object({
  //           id: z.string().cuid(),
  //           videoViews: z.string(),
  //         })
  //         .nullish(),
  //       limit: z.number().min(1).max(100),
  //     })
  //   )
  //   .query(async ({ input }) => {
  //     const { cursor, limit } = input;

  //     const data = await db.video.findMany({
  //       where: {
  //         AND: [{ visibility: "PUBLIC" }],
  //         OR: cursor
  //           ? [
  //               {
  //                 VideoViews: {
  //                   every: {

  //                   }
  //                 }
  //               },
  //               { updatedAt: cursor.updatedAt, id: { lt: cursor.id } },
  //             ]
  //           : undefined,
  //       },
  //       include: {
  //         user: {
  //           select: {
  //             id: true,
  //             name: true,
  //             image: true,
  //           },
  //         },
  //         _count: {
  //           select: {
  //             VideoViews: true,
  //           },
  //         },
  //       },
  //       orderBy: [{ VideoViews: { _count: "desc" } }, { id: "desc" }],
  //       take: limit + 1,
  //     });

  //     console.log("Trending videos", data, data.length);

  //     const hasMore = data.length > limit;
  //     const items = hasMore ? data.slice(0, -1) : data;

  //     const lastItem = items.length > 0 ? items[items.length - 1] : null;
  //     const nextCursor = lastItem
  //       ? { id: lastItem.id, updatedAt: lastItem.updatedAt.toISOString() } // Convert back to string for transport
  //       : null;

  //     return { items, nextCursor };
  //   }),
  getManySubscribed: protectedProcedure
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

      const data = await db.video.findMany({
        where: {
          OR: cursor
            ? [{ updatedAt: { lt: cursor.updatedAt } }, { updatedAt: cursor.updatedAt, id: { lt: cursor.id } }]
            : undefined,
          visibility: "PUBLIC",
          user: {
            subscribers: {
              some: {
                viewerId: userId,
              },
            },
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              subscribers: true,
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
  getMany: baseProcedure
    .input(
      z.object({
        categoryId: z.string().nullish(),
        userId: z.string().nullish(),
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
      const { cursor, limit, categoryId, userId } = input;

      const data = await db.video.findMany({
        where: {
          AND: [
            {
              AND: categoryId
                ? {
                    categoryId: categoryId,
                  }
                : undefined,
            },
            {
              AND: userId
                ? {
                    userId: userId,
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
  getOne: baseProcedure.input(z.object({ id: z.string().cuid() })).query(async ({ input, ctx }) => {
    const userId = ctx.userId;

    const existingVideo = await db.video.findFirst({
      where: {
        id: input.id,
      },
      include: {
        user: {
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
        _count: {
          select: {
            VideoViews: {
              where: {
                videoId: input.id,
              },
            },
          },
        },
        VideoReactions: {
          where: {
            userId: userId || "",
            videoId: input.id,
          },
          select: {
            type: true,
          },
        },
      },
    });

    const videoReactionCounts = await db.videoReactions.groupBy({
      by: ["type"],
      where: {
        videoId: input.id,
      },
      _count: {
        id: true,
      },
    });

    if (!existingVideo) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    let isSubscribed = false;

    if (userId) {
      const viewerSubscription = await db.subscription.findFirst({
        where: {
          viewerId: userId,
          creatorId: existingVideo.userId,
        },
      });

      if (viewerSubscription) {
        isSubscribed = true;
      }
    }

    const { _count, VideoReactions, ...video } = existingVideo;
    const { _count: userCounts, ...user } = video.user;

    return {
      ...video,
      user: {
        ...user,
        subscriberCount: userCounts.subscribers,
        isViewerSubscribed: isSubscribed,
      },
      likeCount: videoReactionCounts.find((reaction) => reaction.type === "LIKE")?._count.id || 0,
      dislikeCount: videoReactionCounts.find((reaction) => reaction.type === "DISLIKE")?._count.id || 0,
      viewerReaction: VideoReactions[0]?.type || null,
      viewCount: _count.VideoViews,
    };
  }),
  revalidate: protectedProcedure.input(z.object({ id: z.string().cuid() })).mutation(async ({ ctx, input }) => {
    const { id: userId } = ctx.user;

    const existingVideo = await db.video.findFirst({
      where: {
        id: input.id,
        userId: userId,
      },
    });

    if (!existingVideo) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    if (!existingVideo.muxUploadId) {
      throw new TRPCError({ code: "BAD_REQUEST" });
    }

    const directUpload = await mux.video.uploads.retrieve(existingVideo.muxUploadId);

    if (!directUpload || !directUpload.asset_id) {
      throw new TRPCError({ code: "BAD_REQUEST" });
    }

    const asset = await mux.video.assets.retrieve(directUpload.asset_id);

    if (!asset) {
      throw new TRPCError({ code: "BAD_REQUEST" });
    }

    const playbackId = asset.playback_ids?.[0]?.id;

    // TODO: Find a way to revalidate subtitles status too

    const updatedVideo = await db.video.update({
      where: {
        id: input.id,
        userId: userId,
      },
      data: {
        muxStatus: asset.status,
        muxPlaybackId: playbackId,
        muxAssetId: asset.id,
        duration: asset.duration,
      },
    });

    return updatedVideo;
  }),
  restoreThumbnail: protectedProcedure.input(z.object({ id: z.string().cuid() })).mutation(async ({ ctx, input }) => {
    const { id: userId } = ctx.user;

    const existingVideo = await db.video.findFirst({
      where: {
        id: input.id,
        userId: userId,
      },
    });

    if (!existingVideo) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    if (existingVideo.thumbnailKey) {
      const utapi = new UTApi();
      await utapi.deleteFiles(existingVideo.thumbnailKey);

      await db.video.update({
        where: { id: input.id, userId: userId },
        data: {
          thumbnailUrl: null,
          thumbnailKey: null,
        },
      });
    }

    if (!existingVideo.muxPlaybackId) {
      throw new TRPCError({ code: "BAD_REQUEST" });
    }

    const tempThumbnailUrl = `https://image.mux.com/${existingVideo.muxPlaybackId}/thumbnail.jpg`;
    const utapi = new UTApi();

    const uploadedThumbnail = await utapi.uploadFilesFromUrl(tempThumbnailUrl);

    if (!uploadedThumbnail.data) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }

    const { key: thumbnailKey, ufsUrl: thumbnailUrl } = uploadedThumbnail.data;

    const updatedVideo = await db.video.update({
      where: {
        id: input.id,
        userId: userId,
      },
      data: {
        thumbnailUrl: thumbnailUrl,
        thumbnailKey: thumbnailKey,
      },
    });

    return updatedVideo;
  }),
  remove: protectedProcedure.input(z.object({ id: z.string().cuid() })).mutation(async ({ ctx, input }) => {
    const { id: userId } = ctx.user;

    const deletedVideo = await db.video.deleteMany({
      where: {
        id: input.id,
        userId: userId,
      },
    });

    if (!deletedVideo) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    return deletedVideo;
  }),
  update: protectedProcedure.input(VideoSchema).mutation(async ({ ctx, input }) => {
    const { id: userId } = ctx.user;

    const updatedVideo = await db.video.updateMany({
      data: {
        title: input.title,
        description: input.description,
        categoryId: input.categoryId,
        visibility: input.visibility,
        updatedAt: new Date(),
      },
      where: {
        id: input.id,
        userId: userId,
      },
    });

    if (!updatedVideo) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }
  }),

  create: protectedProcedure.mutation(async ({ ctx }) => {
    const { id: userId } = ctx.user;

    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        passthrough: userId,
        playback_policy: ["public"],
        input: [
          {
            generated_subtitles: [
              {
                language_code: "en",
                name: "English",
              },
            ],
          },
        ],
        // TODO: Uncomment if credit card added
        // mp4_support: "standard",
      },
      cors_origin: "*", // TODO: In production set the url
    });

    const video = await db.video.create({
      data: {
        title: "New Video",
        userId: userId,
        url: "https://www.youtube.com/watch?v=6n3pFFPSlW4",
        description: "This is a new video",
        duration: 1,
        muxStatus: "waiting",
        muxUploadId: upload.id,
      },
    });

    return {
      video: video,
      url: upload.url,
    };
  }),
});
