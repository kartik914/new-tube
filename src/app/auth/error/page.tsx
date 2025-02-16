"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function ErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let params = "?dialog=error";

    searchParams.forEach((value, key) => {
      if (key === "dialog") return;
      params += `&${key}=${value}`;
    });
    router.replace("/" + params);
  }, [router, searchParams]);
}
