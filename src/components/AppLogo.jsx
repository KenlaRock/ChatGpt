import React from "react";

/**
 * Shared logo renderer so sizing/tone/opacity are consistent across app surfaces.
 */
export function AppLogo({
  alt = "",
  width = 36,
  height = 20,
  opacity = 1,
  decorative = false,
  invertForDarkBg = false,
  style = {},
}) {
  return (
    <img
      src="/logo.svg"
      alt={decorative ? "" : alt}
      aria-hidden={decorative ? "true" : undefined}
      style={{
        width,
        height,
        display: "block",
        opacity,
        filter: invertForDarkBg ? "invert(1)" : undefined,
        ...style,
      }}
    />
  );
}
