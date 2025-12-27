import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export const SearchBar = () => {
    return (
        <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="container mx-auto px-4 py-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                        type="search"
                        placeholder="O que você precisa hoje?"
                        className="w-full h-14 pl-12 pr-4 text-base rounded-full border-2 border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>
            </div>
        </div>
    );
};
