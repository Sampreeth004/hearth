"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  and,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { mapFriendRequest } from "@/services/mappers";
import type { FriendRequest } from "@/types";

export interface FriendsState {
  friends: string[];
  requests: FriendRequest[];
  incomingRequests: FriendRequest[];
  outgoingRequests: FriendRequest[];
  loading: boolean;
  requestsLoaded: boolean;
}

export function useFriends(userId: string | undefined): FriendsState {
  const [friends, setFriends] = useState<string[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestsLoaded, setRequestsLoaded] = useState(false);

  useEffect(() => {
    if (!userId || !db) return;

    const friendshipsQuery = query(
      collection(db, "friendships"),
      where("users", "array-contains", userId)
    );

    const unsubFriends = onSnapshot(
      friendshipsQuery,
      (snap) => {
        const friendIds = snap.docs
          .map((d) => {
            const users = d.data().users as string[];
            return users.find((u) => u !== userId);
          })
          .filter((id): id is string => Boolean(id));
        setFriends(friendIds);
        setLoading(false);
      },
      (error) => {
        console.error("Failed to subscribe to friendships", error);
        setLoading(false);
      }
    );

    const sentQuery = query(
      collection(db, "friendRequests"),
      and(where("senderId", "==", userId), where("status", "==", "pending"))
    );
    const receivedQuery = query(
      collection(db, "friendRequests"),
      and(where("receiverId", "==", userId), where("status", "==", "pending"))
    );

    const unsubSent = onSnapshot(
      sentQuery,
      (snap) => {
        setSentRequests(
          snap.docs.map((d) => mapFriendRequest(d.id, d.data()))
        );
        setRequestsLoaded(true);
      },
      (error) => {
        console.error("Failed to subscribe to sent requests", error);
        setRequestsLoaded(true);
      }
    );

    const unsubReceived = onSnapshot(
      receivedQuery,
      (snap) => {
        setReceivedRequests(
          snap.docs.map((d) => mapFriendRequest(d.id, d.data()))
        );
        setRequestsLoaded(true);
      },
      (error) => {
        console.error("Failed to subscribe to received requests", error);
        setRequestsLoaded(true);
      }
    );

    return () => {
      unsubFriends();
      unsubSent();
      unsubReceived();
    };
  }, [userId]);

  const requests = useMemo(
    () => [...receivedRequests, ...sentRequests],
    [receivedRequests, sentRequests]
  );

  return {
    friends,
    requests,
    incomingRequests: receivedRequests,
    outgoingRequests: sentRequests,
    loading,
    requestsLoaded,
  };
}
