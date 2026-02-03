import * as THREE from "three";

export type AnimationMode = "spring" | "smooth" | "arc" | "momentum";

// ============================================
// EASING FUNCTIONS
// ============================================

// Spring physics simulation
export function springEase(t: number, damping = 0.7, stiffness = 0.5): number {
  // Attempt analytical spring approximation
  const omega = Math.sqrt(stiffness);
  const zeta = damping;

  if (zeta < 1) {
    // Underdamped - will overshoot
    const omegaD = omega * Math.sqrt(1 - zeta * zeta);
    const decay = Math.exp(-zeta * omega * t * 5);
    return 1 - decay * Math.cos(omegaD * t * 5);
  } else {
    // Critically damped or overdamped
    const decay = Math.exp(-omega * t * 3);
    return 1 - decay * (1 + omega * t * 3);
  }
}

// Quintic ease-in-out (very smooth S-curve)
export function easeInOutQuint(t: number): number {
  return t < 0.5
    ? 16 * t * t * t * t * t
    : 1 - Math.pow(-2 * t + 2, 5) / 2;
}

// Sine-based smooth easing (even gentler)
export function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

// Custom blended ease for organic feel
export function organicEase(t: number): number {
  // Blend of sine and cubic for very smooth transitions
  const sine = easeInOutSine(t);
  const cubic = t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
  return sine * 0.6 + cubic * 0.4;
}

// ============================================
// OPTION A: BLENDED PHASES WITH SPRING
// ============================================

export interface BlendedSpringState {
  rotationProgress: number;
  zoomProgress: number;
  springVelocity: number;
}

export function updateBlendedSpring(
  elapsed: number,
  totalDuration: number,
  state: BlendedSpringState
): BlendedSpringState {
  const rawProgress = Math.min(elapsed / totalDuration, 1);

  // Rotation leads by starting earlier and using spring
  const rotationT = Math.min(rawProgress * 1.3, 1); // Rotation completes at 77% of total time
  const rotationProgress = springEase(rotationT, 0.65, 0.6);

  // Zoom follows with slight delay, also spring-based
  const zoomT = Math.max(0, (rawProgress - 0.15) / 0.85); // Starts at 15%, ends at 100%
  const zoomProgress = springEase(Math.min(zoomT, 1), 0.7, 0.5);

  return {
    rotationProgress,
    zoomProgress,
    springVelocity: 0,
  };
}

// ============================================
// OPTION B: SMOOTH ACCELERATION (QUINT)
// ============================================

export interface SmoothState {
  progress: number;
}

export function updateSmooth(
  elapsed: number,
  totalDuration: number
): SmoothState {
  const rawProgress = Math.min(elapsed / totalDuration, 1);

  // Use quintic easing for extremely smooth acceleration/deceleration
  const progress = easeInOutQuint(rawProgress);

  return { progress };
}

// Both rotation and zoom use the same progress, creating unified motion
export function getSmoothRotationProgress(state: SmoothState): number {
  // Rotation is slightly ahead
  return Math.min(state.progress * 1.15, 1);
}

export function getSmoothZoomProgress(state: SmoothState): number {
  // Zoom follows the same curve but weighted
  return state.progress;
}

// ============================================
// OPTION C: ARC PATH
// ============================================

export interface ArcState {
  progress: number;
  arcPosition: THREE.Vector3;
}

// Attempt quadratic Bezier for camera path
export function calculateArcPosition(
  start: THREE.Vector3,
  end: THREE.Vector3,
  progress: number,
  arcHeight: number = 1.5
): THREE.Vector3 {
  // Control point is above and to the side of the midpoint
  const mid = start.clone().lerp(end, 0.5);
  const direction = end.clone().sub(start).normalize();
  const up = new THREE.Vector3(0, 1, 0);
  const side = direction.clone().cross(up).normalize();

  // Control point curves outward and upward
  const control = mid.clone()
    .add(up.clone().multiplyScalar(arcHeight))
    .add(side.clone().multiplyScalar(arcHeight * 0.5));

  // Quadratic Bezier: B(t) = (1-t)²P0 + 2(1-t)tP1 + t²P2
  const t = organicEase(progress);
  const oneMinusT = 1 - t;

  return new THREE.Vector3()
    .addScaledVector(start, oneMinusT * oneMinusT)
    .addScaledVector(control, 2 * oneMinusT * t)
    .addScaledVector(end, t * t);
}

