"use client";

import { openDialog } from "@/redux/features/auth-dialog-slice";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { CategoriesSection } from "../sections/categories-section";
import { HomeVideosSection } from "../sections/home-videos-section";

interface HomeViewProps {
  categoryId?: string;
}

export const HomeView = ({ categoryId }: HomeViewProps) => {
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  useEffect(() => {
    const dialog = searchParams.get("dialog");

    if (
      dialog === "login" ||
      dialog === "register" ||
      dialog === "forgot-password" ||
      dialog === "new-verification" ||
      dialog === "error" ||
      dialog === "new-password"
    ) {
      dispatch(openDialog(dialog));
    }
  }, [searchParams, dispatch]);

  return (
    <div className="max-w-[2400px] mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      <CategoriesSection categoryId={categoryId} />
      <HomeVideosSection categoryId={categoryId} />
    </div>
  );
};
