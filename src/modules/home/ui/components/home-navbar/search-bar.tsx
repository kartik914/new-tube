import { SearchIcon } from "lucide-react";

export const SearchBar = () => {
  return (
    <form className="flex-1 flex items-center justify-center w-full max-w-[600px]">
      <input
        type="text"
        placeholder="Search"
        className="w-full h-10 px-4 rounded-l-3xl border border-gray-200 focus:outline-none focus:border-gray-300"
      />
      <button
        type="submit"
        className="h-10 w-10 bg-gray-100 rounded-r-3xl border border-l-0 border-gray-200 flex items-center justify-center"
      >
        <SearchIcon size={20} />
      </button>
    </form>
  );
};
