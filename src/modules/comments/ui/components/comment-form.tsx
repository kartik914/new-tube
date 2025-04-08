import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/user-avatar";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { openDialog } from "@/redux/features/auth-dialog-slice";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { CommentsInsertSchema } from "@/schemas/comments-insert-schema";

interface CommentFormProps {
  videoId: string;
  variant?: "reply" | "comment";
  parentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CommentsSchema = CommentsInsertSchema.omit({ userId: true });

export const CommentForm = ({ videoId, onSuccess, onCancel, parentId, variant = "comment" }: CommentFormProps) => {
  const user = useCurrentUser();
  const utils = trpc.useUtils();
  const dispatch = useDispatch();

  const create = trpc.comments.create.useMutation({
    onSuccess: () => {
      utils.comments.getMany.invalidate({ videoId: videoId });
      utils.comments.getMany.invalidate({ videoId: videoId, parentId });
      form.reset();
      toast.success("Comment added");
      onSuccess?.();
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

  const form = useForm<z.infer<typeof CommentsSchema>>({
    resolver: zodResolver(CommentsSchema),
    defaultValues: {
      parentId: parentId || null,
      videoId: videoId,
      comment: "",
    },
  });

  const handleSubmit = (values: z.infer<typeof CommentsSchema>) => {
    create.mutate(values);
  };

  const handleCancel = () => {
    form.reset();
    onCancel?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex gap-4 group">
        <UserAvatar size={"lg"} imageUrl={user?.image || ""} name={user?.name || ""} />
        <div className="flex-1">
          <FormField
            name="comment"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder={variant === "reply" ? "Reply..." : "Add a comment..."}
                    className="resize-none bg-transparent overflow-hidden min-h-0"
                    disabled={create.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="justify-end gap-2 mt-2 flex">
            {onCancel && (
              <Button type="button" variant={"ghost"} onClick={handleCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" size={"sm"} disabled={create.isPending}>
              {variant === "reply" ? "Reply" : "Comment"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
