"use client";

import React, { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { PencilLine, ChevronUp } from "lucide-react";
import { agent } from "~/lib/api";
import { useMediaQuery } from "~/hooks/use-media-query";

interface Post {
  uri: string;
  text: string;
  indexedAt: string;
}

interface Follower {
  did: string;
  handle: string;
  displayName?: string;
  description?: string;
  avatar?: string;
  viewer?: {
    following?: string;
  };
  posts?: Post[];
  showPosts?: boolean;
  loadingPosts?: boolean;
}

interface FilterOptions {
  onlyNotFollowing: boolean;
  hasAvatar: boolean;
  hasBio: boolean;
}

export function FollowerList() {
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    onlyNotFollowing: false,
    hasAvatar: false,
    hasBio: false,
  });

  const isMobile = useMediaQuery("(max-width: 640px)");

  useEffect(() => {
    loadFollowers();
  }, []);

  async function loadFollowers() {
    try {
      const response = await agent.getFollowers({
        actor: agent.session?.did as string,
      });
      setFollowers(response.data.followers);
    } catch (err) {
      console.error("Failed to load followers:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleFollow(did: string) {
    try {
      await agent.follow(did);
      setFollowers(
        followers.map((f) =>
          f.did === did ? { ...f, viewer: { ...f.viewer, following: did } } : f
        )
      );
    } catch (err) {
      console.error("Failed to follow:", err);
    }
  }

  async function handleTogglePosts(did: string) {
    const follower = followers.find((f) => f.did === did);
    if (!follower) return;

    if (follower.posts) {
      setFollowers(
        followers.map((f) =>
          f.did === did ? { ...f, showPosts: !f.showPosts } : f
        )
      );
      return;
    }

    setFollowers(
      followers.map((f) => (f.did === did ? { ...f, loadingPosts: true } : f))
    );

    try {
      const response = await agent.getAuthorFeed({
        actor: follower.did,
        limit: 5,
      });

      const posts = response.data.feed.map((item) => ({
        uri: item.post.uri,
        text: item.post.record.text,
        indexedAt: item.post.indexedAt,
      }));

      setFollowers(
        followers.map((f) =>
          f.did === did
            ? {
                ...f,
                posts,
                showPosts: true,
                loadingPosts: false,
              }
            : f
        )
      );
    } catch (err) {
      console.error("Failed to load posts:", err);
      setFollowers(
        followers.map((f) =>
          f.did === did ? { ...f, loadingPosts: false } : f
        )
      );
    }
  }

  const filteredFollowers = followers.filter((follower) => {
    if (filters.onlyNotFollowing && follower.viewer?.following) return false;
    if (filters.hasAvatar && !follower.avatar) return false;
    if (filters.hasBio && !follower.description?.trim()) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="notFollowing"
            checked={filters.onlyNotFollowing}
            onCheckedChange={(checked) =>
              setFilters({ ...filters, onlyNotFollowing: checked as boolean })
            }
          />
          <Label htmlFor="notFollowing">Not Following</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="hasAvatar"
            checked={filters.hasAvatar}
            onCheckedChange={(checked) =>
              setFilters({ ...filters, hasAvatar: checked as boolean })
            }
          />
          <Label htmlFor="hasAvatar">Has Avatar</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="hasBio"
            checked={filters.hasBio}
            onCheckedChange={(checked) =>
              setFilters({ ...filters, hasBio: checked as boolean })
            }
          />
          <Label htmlFor="hasBio">Has Bio</Label>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">Loading followers...</div>
      ) : (
        <div className="space-y-4">
          {filteredFollowers.map((follower) => (
            <Card key={follower.did}>
              <CardContent className={`p-4 ${isMobile ? "p-3" : "p-6"}`}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className={isMobile ? "h-8 w-8" : "h-10 w-10"}>
                      <AvatarImage src={follower.avatar} />
                      <AvatarFallback>
                        {follower.displayName?.[0] || follower.handle[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        {follower.displayName || follower.handle}
                      </p>
                      <a
                        href={`https://bsky.app/profile/${follower.handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:underline truncate block"
                      >
                        @{follower.handle}
                      </a>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!follower.viewer?.following && (
                      <Button
                        variant="outline"
                        size={isMobile ? "sm" : "default"}
                        onClick={() => handleFollow(follower.did)}
                        className={isMobile ? "min-w-[60px]" : "min-w-[80px]"}
                      >
                        Follow
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size={isMobile ? "sm" : "default"}
                      onClick={() => handleTogglePosts(follower.did)}
                      disabled={follower.loadingPosts}
                    >
                      {follower.loadingPosts ? (
                        "Loading..."
                      ) : follower.showPosts ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <PencilLine className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                {follower.description && (
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                    {follower.description}
                  </p>
                )}
                {follower.showPosts && follower.posts && (
                  <div className="mt-4 space-y-3 border-t pt-3">
                    {follower.posts.map((post) => (
                      <div key={post.uri} className="text-sm">
                        <a
                          href={`https://bsky.app/profile/${
                            follower.handle
                          }/post/${post.uri.split("/").pop()}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline text-muted-foreground"
                        >
                          {post.text}
                        </a>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(post.indexedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
