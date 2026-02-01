import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export const SearchBar = () => {
    return (
        <div className="sticky top-0 z-40 bg-background border-b border-border shadow-sm">
            <div className="container mx-auto px-4 py-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="O que você precisa hoje?"
                        className="w-full pl-12 pr-4 text-base"
                    />
                </div>
            </div>
        </div>
    );
};
