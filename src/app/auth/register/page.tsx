"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let params = "?dialog=register";

    searchParams.forEach((value, key) => {
      if (key === "dialog") return;
      params += `&${key}=${value}`;
    });
    router.replace("/" + params);
  }, [router, searchParams]); 
}
