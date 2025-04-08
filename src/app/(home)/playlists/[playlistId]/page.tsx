import { DEFAULT_LIMIT } from "@/constants";
import { PlaylistVideosView } from "@/modules/playlists/ui/views/playlist-videos-view";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

interface PlaylistPageProps {
  params: Promise<{ playlistId: string }>;
}

const PlaylistPage = async ({ params }: PlaylistPageProps) => {
  const { playlistId } = await params;

  void trpc.playlists.getOne.prefetch({ playlistId });
  void trpc.playlists.getVideos.prefetchInfinite({
    playlistId: playlistId,
    limit: DEFAULT_LIMIT,
  });

  return (
    <HydrateClient>
      <PlaylistVideosView playlistId={playlistId} />
    </HydrateClient>
  );
};

export default PlaylistPage;
