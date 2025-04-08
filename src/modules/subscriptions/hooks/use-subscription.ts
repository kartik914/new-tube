import { openDialog } from "@/redux/features/auth-dialog-slice";
import { trpc } from "@/trpc/client";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

interface UseSubscriptionProps {
  userId: string;
  isSubscribed: boolean;
  fromVideoId?: string;
}

export const useSubscription = ({ userId, isSubscribed, fromVideoId }: UseSubscriptionProps) => {
  const utils = trpc.useUtils();
  const dispatch = useDispatch();

  const subscribe = trpc.subscriptions.create.useMutation({
    onSuccess: () => {
      toast.success("Subscribed");

      utils.subscriptions.getMany.invalidate();
      utils.videos.getManySubscribed.invalidate();
      utils.users.getOne.invalidate({ id: userId });

      if (fromVideoId) {
        utils.videos.getOne.invalidate({ id: fromVideoId });
      }
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        toast.error("You need to be logged in to subscribe.");
        dispatch(openDialog("login"));
      } else {
        toast.error("Something went wrong.");
      }
    },
  });

  const unsubscribe = trpc.subscriptions.remove.useMutation({
    onSuccess: () => {
      toast.success("Unsubscribed");

      utils.subscriptions.getMany.invalidate();
      utils.videos.getManySubscribed.invalidate();
      utils.users.getOne.invalidate({ id: userId });
      if (fromVideoId) {
        utils.videos.getOne.invalidate({ id: fromVideoId });
      }
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        toast.error("You need to be logged in to subscribe.");
        dispatch(openDialog("login"));
      } else {
        toast.error("Something went wrong.");
      }
    },
  });

  const isPending = subscribe.isPending || unsubscribe.isPending;

  const onClick = () => {
    if (isSubscribed) {
      unsubscribe.mutate({ userId });
    } else {
      subscribe.mutate({ userId });
    }
  };

  return {
    isPending,
    onClick,
  };
};
