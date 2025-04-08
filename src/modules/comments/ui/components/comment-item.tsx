import Link from "next/link";
import { CommentsGetManyOutput } from "../../types";
import { UserAvatar } from "@/components/user-avatar";
import { formatDistanceToNow } from "date-fns";
import { trpc } from "@/trpc/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  MessageSquareIcon,
  MoreVerticalIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  Trash2Icon,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { openDialog } from "@/redux/features/auth-dialog-slice";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { CommentForm } from "./comment-form";
import { CommentReplies } from "./comment-replies";

interface CommentItemProps {
  comment: CommentsGetManyOutput["items"][number];
  variant?: "reply" | "comment";
}

export const CommentItem = ({ comment, variant = "comment" }: CommentItemProps) => {
  // TODO: Change useDispatch everywhere to make a useAuth hook that returns the userId and dispatch
  const userId = useCurrentUser()?.id;
  const dispatch = useDispatch();
  const utils = trpc.useUtils();

  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [isRepliesOpen, setIsRepliesOpen] = useState(false);

  const remove = trpc.comments.remove.useMutation({
    onSuccess: () => {
      toast.success("Comment deleted");
      utils.comments.getMany.invalidate({ videoId: comment.videoId });
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        toast.error("You need to be logged in to perform this action.");
        dispatch(openDialog("login"));
      } else {
        toast.error("Something went wrong");
      }
    },
  });

  const like = trpc.commentsReactions.like.useMutation({
    onSuccess: () => {
      utils.comments.getMany.invalidate({ videoId: comment.videoId });
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        toast.error("You need to be logged in to perform this action.");
        dispatch(openDialog("login"));
      } else {
        toast.error("Something went wrong");
      }
    },
  });
  const dislike = trpc.commentsReactions.dislike.useMutation({
    onSuccess: () => {
      utils.comments.getMany.invalidate({ videoId: comment.videoId });
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        toast.error("You need to be logged in to perform this action.");
        dispatch(openDialog("login"));
      } else {
        toast.error("Something went wrong");
      }
    },
  });

  return (
    <div>
      <div className="flex gap-4">
        <Link href={`/users/${comment.userId}`}>
          <UserAvatar
            size={variant === "comment" ? "lg" : "sm"}
            imageUrl={comment.user.image || ""}
            name={comment.user.name || ""}
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/users/${comment.userId}`}>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-medium text-sm pb-0.5 ">{comment.user.name}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(comment.createdAt, {
                  addSuffix: true,
                })}
              </span>
            </div>
          </Link>
          <p className="text-sm">{comment.comment}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center">
              <Button
                className="size-8"
                variant="ghost"
                size={"icon"}
                disabled={like.isPending || dislike.isPending}
                onClick={() =>
                  like.mutate({
                    commentId: comment.id,
                  })
                }
              >
                <ThumbsUpIcon className={cn(comment.viewerReaction === "LIKE" && "fill-black")} />
              </Button>
              <span className="text-xs text-muted-foreground">{comment.likeCount}</span>
              <Button
                className="size-8"
                variant="ghost"
                size={"icon"}
                disabled={like.isPending || dislike.isPending}
                onClick={() =>
                  dislike.mutate({
                    commentId: comment.id,
                  })
                }
              >
                <ThumbsDownIcon className={cn(comment.viewerReaction === "DISLIKE" && "fill-black")} />
              </Button>
              <span className="text-xs text-muted-foreground">{comment.dislikeCount}</span>
            </div>
            {variant === "comment" && (
              <Button variant="ghost" size={"sm"} className="h-8" onClick={() => setIsReplyOpen(true)}>
                Reply
              </Button>
            )}
          </div>
        </div>
        {(comment.userId === userId || variant === "comment") && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size={"icon"} className="size-8">
                <MoreVerticalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsReplyOpen(true)}>
                <MessageSquareIcon className="size-4" />
                Reply
              </DropdownMenuItem>
              {userId === comment.userId && (
                <DropdownMenuItem onClick={() => remove.mutate({ id: comment.id })}>
                  <Trash2Icon className="size-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      {isReplyOpen && variant === "comment" && (
        <div className="mt-4 pl-14">
          <CommentForm
            videoId={comment.videoId}
            variant="reply"
            parentId={comment.id}
            onCancel={() => setIsReplyOpen(false)}
            onSuccess={() => {
              setIsReplyOpen(false);
              setIsRepliesOpen(true);
            }}
          />
        </div>
      )}
      {comment.replyCount > 0 && variant === "comment" && (
        <div className="pl-14">
          <Button size={"sm"} onClick={() => setIsRepliesOpen((prev) => !prev)} variant="tertiary">
            {isRepliesOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            {comment.replyCount} {comment.replyCount > 1 ? "Replies" : "Reply"}
          </Button>
        </div>
      )}
      {comment.replyCount > 0 && variant === "comment" && isRepliesOpen && (
        <CommentReplies parentId={comment.id} videoId={comment.videoId} />
      )}
    </div>
  );
};
