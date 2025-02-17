import { getUserById } from "@/data/user";
import { currentUser } from "@/lib/auth";
import { ratelimit } from "@/lib/ratelimit";
import { initTRPC, TRPCError } from "@trpc/server";
import { cache } from "react";
import superjson from "superjson";

export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  const user = await currentUser();

  return { userId: user?.id };
});

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Context>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async function isAuthed(opts) {
  const { ctx } = opts;

  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "You must be logged in to access this resource" });
  }

  const user = await getUserById(ctx.userId);

  if (!user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "You must be logged in to access this resource" });
  }

  const { success } = await ratelimit.limit(user.id);

  if (!success) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "You have exceeded the rate limit for this resource" });
  }

  return opts.next({
    ctx: {
      ...ctx,
      user,
    },
  });
});
