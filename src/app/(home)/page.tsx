"use client";

import { openDialog } from "@/redux/features/auth-dialog-slice";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function Home() {
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
    <>
      <div className="relative flex items-top justify-center min-h-screen bg-gray-100 dark:bg-gray-900 sm:items-center sm:pt-0">
        <div className="hidden fixed top-0 right-0 px-6 py-4 sm:block"></div>
        <div className="ml-4 text-center text-sm text-gray-500 sm:text-right sm:ml-0">New Tube</div>
      </div>
    </>
  );
}
