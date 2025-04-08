"use client";

import { UserGetOneOutput } from "../../types";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/user-avatar";
import Link from "next/link";
import { SubscriptionButton } from "@/modules/subscriptions/ui/components/subscription-button";
import { useSubscription } from "@/modules/subscriptions/hooks/use-subscription";
import { cn } from "@/lib/utils";

interface UserPageInfoProps {
  user: UserGetOneOutput;
}

export const UserPageInfoSkeleton = () => {
  return (
    <div className="py-6">
      {/* Mobile Layout */}
      <div className="flex flex-col md:hidden">
        <div className="flex items-center gap-3">
          <Skeleton className="w-[60px] h-[60px]" />
          <div className="flex-1 min-w-0">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48 mt-1" />
          </div>
        </div>
        <Skeleton className="h-10 w-full mt-3 rounded-full" />
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex items-start gap-4">
        <Skeleton className="w-[160px] h-[160px] rounded-full" />
        <div className="flex-1 min-w-0">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-48 mt-4" />
          <Skeleton className="h-10 w-32 mt-3 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export const UserPageInfo = ({ user }: UserPageInfoProps) => {
  const userId = useCurrentUser()?.id;
  const { isPending, onClick } = useSubscription({
    userId: user.id,
    isSubscribed: user.isSubscribed,
  });

  return (
    <div className="py-6">
      {/* Mobile Layout */}
      <div className="flex flex-col md:hidden">
        <div className="flex items-center gap-3">
          <UserAvatar
            size="lg"
            imageUrl={user.image || ""}
            name={user.name || ""}
            className="w-[60px] h-[60px]"
            onClick={() => {
              if (user.id === userId) {
                // TODO: Add user update modal
              }
            }}
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold">{user.name}</h1>
            <div className="flex items-center gap-1 text-xs text-muted-foreground  mt-1">
              <span>{user.subscribersCount} subscribers</span>
              <span>•</span>
              <span>{user.videosCount} videos</span>
            </div>
          </div>
        </div>
        {user.id === userId ? (
          <Button type="button" variant={"secondary"} asChild className="w-full mt-3 rounded-full">
            <Link href={"/studio"}>Go to studio</Link>
          </Button>
        ) : (
          <SubscriptionButton
            disabled={isPending}
            isSubscribed={user.isSubscribed}
            onClick={onClick}
            className="w-full mt-3 rounded-full"
          />
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden md:flex items-start gap-4">
        <UserAvatar
          size="xl"
          imageUrl={user.image || ""}
          name={user.name || ""}
          className={cn(user.id === userId && "cursor-pointer hover:opacity-80 transition-opacity duration-300")}
          onClick={() => {
            if (user.id === userId) {
              // TODO: Add user update modal
            }
          }}
        />
        <div className="flex-1 min-w-0">
          <h1 className="text-4xl font-bold">{user.name}</h1>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-3">
            <span>{user.subscribersCount} subscribers</span>
            <span>•</span>
            <span>{user.videosCount} videos</span>
          </div>
          {user.id === userId ? (
            <Button type="button" variant={"secondary"} asChild className="mt-3 rounded-full">
              <Link href={"/studio"}>Go to studio</Link>
            </Button>
          ) : (
            <SubscriptionButton
              disabled={isPending}
              isSubscribed={user.isSubscribed}
              onClick={onClick}
              className="mt-3 rounded-full"
            />
          )}
        </div>
      </div>
    </div>
  );
};
