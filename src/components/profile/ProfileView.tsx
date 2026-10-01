"use client";

import { useRef, useState } from "react";
import {
  Camera,
  LogOut,
  Monitor,
  Sparkles,
  Waves,
  Loader2,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { EmojiText } from "@/components/ui/EmojiText";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { updateUserProfile, isUsernameAvailable } from "@/services/userService";
import { fileToAvatarDataUrl } from "@/services/imageService";
import { InstallAppSection } from "@/components/pwa/InstallAppSection";
import { NotificationSettings } from "./NotificationSettings";
import { cn, formatMemberSince, getFriendlyErrorMessage, isUserOnline } from "@/lib/utils";
import type { UserProfile } from "@/types";

interface ProfileViewProps {
  user: UserProfile;
  onSignOut: () => void;
  friendsCount?: number;
  chatsCount?: number;
}

const USERNAME_PATTERN = /^[a-z0-9._]{3,20}$/;

export function ProfileView({
  user,
  onSignOut,
  friendsCount = 0,
  chatsCount = 0,
}: ProfileViewProps) {
  const { motion, setMotion } = useTheme();
  const { addToast } = useToast();

  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    const name = displayName.trim();
    const handle = username.trim().toLowerCase().replace(/^@/, "");
    const about = bio.trim();

    if (!name) {
      addToast("Display name cannot be empty.", "error");
      return;
    }
    if (!USERNAME_PATTERN.test(handle)) {
      addToast(
        "Username must be 3-20 characters and use only letters, numbers, dots, or underscores.",
        "error"
      );
      return;
    }

    setSaving(true);
    try {
      if (handle !== user.username) {
        const available = await isUsernameAvailable(handle, user.uid);
        if (!available) {
          addToast("That username is already taken.", "error");
          return;
        }
      }
      await updateUserProfile(user.uid, {
        displayName: name,
        username: handle,
        bio: about,
      });
      setEditing(false);
      addToast("Profile updated", "success", "Your changes are live.");
    } catch (error) {
      console.error("Failed to update profile", error);
      addToast(getFriendlyErrorMessage(error), "error");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      await updateUserProfile(user.uid, { photoURL: dataUrl });
      addToast("Profile photo updated");
    } catch (error) {
      console.error("Failed to update profile photo", error);
      addToast(getFriendlyErrorMessage(error), "error");
    } finally {
      setUploading(false);
    }
  };

  const motionOptions = [
    { value: "full" as const, icon: Sparkles, label: "Full" },
    { value: "reduced" as const, icon: Waves, label: "Reduced" },
    { value: "system" as const, icon: Monitor, label: "System" },
  ];

  const year = formatMemberSince(user.createdAt)?.split(" ").pop();

  const stats = [
    { label: "Friends", value: String(friendsCount) },
    { label: "Chats", value: String(chatsCount) },
    { label: "Since", value: year ?? "—" },
  ];

  const pillClass = (active: boolean) =>
    cn(
      "flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-all duration-200",
      active
        ? "bg-accent-soft text-accent-text ring-1 ring-accentline"
        : "text-ink-muted hover:bg-glass-subtle hover:text-ink"
    );

  const inputClass =
    "w-full rounded-2xl border border-hairline bg-glass-subtle px-3.5 py-2.5 text-sm text-ink outline-none transition-all focus:border-accentline focus:bg-glass focus:ring-4 focus:ring-accent-soft";

  return (
    <div className="glass-fill h-full overflow-y-auto">
      <div className="animate-fade-in mx-auto w-full max-w-2xl space-y-4 px-4 py-6 lg:px-8">
        {/* Profile hero */}
        <section className="glass-tint rounded-3xl px-6 py-8">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className="rounded-full bg-accent p-[3px] shadow-[0_8px_20px_rgba(51,39,42,0.1)]">
                <div className="flex rounded-full bg-white p-[2px]">
                  <Avatar src={user.photoURL} name={user.displayName} size="xl" />
                </div>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                aria-label="Change profile photo"
                className="bg-accent-gradient glow-accent absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-105 disabled:opacity-60"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>

            {editing ? (
              <div className="w-full max-w-sm space-y-3">
                <div>
                  <label
                    htmlFor="profile-display-name"
                    className="mb-1 block text-xs font-semibold text-ink-muted"
                  >
                    Display name
                  </label>
                  <input
                    id="profile-display-name"
                    type="text"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    maxLength={50}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label
                    htmlFor="profile-username"
                    className="mb-1 block text-xs font-semibold text-ink-muted"
                  >
                    Username
                  </label>
                  <input
                    id="profile-username"
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    maxLength={20}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label
                    htmlFor="profile-bio"
                    className="mb-1 block text-xs font-semibold text-ink-muted"
                  >
                    Bio
                  </label>
                  <textarea
                    id="profile-bio"
                    value={bio}
                    onChange={(event) => setBio(event.target.value)}
                    rows={3}
                    maxLength={160}
                    className={cn(inputClass, "resize-none")}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={handleSave}
                    loading={saving}
                    className="flex-1"
                  >
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setDisplayName(user.displayName);
                      setUsername(user.username);
                      setBio(user.bio);
                      setEditing(false);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold tracking-tight text-ink">
                  {user.displayName}
                </h2>
                <p className="text-sm text-ink-muted">@{user.username}</p>
                <span
                  className={cn(
                    "mt-2 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                    isUserOnline(user)
                      ? "border-success-line bg-success-soft text-success-strong"
                      : "border-hairline bg-glass-subtle text-ink-muted"
                  )}
                >
                  {isUserOnline(user) ? "Online" : "Offline"}
                </span>
                {user.bio && (
                  <p className="font-dm mt-3 max-w-xs text-center text-sm leading-relaxed text-ink-muted">
                    <EmojiText text={user.bio} />
                  </p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(true)}
                  className="mt-4"
                >
                  Edit Profile
                </Button>
              </>
            )}
          </div>
        </section>

        {/* Stats */}
        <section
          aria-label="Your activity"
          className="glass-tint grid grid-cols-3 divide-x divide-hairline overflow-hidden rounded-3xl"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="px-4 py-4 text-center">
              <p className="text-lg font-bold text-ink">{stat.value}</p>
              <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                {stat.label}
              </p>
            </div>
          ))}
        </section>

        {/* Preferences */}
        <section className="glass-tint rounded-3xl px-5 py-5">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-muted">
            Motion
          </h3>
          <div className="flex gap-1.5">
            {motionOptions.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setMotion(value)}
                aria-pressed={motion === value}
                className={pillClass(motion === value)}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
          <p className="font-dm mt-3 text-xs text-ink-muted">
            Choose <span className="font-semibold">Full</span> if your system
            disables animations and you want them anyway.
          </p>
        </section>

        <NotificationSettings uid={user.uid} />

        <InstallAppSection />

        {/* Log out */}
        <div className="glass-tint overflow-hidden rounded-3xl">
          <button
            type="button"
            onClick={onSignOut}
            className="flex w-full items-center gap-3 px-5 py-4 text-sm font-semibold text-danger-strong transition-colors hover:bg-danger-soft"
          >
            <LogOut className="h-4.5 w-4.5" />
            Log out
          </button>
        </div>

        <p className="text-center text-xs text-ink-muted">{user.email}</p>
        <p className="pb-2 text-center text-[10px] text-ink-muted/80">
          Emoji art by{" "}
          <a
            href="https://github.com/jdecked/twemoji"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Twemoji
          </a>{" "}
          (CC-BY 4.0)
        </p>
      </div>
    </div>
  );
}
