"use client";

import { useEffect, useState } from "react";
import { PageHeader, LoadingSkeleton } from "@/components/shared/page-components";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Users, Home, MapPin, FileText } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import Link from "next/link";

interface SearchResult {
  type: "household" | "member" | "ward";
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
}

export default function AdminSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setResults(data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  const iconMap = {
    household: Home,
    member: Users,
    ward: MapPin,
  };

  return (
    <div>
      <PageHeader
        title="Search"
        description="Search across households, residents, and wards"
      />

      <div className="relative max-w-2xl mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search by name, survey ID, address, phone, ward..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-11 h-12 text-base"
          autoFocus
        />
      </div>

      {loading && <LoadingSkeleton count={4} className="lg:grid-cols-1" />}

      {!loading && results.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground mb-3">
            {results.length} results found
          </p>
          {results.map((result) => {
            const Icon = iconMap[result.type] || FileText;
            const href =
              result.type === "household"
                ? `/admin/households/${result.id}`
                : result.type === "ward"
                  ? `/admin/wards`
                  : `/admin/residents`;

            return (
              <Link key={`${result.type}-${result.id}`} href={href}>
                <Card className="hover:border-primary/25 transition-all cursor-pointer animate-fade-in">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/8">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {result.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {result.subtitle}
                      </p>
                    </div>
                    <Badge variant="secondary" className="capitalize shrink-0">
                      {result.type}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {!loading && debouncedQuery.length >= 2 && results.length === 0 && (
        <div className="text-center py-16">
          <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="font-semibold">No results found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try different keywords or check the spelling
          </p>
        </div>
      )}

      {!debouncedQuery && (
        <div className="text-center py-16">
          <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-muted-foreground">
            Start typing to search across all records
          </p>
        </div>
      )}
    </div>
  );
}
