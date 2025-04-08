import { AppRouter } from "@/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";

export type VideoGetOneOutput = inferRouterOutputs<AppRouter>["videos"]["getOne"];

// TODO: Change to videos get many
export type VideoGetManyOutput = inferRouterOutputs<AppRouter>["suggestions"]["getMany"];
