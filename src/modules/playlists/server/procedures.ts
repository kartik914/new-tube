import db from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const playlistsRouter = createTRPCRouter({
  remove: protectedProcedure
    .input(
      z.object({
        playlistId: z.string().cuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { playlistId } = input;
      const userId = ctx.userId;

      const existingPlaylist = await db.playlists.findFirst({
        where: {
          id: playlistId,
          userId,
        },
      });

      if (!existingPlaylist) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const deletedPlaylist = await db.playlists.delete({
        where: {
          id: playlistId,
        },
      });

      return deletedPlaylist;
    }),
  getOne: protectedProcedure
    .input(
      z.object({
        playlistId: z.string().cuid(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { playlistId } = input;
      const userId = ctx.userId;

      const existingPlaylist = await db.playlists.findFirst({
        where: {
          id: playlistId,
          userId,
        },
      });

      if (!existingPlaylist) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return existingPlaylist;
    }),
  getVideos: protectedProcedure
    .input(
      z.object({
        playlistId: z.string().cuid(),
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
      const { cursor, limit, playlistId } = input;
      const userId = ctx.userId;

      const data = await db.video.findMany({
        where: {
          OR: cursor
            ? [{ updatedAt: { lt: cursor.updatedAt } }, { updatedAt: cursor.updatedAt, id: { lt: cursor.id } }]
            : undefined,
          visibility: "PUBLIC",
          PlaylistVideos: {
            some: {
              playlistId: playlistId,
              playlist: {
                userId: userId,
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
  addVideo: protectedProcedure
    .input(
      z.object({
        playlistId: z.string().cuid(),
        videoId: z.string().cuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { playlistId, videoId } = input;
      const userId = ctx.userId;

      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const existingPlaylist = await db.playlists.findFirst({
        where: {
          id: playlistId,
          userId,
        },
      });

      if (!existingPlaylist) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const existingVideo = await db.video.findFirst({
        where: {
          id: videoId,
        },
      });

      if (!existingVideo) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const existingPlaylistVideo = await db.playlistVideos.findFirst({
        where: {
          playlistId,
          videoId,
        },
      });

      if (existingPlaylistVideo) {
        throw new TRPCError({ code: "CONFLICT", message: "Video already exists in the playlist" });
      }

      const createdPlaylistVideo = await db.playlistVideos.create({
        data: {
          playlistId,
          videoId,
        },
      });

      return createdPlaylistVideo;
    }),
  removeVideo: protectedProcedure
    .input(
      z.object({
        playlistId: z.string().cuid(),
        videoId: z.string().cuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { playlistId, videoId } = input;
      const userId = ctx.userId;

      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const existingPlaylist = await db.playlists.findFirst({
        where: {
          id: playlistId,
          userId,
        },
      });

      if (!existingPlaylist) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const existingVideo = await db.video.findFirst({
        where: {
          id: videoId,
        },
      });

      if (!existingVideo) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const existingPlaylistVideo = await db.playlistVideos.findFirst({
        where: {
          playlistId,
          videoId,
        },
      });

      if (!existingPlaylistVideo) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const deletedPlaylistVideo = await db.playlistVideos.delete({
        where: {
          id: existingPlaylistVideo.id,
        },
      });

      return deletedPlaylistVideo;
    }),
  getManyForVideo: protectedProcedure
    .input(
      z.object({
        videoId: z.string().cuid(),
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
      const { cursor, limit, videoId } = input;
      const userId = ctx.userId;

      const data = await db.playlists.findMany({
        where: {
          OR: cursor
            ? [{ updatedAt: { lt: cursor.updatedAt } }, { updatedAt: cursor.updatedAt, id: { lt: cursor.id } }]
            : undefined,
          userId: userId,
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
              PlaylistVideos: true,
            },
          },
        },
        orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
        take: limit + 1,
      });

      const playlistsWithVideo = await db.playlistVideos.findMany({
        where: {
          videoId: videoId,
        },
        select: {
          playlistId: true,
        },
      });

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;

      const filteredItems = items.map((item) => {
        return {
          ...item,
          containsVideo: playlistsWithVideo
            ? playlistsWithVideo.some((playlist) => playlist.playlistId === item.id)
            : false,
        };
      });

      const lastItem = filteredItems.length > 0 ? filteredItems[filteredItems.length - 1] : null;
      const nextCursor = lastItem
        ? { id: lastItem.id, updatedAt: lastItem.updatedAt.toISOString() } // Convert back to string for transport
        : null;

      return { items: filteredItems, nextCursor };
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
    .query(async ({ input, ctx }) => {
      const { cursor, limit } = input;
      const userId = ctx.userId;

      const data = await db.playlists.findMany({
        where: {
          OR: cursor
            ? [{ updatedAt: { lt: cursor.updatedAt } }, { updatedAt: cursor.updatedAt, id: { lt: cursor.id } }]
            : undefined,
          userId: userId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          PlaylistVideos: {
            include: {
              video: {
                select: {
                  thumbnailUrl: true,
                },
              },
            },
            orderBy: {
              updatedAt: "desc",
            },
            take: 1,
          },
          _count: {
            select: {
              PlaylistVideos: true,
            },
          },
        },
        orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
        take: limit + 1,
      });

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;

      const formattedItems = items.map((item) => {
        const { PlaylistVideos, _count, ...rest } = item;

        return {
          ...rest,
          thumbnailUrl: PlaylistVideos.length > 0 ? PlaylistVideos[0].video.thumbnailUrl : null,
          videoCount: _count.PlaylistVideos,
        };
      });

      const lastItem = formattedItems.length > 0 ? formattedItems[formattedItems.length - 1] : null;
      const nextCursor = lastItem
        ? { id: lastItem.id, updatedAt: lastItem.updatedAt.toISOString() } // Convert back to string for transport
        : null;

      return { items: formattedItems, nextCursor };
    }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { name } = input;
      const userId = ctx.userId;

      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const playlist = await db.playlists.create({
        data: {
          name,
          userId,
        },
      });

      if (!playlist) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      return playlist;
    }),
  getHistory: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().cuid(),
            viewedAt: z.string().transform((dateStr) => {
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
            ? [
                {
                  VideoViews: {
                    some: {
                      updatedAt: { lt: cursor.viewedAt },
                    },
                  },
                },
                {
                  VideoViews: {
                    some: {
                      updatedAt: { equals: cursor.viewedAt },
                    },
                  },
                  id: { lt: cursor.id },
                },
              ]
            : undefined,
          visibility: "PUBLIC",
          VideoViews: {
            some: {
              userId: userId,
            },
          },
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
        ? { id: lastItem.id, viewedAt: lastItem.updatedAt.toISOString() } // Convert back to string for transport
        : null;

      return { items, nextCursor };
    }),
  getLiked: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().cuid(),
            likedAt: z.string().transform((dateStr) => {
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
            ? [
                {
                  VideoReactions: {
                    some: {
                      updatedAt: { lt: cursor.likedAt },
                    },
                  },
                },
                {
                  VideoReactions: {
                    some: {
                      updatedAt: { equals: cursor.likedAt },
                    },
                  },
                  id: { lt: cursor.id },
                },
              ]
            : undefined,
          visibility: "PUBLIC",
          VideoReactions: {
            some: {
              userId: userId,
              type: "LIKE",
            },
          },
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
              VideoReactions: {
                where: { type: "LIKE" },
              },
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
        ? { id: lastItem.id, likedAt: lastItem.updatedAt.toISOString() } // Convert back to string for transport
        : null;

      return { items, nextCursor };
    }),
});