export function updateArc(
  elapsed: number,
  totalDuration: number
): ArcState {
  const rawProgress = Math.min(elapsed / totalDuration, 1);
  const progress = organicEase(rawProgress);

  return {
    progress,
    arcPosition: new THREE.Vector3(), // Calculated per-frame with actual positions
  };
}

// ============================================
// OPTION D: MOMENTUM-BASED
// ============================================

export interface MomentumState {
  position: number;
  velocity: number;
  targetReached: boolean;
}

export function initMomentumState(): MomentumState {
  return {
    position: 0,
    velocity: 0,
    targetReached: false,
  };
}

export function updateMomentum(
  state: MomentumState,
  deltaTime: number,
  target: number = 1,
  acceleration: number = 2.5,
  friction: number = 0.92,
  arrivalThreshold: number = 0.001
): MomentumState {
  if (state.targetReached) {
    return state;
  }

  const dt = Math.min(deltaTime / 1000, 0.05); // Cap delta to avoid instability

  // Calculate force toward target (spring-like attraction)
  const distance = target - state.position;
  const force = distance * acceleration;

  // Update velocity with force and friction
  let velocity = state.velocity + force * dt;
  velocity *= Math.pow(friction, dt * 60); // Normalize friction to 60fps

  // Update position
  let position = state.position + velocity * dt;

  // Check if we've arrived
  const targetReached = Math.abs(distance) < arrivalThreshold && Math.abs(velocity) < arrivalThreshold;

  if (targetReached) {
    position = target;
    velocity = 0;
  }

  return {
    position: Math.min(Math.max(position, 0), 1), // Clamp 0-1
    velocity,
    targetReached,
  };
}

// ============================================
// UNIFIED ANIMATION CONTROLLER
// ============================================

export interface AnimationState {
  mode: AnimationMode;
  startTime: number;
  lastFrameTime: number;
  rotationProgress: number;
  zoomProgress: number;
  completed: boolean;

  // Mode-specific state
  momentum?: MomentumState;
  arcStartPos?: THREE.Vector3;
  arcEndPos?: THREE.Vector3;
}

export function createAnimationState(mode: AnimationMode): AnimationState {
  const now = performance.now();
  return {
    mode,
    startTime: now,
    lastFrameTime: now,
    rotationProgress: 0,
    zoomProgress: 0,
    completed: false,
    momentum: mode === "momentum" ? initMomentumState() : undefined,
  };
}

export function updateAnimationState(
  state: AnimationState,
  totalDuration: number
): AnimationState {
  const now = performance.now();
  const elapsed = now - state.startTime;
  const deltaTime = now - state.lastFrameTime;

  let rotationProgress = state.rotationProgress;
  let zoomProgress = state.zoomProgress;
  let completed = state.completed;
  let momentum = state.momentum;

  switch (state.mode) {
    case "spring": {
      const springState = updateBlendedSpring(elapsed, totalDuration, {
        rotationProgress: state.rotationProgress,
        zoomProgress: state.zoomProgress,
        springVelocity: 0,
      });
      rotationProgress = springState.rotationProgress;
      zoomProgress = springState.zoomProgress;
      completed = elapsed >= totalDuration && rotationProgress > 0.99 && zoomProgress > 0.99;
      break;
    }

    case "smooth": {
      const smoothState = updateSmooth(elapsed, totalDuration);
      rotationProgress = getSmoothRotationProgress(smoothState);
      zoomProgress = getSmoothZoomProgress(smoothState);
      completed = smoothState.progress >= 1;
      break;
    }

    case "arc": {
      const arcState = updateArc(elapsed, totalDuration);
      // For arc, rotation and zoom progress are coupled
      rotationProgress = Math.min(arcState.progress * 1.2, 1);
      zoomProgress = arcState.progress;
      completed = arcState.progress >= 1;
      break;
    }

    case "momentum": {
      if (momentum) {
        momentum = updateMomentum(momentum, deltaTime);
        rotationProgress = Math.min(momentum.position * 1.15, 1);
        zoomProgress = momentum.position;
        completed = momentum.targetReached;
      }
      break;
    }
  }

  return {
    ...state,
    lastFrameTime: now,
    rotationProgress,
    zoomProgress,
    completed,
    momentum,
  };
}

// Get arc camera position for Option C
export function getArcCameraPosition(
  state: AnimationState,
  startPos: THREE.Vector3,
  endPos: THREE.Vector3
): THREE.Vector3 {
  if (state.mode === "arc") {
    return calculateArcPosition(startPos, endPos, state.zoomProgress, 1.2);
  }
  // For other modes, use linear interpolation
  return startPos.clone().lerp(endPos, state.zoomProgress);
}
