"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

function getRedirectUri(): string {
  if (window.location.hostname === "localhost") {
    return `http://127.0.0.1:${window.location.port}/callback`;
  }
  const { origin, pathname } = window.location;
  const base = pathname.replace(/\/+$/, "");
  return origin + base + "/callback";
}

export function SetupInstructions() {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  return (
    <div className="cb__setup-steps">
      <h2>Setup Instructions</h2>
      <ol>
        <li>
          Go to the{" "}
          <a
            href="https://developer.spotify.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
          >
            Spotify Developer Dashboard
          </a>
        </li>
        <li>
          Click <strong>Create App</strong>
        </li>
        <li>Fill in an app name (e.g. &quot;Control Board&quot;) and description</li>
        <li>
          Set the <strong>Redirect URI</strong> to:{" "}
          <code className="cb__setup-code">{mounted ? getRedirectUri() : ""}</code>
        </li>
        <li>
          Under <strong>Which API/SDKs are you planning to use?</strong>, select{" "}
          <strong>Web API</strong>
        </li>
        <li>Save the app</li>
        <li>
          Go to <strong>User Management</strong> and add the Spotify email of each person who will
          use the app
        </li>
        <li>
          Go to <strong>Settings</strong> and copy the <strong>Client ID</strong>, then paste it
          below
        </li>
      </ol>
      <p className="cb__setup-note">
        All data (cues, playlist configuration, and Spotify credentials) is stored in your
        browser&apos;s local storage. Nothing is sent to any server. Clearing your browser data will
        erase everything.
      </p>
    </div>
  );
}
