import * as z from "zod";

export const CommentsInsertSchema = z.object({
  videoId: z.string(),
  userId: z.string(),
  parentId: z.string().cuid().nullish(),
  comment: z.string(),
});
