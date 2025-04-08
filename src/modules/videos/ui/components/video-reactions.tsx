import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
import { VideoGetOneOutput } from "../../types";
import { ReactionType } from "@prisma/client";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { openDialog } from "@/redux/features/auth-dialog-slice";

interface VideoReactionsProps {
  videoId: string;
  likeCount: number;
  dislikeCount: number;
  viewerReaction: VideoGetOneOutput["viewerReaction"] | null;
}

export const VideoReactions = ({ videoId, likeCount, dislikeCount, viewerReaction }: VideoReactionsProps) => {
  const utils = trpc.useUtils();
  const dispatch = useDispatch();

  const like = trpc.videoReactions.like.useMutation({
    onSuccess: () => {
      utils.videos.getOne.invalidate({ id: videoId });
      utils.playlists.getLiked.invalidate();
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        toast.error("You need to be logged to perform this action.");
        dispatch(openDialog("login"));
      } else {
        toast.error("Something went wrong.");
      }
    },
  });

  const dislike = trpc.videoReactions.dislike.useMutation({
    onSuccess: () => {
      utils.videos.getOne.invalidate({ id: videoId });
      utils.playlists.getLiked.invalidate();
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        toast.error("You need to be logged to perform this action.");
        dispatch(openDialog("login"));
      } else {
        toast.error("Something went wrong.");
      }
    },
  });

  return (
    <div className="flex items-center flex-none">
      <Button
        onClick={() => like.mutate({ videoId })}
        disabled={like.isPending || dislike.isPending}
        variant={"secondary"}
        className="rounded-l-full rounded-r-none gap-2 pr-4"
      >
        <ThumbsUpIcon className={cn("size-5", viewerReaction === ReactionType.LIKE && "fill-black")} />
        {likeCount}
      </Button>
      <Separator orientation="vertical" className="h-7" />
      <Button
        onClick={() => dislike.mutate({ videoId })}
        disabled={like.isPending || dislike.isPending}
        variant={"secondary"}
        className="rounded-l-none rounded-r-full pl-3"
      >
        <ThumbsDownIcon className={cn("size-5", viewerReaction === ReactionType.DISLIKE && "fill-black")} />
        {dislikeCount}
      </Button>
    </div>
  );
};
