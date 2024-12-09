"use client";

import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { agent } from "~/lib/api";
import { useAuth } from "~/contexts/auth-context";

interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { setUser } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // First login
      const loginResponse = await agent.login({
        identifier,
        password,
      });

      if (!loginResponse.success) {
        throw new Error("Login failed");
      }

      // Then get profile
      const profile = await agent.getProfile({
        actor: loginResponse.data.handle,
      });

      // Update auth context
      setUser({
        handle: profile.data.handle,
        displayName: profile.data.displayName,
        avatar: profile.data.avatar,
      });

      // Finally call success callback
      onSuccess();
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please check your credentials.");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-4">
      <div className="space-y-2">
        <Label htmlFor="handle">BlueSky Email</Label>
        <Input
          id="handle"
          type="text"
          placeholder="username.bsky.social"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">App Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </Button>
    </form>
  );
}
