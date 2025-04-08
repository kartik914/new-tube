"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FRONTEND_URL } from "@/constants";
import { SearchIcon, XIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

export const SearchBar = () => {
  return (
    <Suspense fallback={<Skeleton className="h-10 w-full" />}>
      <SearchBarSuspense />
    </Suspense>
  );
};

const SearchBarSuspense = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const categoryId = searchParams.get("categoryId") || "";

  const [value, setValue] = useState(query);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const url = new URL("/search", FRONTEND_URL);
    const newQuery = value.trim();

    url.searchParams.set("query", encodeURIComponent(newQuery));

    if (categoryId) {
      url.searchParams.set("categoryId", categoryId);
    }

    if (newQuery === "") {
      url.searchParams.delete("query");
    }

    setValue(newQuery);
    router.push(url.toString());
  };

  return (
    <form className="flex-1 flex items-center justify-center w-full max-w-[600px]" onSubmit={handleSearch}>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        type="text"
        placeholder="Search"
        className="w-full h-10 px-4 rounded-l-3xl border border-gray-200 focus:outline-none focus:border-gray-300"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size={"icon"}
          onClick={() => setValue("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
        >
          <XIcon className="text-muted-foreground" />
        </Button>
      )}
      <button
        disabled={!value.trim()}
        type="submit"
        className="h-10 w-10 bg-gray-100 rounded-r-3xl border border-l-0 border-gray-200 flex items-center justify-center"
      >
        <SearchIcon size={20} />
      </button>
    </form>
  );
};
