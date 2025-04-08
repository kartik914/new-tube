import { InfiniteScroll } from "@/components/infinite-scroll";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { Loader2Icon, SquareCheckIcon, SquareIcon } from "lucide-react";
import { toast } from "sonner";

interface PlaylistsAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoId: string;
}

export const PlaylistsAddModal = ({ open, onOpenChange, videoId }: PlaylistsAddModalProps) => {
  const utils = trpc.useUtils();
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    trpc.playlists.getManyForVideo.useInfiniteQuery(
      {
        videoId: videoId,
        limit: DEFAULT_LIMIT,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        enabled: !!videoId && open,
      }
    );

  const addVideo = trpc.playlists.addVideo.useMutation({
    onSuccess: (data) => {
      toast.success("Video added to playlist");
      utils.playlists.getMany.invalidate();
      utils.playlists.getManyForVideo.invalidate({ videoId });
      utils.playlists.getOne.invalidate({ playlistId: data.playlistId });
      utils.playlists.getVideos.invalidate({ playlistId: data.playlistId });
    },
    onError: () => {
      toast.error("Failed to add video to playlist");
    },
  });

  const removeVideo = trpc.playlists.removeVideo.useMutation({
    onSuccess: (data) => {
      toast.success("Video removed from playlist");
      utils.playlists.getMany.invalidate();
      utils.playlists.getManyForVideo.invalidate({ videoId });
      utils.playlists.getOne.invalidate({ playlistId: data.playlistId });
      utils.playlists.getVideos.invalidate({ playlistId: data.playlistId });
    },
    onError: () => {
      toast.error("Failed to add video to playlist");
    },
  });

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} title="Add to Playlist">
      <div className="flex flex-col gap-2">
        {isLoading && (
          <div className="flex justify-center p-4">
            <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {!isLoading &&
          data?.pages
            .flatMap((page) => page.items)
            .map((playlist) => {
              return (
                <Button
                  key={playlist.id}
                  variant="ghost"
                  className="w-full justify-start px-2 [&_svg]:size-5"
                  size={"lg"}
                  onClick={(e) => {
                    // TODO: it is redirecting to video page when clicking on the button
                    e.preventDefault();
                    if (playlist.containsVideo) {
                      removeVideo.mutate({ videoId, playlistId: playlist.id });
                    } else {
                      addVideo.mutate({ videoId, playlistId: playlist.id });
                    }
                  }}
                  disabled={isLoading || addVideo.isPending || removeVideo.isPending}
                >
                  {playlist.containsVideo ? <SquareCheckIcon className="mr-2" /> : <SquareIcon className="mr-2" />}
                  {playlist.name}
                </Button>
              );
            })}
        {!isLoading && (
          <InfiniteScroll
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            isManual
          />
        )}
      </div>
    </ResponsiveDialog>
  );
};
