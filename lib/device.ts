/**
 * lib/device.ts — device capability detection for 3D orb guard-railing
 *
 * These checks determine whether to mount the Three.js Streak Orb or show
 * the static fallback. All detections are conservative (prefer fallback on doubt).
 */

/** Returns true if the user has requested reduced motion */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Returns true if WebGL is supported in the current browser */
export function isWebGLSupported(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

/**
 * Returns true if the device is considered low-end.
 * Criteria (plan §6.6):
 *   - navigator.hardwareConcurrency <= 2 (if available)
 *   - navigator.deviceMemory <= 2 GB (if available — Chrome only)
 */
export function isLowEndDevice(): boolean {
  if (typeof navigator === "undefined") return false;

  const cores = navigator.hardwareConcurrency;
  if (cores !== undefined && cores <= 2) return true;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const memory = (navigator as any).deviceMemory as number | undefined;
  if (memory !== undefined && memory <= 2) return true;

  return false;
}

/**
 * Master guard: should we render the 3D Streak Orb?
 * Returns true when all of: WebGL supported, not reduced-motion, not low-end.
 * Also respects the user's manual toggle stored in profiles.visuals_3d_enabled.
 */
export function should3DRender(visuals3dEnabled: boolean = true): boolean {
  if (!visuals3dEnabled) return false;
  if (prefersReducedMotion()) return false;
  if (!isWebGLSupported()) return false;
  if (isLowEndDevice()) return false;
  return true;
}

/** Capped device pixel ratio for the Three.js canvas — plan §6.3 */
export function getCappedDPR(): number {
  if (typeof window === "undefined") return 1;
  return Math.min(window.devicePixelRatio, 2);
}
