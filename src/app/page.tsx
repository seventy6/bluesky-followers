"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { LoginForm } from "~/components/LoginForm";
import { FollowerList } from "~/components/FollowerList";
import { useAuth } from "~/contexts/auth-context";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { user } = useAuth();

  return (
    <Card className="w-full">
      <CardHeader>
        {isLoggedIn && user ? (
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>
                {user.displayName?.[0] || user.handle[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-lg">{user.displayName}</p>
              <p className="text-sm text-muted-foreground">@{user.handle}</p>
            </div>
            <h2 className="text-2xl font-bold ml-auto">Recent Followers</h2>
          </div>
        ) : (
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
            BlueSky Follower Manager
          </h1>
        )}
      </CardHeader>
      <CardContent>
        {!isLoggedIn ? (
          <LoginForm onSuccess={() => setIsLoggedIn(true)} />
        ) : (
          <FollowerList />
        )}
      </CardContent>
    </Card>
  );
}
