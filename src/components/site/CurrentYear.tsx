"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// Read the year only in the browser: with Cache Components, reading the clock
// during a prerender (server or client component) is an error. The server
// snapshot is null, so nothing time-based is rendered on the server.
export function CurrentYear() {
  const year = useSyncExternalStore(
    subscribe,
    () => new Date().getFullYear(),
    () => null,
  );
  return <>{year}</>;
}
