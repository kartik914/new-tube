import * as z from "zod";
import { VideoVisibility } from "@prisma/client";

export const VideoSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  muxStatus: z.string(),
  muxAssetId: z.string().nullable(),
  muxUploadId: z.string().nullable(),
  muxPlaybackId: z.string().nullable(),
  muxTrackId: z.string().nullable(),
  muxTrackStatus: z.string().nullable(),
  url: z.string(),
  thumbnailUrl: z.string().nullable(),
  thumbnailKey: z.string().nullable(),
  previewUrl: z.string().nullable(),
  previewKey: z.string().nullable(),
  duration: z.number().int(),
  visibility: z.nativeEnum(VideoVisibility),
  categoryId: z.string().nullable(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
