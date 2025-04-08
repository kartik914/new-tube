"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { VideoGridCard, VideoGridCardSkeleton } from "@/modules/videos/ui/components/video-grid-card";
import { VideoRowCard, VideoRowCardSkeleton } from "@/modules/videos/ui/components/video-row-card";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface ResultSectionProps {
  query: string | undefined;
  categoryId: string | undefined;
}

export const ResultSection = ({ query, categoryId }: ResultSectionProps) => {
  return (
    <Suspense key={`${query}-${categoryId}`} fallback={<ResultSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error...</p>}>
        <ResultSectionSuspense query={query} categoryId={categoryId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const ResultSectionSkeleton = () => {
  return (
    <div>
      <div className="hidden flex-col gap-4 md:flex">
        {Array.from({ length: 5 }).map((_, index) => {
          return (
            <div key={index} className="animate-pulse">
              <VideoRowCardSkeleton />
            </div>
          );
        })}
      </div>
      <div className="flex flex-col gap-4 p-4 gap-y-10 pt-6 md:hidden">
        {Array.from({ length: 5 }).map((_, index) => {
          return (
            <div key={index} className="animate-pulse">
              <VideoGridCardSkeleton />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ResultSectionSuspense = ({ query, categoryId }: ResultSectionProps) => {
  const [result, resultQuery] = trpc.search.getMany.useSuspenseInfiniteQuery(
    {
      query,
      categoryId,
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  return (
    <>
      <div className="flex flex-col gap-4 gap-y-10 md:hidden">
        {result.pages
          .flatMap((page) => page.items)
          .map((video) => {
            return <VideoGridCard key={video.id} data={video} />;
          })}
      </div>
      <div className="hidden flex-col gap-4 md:flex">
        {result.pages
          .flatMap((page) => page.items)
          .map((video) => {
            return <VideoRowCard key={video.id} data={video} />;
          })}
      </div>
      <InfiniteScroll
        hasNextPage={resultQuery.hasNextPage}
        isFetchingNextPage={resultQuery.isFetchingNextPage}
        fetchNextPage={resultQuery.fetchNextPage}
      />
    </>
  );
};
