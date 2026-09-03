import { useEffect, useId, useRef } from "react";
import type { ReactElement, RefObject } from "react";
import { gsap } from "gsap";
import { buildFourSegmentEllipsePath, interpolateNumericValuesBetweenPathStrings } from "./avatarMath";
import { BOT_AVATAR_STATES, BotAvatarState, computeAllFacialPathsForState } from "./avatarStates";
import { LottieBotAvatar } from "./LottieBotAvatar";
import { VULTUS_CLASSIC_MODEL } from "./avatarModels";
import type { BotAvatarModel, FillRole, ProceduralAvatarModel, ProceduralShape } from "./avatarModels";
import { useGazeBehavior } from "./useGazeBehavior";
import type { GazeConfig, GazeSource } from "./gaze";

const DEFAULT_BOT_AVATAR_SHADOW_COLOR_NAME = "dimgray";
const DEFAULT_BOT_AVATAR_LIGHT_COLOR_NAME = "white";
const DEFAULT_NEUTRAL_BORED_INTERVAL_MIN_MS = 10_000;
const DEFAULT_NEUTRAL_BORED_INTERVAL_MAX_MS = 20_000;
const DEFAULT_NEUTRAL_BORED_VARIANT_DURATION_MIN_MS = 1_000;
const DEFAULT_NEUTRAL_BORED_VARIANT_DURATION_MAX_MS = 2_000;

export type BotAvatarProps = {
  model?: BotAvatarModel;
  state?: BotAvatarState;
  neutralIdleMode?: "bored-random" | "static";
  size?: number;
  transitionDurationSeconds?: number;
  shadowColor?: string;
  lightColor?: string;
  /** Third color for models with "accent"-role shapes/features. Defaults to lightColor. */
  accentColor?: string;
  ariaLabel?: string;
  paused?: boolean;
  /**
   * Continuous gaze/pointer-following, independent of `state`. Defaults to
   * "none" (no change from prior behavior). Only has an effect on models
   * that declare `gaze` geometry; ignored otherwise.
   */
  gaze?: GazeSource;
  gazeConfig?: Partial<GazeConfig>;
  /**
   * When set (and `gaze` isn't "none"), the avatar looks at this DOM
   * element's center instead of the pointer/wander -- e.g. a caller's own
   * "typing…" indicator, so the character visibly notices it. Overrides
   * pointer tracking and autonomous wander for as long as it's set;
   * reverts the moment it's cleared. Independent of `gaze`'s own mode,
   * same as a fixed-vector `gaze` is -- but sourced from a live element's
   * position rather than a static direction.
   */
  focusElement?: Element | null;
};

type AnimationContext = {
  model: ProceduralAvatarModel;
  leftEyePathElementRef: RefObject<SVGPathElement>;
  rightEyePathElementRef: RefObject<SVGPathElement>;
  mouthPathElementRef: RefObject<SVGPathElement>;
  antennaCircleElementRef: RefObject<SVGCircleElement>;
  innerHeadGroupElementRef: RefObject<SVGGElement>;
};

type Killable = {
  kill: () => void;
};

type NonNeutralBotAvatarState = Exclude<BotAvatarState, "neutral">;

const ellipsePathAtPosition = (
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number
): string => buildFourSegmentEllipsePath(centerX, centerY, radiusX, radiusY);

const appendBlinkToTimeline = (
  timeline: gsap.core.Timeline,
  animationContext: AnimationContext,
  options?: {
    closeDuration?: number;
    closedHoldDuration?: number;
    openDuration?: number;
  }
) => {
  const { leftEye, rightEye } = animationContext.model.features;
  const { closedRx, closedRy } = animationContext.model.blink;
  const basePaths = computeAllFacialPathsForState(animationContext.model, "neutral");
  const closedLeftEyePath = ellipsePathAtPosition(leftEye.cx, leftEye.cy, closedRx, closedRy);
  const closedRightEyePath = ellipsePathAtPosition(rightEye.cx, rightEye.cy, closedRx, closedRy);
  const blinkProgress = { value: 0 };
  const closeDuration = options?.closeDuration ?? 0.09;
  const closedHoldDuration = options?.closedHoldDuration ?? 0.03;
  const openDuration = options?.openDuration ?? 0.13;

  const renderBlinkAtCurrentProgress = () => {
    const p = blinkProgress.value;
    animationContext.leftEyePathElementRef.current?.setAttribute(
      "d",
      interpolateNumericValuesBetweenPathStrings(basePaths.leftEyePathString, closedLeftEyePath, p)
    );
    animationContext.rightEyePathElementRef.current?.setAttribute(
      "d",
      interpolateNumericValuesBetweenPathStrings(basePaths.rightEyePathString, closedRightEyePath, p)
    );
  };

  timeline.to(blinkProgress, {
    value: 1,
    duration: closeDuration,
    ease: "power2.in",
    onUpdate: renderBlinkAtCurrentProgress
  });
  if (closedHoldDuration > 0) {
    timeline.to({}, { duration: closedHoldDuration });
  }
  timeline.to(blinkProgress, {
    value: 0,
    duration: openDuration,
    ease: "power2.out",
    onUpdate: renderBlinkAtCurrentProgress
  });
};

const buildNeutralBlinkBoredAnimation = (
  animationContext: AnimationContext,
  totalDurationMilliseconds: number
): gsap.core.Timeline => {
  const totalDurationSeconds = Math.max(totalDurationMilliseconds / 1000, 1);
  const holdDuration = Math.max(0.24, totalDurationSeconds - 0.58);
  const blinkTimeline = gsap.timeline();
  appendBlinkToTimeline(blinkTimeline, animationContext, {
    closeDuration: 0.1,
    closedHoldDuration: 0.03,
    openDuration: 0.16
  });
  blinkTimeline.to({}, { duration: holdDuration * 0.45 });
  appendBlinkToTimeline(blinkTimeline, animationContext, {
    closeDuration: 0.08,
    closedHoldDuration: 0.02,
    openDuration: 0.12
  });
  blinkTimeline.to({}, { duration: holdDuration * 0.55 });
  return blinkTimeline;
};

const buildNeutralEyeGlanceBoredAnimation = (
  animationContext: AnimationContext,
  totalDurationMilliseconds: number
): gsap.core.Timeline => {
  const totalDurationSeconds = Math.max(totalDurationMilliseconds / 1000, 1);
  const stepDuration = totalDurationSeconds * 0.24;
  const holdDuration = totalDurationSeconds * 0.14;
  const { leftEye, rightEye } = animationContext.model.features;
  const neutralEyeShape = animationContext.model.eyeShapesByState.neutral;
  const eyeRadius = neutralEyeShape.rx;
  /** Sideways glance distance, proportional to eye size -- tuned against the classic model's 14-unit eye radius, where a 5-unit glance read as natural. */
  const glanceOffset = eyeRadius * (5 / 14);
  const centerLeftEyePath = ellipsePathAtPosition(leftEye.cx, leftEye.cy, eyeRadius, eyeRadius);
  const centerRightEyePath = ellipsePathAtPosition(rightEye.cx, rightEye.cy, eyeRadius, eyeRadius);
  const glanceLeftEyePath = ellipsePathAtPosition(leftEye.cx + glanceOffset, leftEye.cy, eyeRadius, eyeRadius);
  const glanceRightEyePath = ellipsePathAtPosition(rightEye.cx + glanceOffset, rightEye.cy, eyeRadius, eyeRadius);
  const glanceBackLeftEyePath = ellipsePathAtPosition(leftEye.cx - glanceOffset, leftEye.cy, eyeRadius, eyeRadius);
  const glanceBackRightEyePath = ellipsePathAtPosition(rightEye.cx - glanceOffset, rightEye.cy, eyeRadius, eyeRadius);
  const glanceTimeline = gsap.timeline();

  const animateEyePathMorph = (
    fromLeftEyePath: string,
    toLeftEyePath: string,
    fromRightEyePath: string,
    toRightEyePath: string,
    duration: number
  ) => {
    const stepProgress = { value: 0 };
    glanceTimeline.to(stepProgress, {
      value: 1,
      duration,
      ease: "sine.inOut",
      onUpdate: () => {
        const p = stepProgress.value;
        animationContext.leftEyePathElementRef.current?.setAttribute(
          "d",
          interpolateNumericValuesBetweenPathStrings(fromLeftEyePath, toLeftEyePath, p)
        );
        animationContext.rightEyePathElementRef.current?.setAttribute(
          "d",
          interpolateNumericValuesBetweenPathStrings(fromRightEyePath, toRightEyePath, p)
        );
      }
    });
  };

  animateEyePathMorph(centerLeftEyePath, glanceLeftEyePath, centerRightEyePath, glanceRightEyePath, stepDuration);
  glanceTimeline.to({}, { duration: holdDuration * 0.6 });
  appendBlinkToTimeline(glanceTimeline, animationContext, {
    closeDuration: 0.08,
    closedHoldDuration: 0.02,
    openDuration: 0.1
  });
  glanceTimeline.to({}, { duration: holdDuration * 0.4 });
  animateEyePathMorph(glanceLeftEyePath, glanceBackLeftEyePath, glanceRightEyePath, glanceBackRightEyePath, stepDuration);
  glanceTimeline.to({}, { duration: holdDuration * 0.6 });
  appendBlinkToTimeline(glanceTimeline, animationContext, {
    closeDuration: 0.07,
    closedHoldDuration: 0.01,
    openDuration: 0.09
  });
  glanceTimeline.to({}, { duration: holdDuration * 0.4 });
  animateEyePathMorph(glanceBackLeftEyePath, centerLeftEyePath, glanceBackRightEyePath, centerRightEyePath, stepDuration);
  glanceTimeline.to({}, { duration: Math.max(0.08, totalDurationSeconds - (stepDuration * 3 + holdDuration * 2 + 0.37)) });
  return glanceTimeline;
};

const buildNeutralAntennaFidgetBoredAnimation = (
  animationContext: AnimationContext,
  totalDurationMilliseconds: number
): gsap.core.Timeline => {
  const totalDurationSeconds = Math.max(totalDurationMilliseconds / 1000, 1);
  const fidgetTimeline = gsap.timeline();

  if (animationContext.antennaCircleElementRef.current) {
    fidgetTimeline.to(animationContext.antennaCircleElementRef.current, {
      scale: 1.36,
      transformOrigin: "100px 20px",
      duration: totalDurationSeconds * 0.18,
      yoyo: true,
      repeat: 3,
      ease: "sine.inOut"
    }, 0);
  }

  if (animationContext.innerHeadGroupElementRef.current) {
    fidgetTimeline.to(animationContext.innerHeadGroupElementRef.current, {
      y: -1.5,
      duration: totalDurationSeconds * 0.22,
      yoyo: true,
      repeat: 3,
      ease: "sine.inOut"
    }, 0);
  }

  appendBlinkToTimeline(fidgetTimeline, animationContext, {
    closeDuration: 0.08,
    closedHoldDuration: 0.02,
    openDuration: 0.1
  });

  fidgetTimeline.to({}, { duration: Math.max(0.08, totalDurationSeconds * 0.12) });
  return fidgetTimeline;
};

const buildEyeWanderIdleAnimation = (
  animationContext: AnimationContext,
  wanderRadius: number,
  /** Offsets from each eye's own anchor, in classic-model units (tuned against its 14-unit eye radius) -- scaled to this model's actual eye size below. */
  wanderOffsets: ReadonlyArray<{ dx: number; dy: number }>,
  transitionDuration: number,
  restDurationFunction: (index: number) => number
): gsap.core.Timeline => {
  const { leftEye, rightEye } = animationContext.model.features;
  const offsetScale = wanderRadius / 14;
  const positionPathSets = wanderOffsets.map(({ dx, dy }) => ({
    leftEyePath: ellipsePathAtPosition(
      leftEye.cx + dx * offsetScale,
      leftEye.cy + dy * offsetScale,
      wanderRadius,
      wanderRadius
    ),
    rightEyePath: ellipsePathAtPosition(
      rightEye.cx + dx * offsetScale,
      rightEye.cy + dy * offsetScale,
      wanderRadius,
      wanderRadius
    )
  }));
  const wanderTimeline = gsap.timeline({ repeat: -1 });

  for (let positionIndex = 0; positionIndex < positionPathSets.length; positionIndex += 1) {
    const fromPathSet = positionPathSets[positionIndex];
    const toPathSet = positionPathSets[(positionIndex + 1) % positionPathSets.length];
    const stepProgress = { value: 0 };
    wanderTimeline.to(stepProgress, {
      value: 1,
      duration: transitionDuration,
      ease: "power2.inOut",
      onUpdate: () => {
        const p = stepProgress.value;
        animationContext.leftEyePathElementRef.current?.setAttribute(
          "d",
          interpolateNumericValuesBetweenPathStrings(fromPathSet.leftEyePath, toPathSet.leftEyePath, p)
        );
        animationContext.rightEyePathElementRef.current?.setAttribute(
          "d",
          interpolateNumericValuesBetweenPathStrings(fromPathSet.rightEyePath, toPathSet.rightEyePath, p)
        );
      }
    });
    wanderTimeline.to({}, { duration: restDurationFunction(positionIndex) });
  }

  return wanderTimeline;
};

const buildThinkingWanderIdleAnimation = (animationContext: AnimationContext): gsap.core.Timeline =>
  buildEyeWanderIdleAnimation(
    animationContext,
    animationContext.model.eyeShapesByState.thinking.rx,
    [
      { dx: 0, dy: -4 },
      { dx: -4, dy: -6 },
      { dx: 0, dy: -8 },
      { dx: 4, dy: -6 }
    ],
    0.5,
    () => 1.1 + Math.random() * 0.6
  );

const buildToolResponseReadingIdleAnimation = (animationContext: AnimationContext): gsap.core.Timeline =>
  buildEyeWanderIdleAnimation(
    animationContext,
    animationContext.model.eyeShapesByState.toolResponse.rx,
    [
      { dx: -4, dy: 0 },
      { dx: 0, dy: 0 },
      { dx: 4, dy: 0 },
      { dx: 0, dy: 0 }
    ],
    0.16,
    () => 0.35
  );

const buildSimpleTransformIdleAnimation = (
  targetElement: SVGElement | null,
  tweenProperties: gsap.TweenVars
): Killable => {
  if (!targetElement) {
    return { kill: () => undefined };
  }
  const animationTween = gsap.to(targetElement, tweenProperties);
  return {
    kill: () => {
      animationTween.kill();
      gsap.set(targetElement, { clearProps: "transform" });
    }
  };
};

const buildDeepThinkingBreathingIdleAnimation = (animationContext: AnimationContext): Killable =>
  buildSimpleTransformIdleAnimation(animationContext.innerHeadGroupElementRef.current, {
    scale: 1.025,
    transformOrigin: "100px 100px",
    duration: 2.6,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut"
  });

const buildToolCallingAntennaPulseIdleAnimation = (animationContext: AnimationContext): Killable =>
  buildSimpleTransformIdleAnimation(animationContext.antennaCircleElementRef.current, {
    scale: 1.45,
    transformOrigin: "100px 20px",
    duration: 0.42,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut"
  });

const buildSpeakingCompleteHappyBounceIdleAnimation = (animationContext: AnimationContext): Killable =>
  buildSimpleTransformIdleAnimation(animationContext.innerHeadGroupElementRef.current, {
    y: -2,
    duration: 0.7,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut"
  });

const buildSpeakingVariantPulseIdleAnimation = (
  animationContext: AnimationContext,
  primaryStateKey: BotAvatarState,
  secondaryStateKey: BotAvatarState
): gsap.core.Tween => {
  const primaryMouthPathString = computeAllFacialPathsForState(animationContext.model, primaryStateKey).mouthPathString;
  const secondaryMouthPathString = computeAllFacialPathsForState(
    animationContext.model,
    secondaryStateKey
  ).mouthPathString;
  const pulseProgress = { value: 0 };
  return gsap.to(pulseProgress, {
    value: 1,
    duration: 0.18,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut",
    onUpdate: () => {
      animationContext.mouthPathElementRef.current?.setAttribute(
        "d",
        interpolateNumericValuesBetweenPathStrings(primaryMouthPathString, secondaryMouthPathString, pulseProgress.value)
      );
    }
  });
};

const neutralBoredAnimationBuilders = [
  buildNeutralBlinkBoredAnimation,
  buildNeutralEyeGlanceBoredAnimation,
  buildNeutralAntennaFidgetBoredAnimation
] as const;

const idleAnimationBuildersByStateKey: Record<NonNeutralBotAvatarState, (ctx: AnimationContext) => Killable> = {
  thinking: (ctx) => buildThinkingWanderIdleAnimation(ctx),
  deepThinking: (ctx) => buildDeepThinkingBreathingIdleAnimation(ctx),
  toolCalling: (ctx) => buildToolCallingAntennaPulseIdleAnimation(ctx),
  toolResponse: (ctx) => buildToolResponseReadingIdleAnimation(ctx),
  speakingOpen: (ctx) => buildSpeakingVariantPulseIdleAnimation(ctx, "speakingOpen", "speakingRound"),
  speakingWide: (ctx) => buildSpeakingVariantPulseIdleAnimation(ctx, "speakingWide", "speakingOpen"),
  speakingRound: (ctx) => buildSpeakingVariantPulseIdleAnimation(ctx, "speakingRound", "speakingWide"),
  speakingComplete: (ctx) => buildSpeakingCompleteHappyBounceIdleAnimation(ctx)
};

const isBotAvatarState = (value: string): value is BotAvatarState =>
  BOT_AVATAR_STATES.includes(value as BotAvatarState);

const pickRandomDurationMilliseconds = (minMilliseconds: number, maxMilliseconds: number): number =>
  minMilliseconds + Math.floor(Math.random() * (maxMilliseconds - minMilliseconds + 1));

const pickRandomNeutralBoredAnimationBuilder = () =>
  neutralBoredAnimationBuilders[Math.floor(Math.random() * neutralBoredAnimationBuilders.length)];

const browserPrefersReducedMotion = (): boolean => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

const resolveFillColor = (
  role: FillRole,
  colors: { shadowColor: string; lightColor: string; accentColor: string }
): string => {
  if (role === "shadow") {
    return colors.shadowColor;
  }
  if (role === "accent") {
    return colors.accentColor;
  }
  return colors.lightColor;
};

const renderProceduralShape = (
  shape: ProceduralShape,
  key: number,
  colors: { shadowColor: string; lightColor: string; accentColor: string },
  antennaCircleElementRef: RefObject<SVGCircleElement>
): ReactElement => {
  const fill = resolveFillColor(shape.fillRole, colors);
  if (shape.kind === "circle") {
    const ref = shape.slot === "accent" ? antennaCircleElementRef : undefined;
    return <circle key={key} ref={ref} cx={shape.cx} cy={shape.cy} r={shape.r} fill={fill} />;
  }
  if (shape.kind === "rect") {
    return (
      <rect
        key={key}
        x={shape.x}
        y={shape.y}
        width={shape.width}
        height={shape.height}
        {...(shape.rx !== undefined ? { rx: shape.rx } : {})}
        {...(shape.ry !== undefined ? { ry: shape.ry } : {})}
        fill={fill}
      />
    );
  }
  return <path key={key} d={shape.d} fill={fill} />;
};

type ProceduralBotAvatarProps = Omit<BotAvatarProps, "model"> & { model: ProceduralAvatarModel };

const ProceduralBotAvatar = ({
  model,
  state = "neutral",
  neutralIdleMode = "bored-random",
  size = 240,
  transitionDurationSeconds = 0.55,
  shadowColor = DEFAULT_BOT_AVATAR_SHADOW_COLOR_NAME,
  lightColor = DEFAULT_BOT_AVATAR_LIGHT_COLOR_NAME,
  accentColor = lightColor,
  ariaLabel,
  paused = false,
  gaze = "none",
  gazeConfig,
  focusElement = null
}: ProceduralBotAvatarProps) => {
  const currentState: BotAvatarState = isBotAvatarState(state) ? state : "neutral";
  const generatedRawId = useId();
  const headClipPathId = `bot-avatar-head-clip-${generatedRawId.replace(/:/g, "")}`;

  const svgElementRef = useRef<SVGSVGElement>(null);
  const leftEyePathElementRef = useRef<SVGPathElement>(null);
  const rightEyePathElementRef = useRef<SVGPathElement>(null);
  const mouthPathElementRef = useRef<SVGPathElement>(null);
  const antennaCircleElementRef = useRef<SVGCircleElement>(null);
  const innerHeadGroupElementRef = useRef<SVGGElement>(null);
  const gazeGroupElementRef = useRef<SVGGElement>(null);
  const eyelidGroupElementRef = useRef<SVGGElement>(null);
  const flinchBodyElementRef = useRef<SVGGElement>(null);
  const activeMorphTweenRef = useRef<Killable | null>(null);
  const activeIdleAnimationRef = useRef<Killable | null>(null);
  const activeNeutralBoredTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialPathSetRef = useRef(computeAllFacialPathsForState(model, currentState));

  const gazeIsActive = gaze !== "none" && Boolean(model.gaze);
  const bodyFlinchIsActive = gazeIsActive && Boolean(model.gaze?.bodyFlinch);
  useGazeBehavior({
    svgElementRef,
    gazeGroupElementRef,
    eyelidGroupElementRef,
    bodyElementRef: flinchBodyElementRef,
    gaze,
    geometry: model.gaze,
    config: gazeConfig,
    focusElement
  });

  useEffect(() => {
    const animationContext: AnimationContext = {
      model,
      leftEyePathElementRef,
      rightEyePathElementRef,
      mouthPathElementRef,
      antennaCircleElementRef,
      innerHeadGroupElementRef
    };

    if (!animationContext.leftEyePathElementRef.current || !animationContext.rightEyePathElementRef.current) {
      return undefined;
    }

    activeMorphTweenRef.current?.kill();
    activeIdleAnimationRef.current?.kill();
    if (activeNeutralBoredTimeoutRef.current) {
      clearTimeout(activeNeutralBoredTimeoutRef.current);
      activeNeutralBoredTimeoutRef.current = null;
    }

    if (animationContext.innerHeadGroupElementRef.current) {
      gsap.set(animationContext.innerHeadGroupElementRef.current, { clearProps: "transform" });
    }
    if (animationContext.antennaCircleElementRef.current) {
      gsap.set(animationContext.antennaCircleElementRef.current, { clearProps: "transform" });
    }

    if (paused) {
      return undefined;
    }

    const currentlyRenderedPaths = {
      leftEyePathString: animationContext.leftEyePathElementRef.current.getAttribute("d") ?? "",
      rightEyePathString: animationContext.rightEyePathElementRef.current.getAttribute("d") ?? "",
      mouthPathString: animationContext.mouthPathElementRef.current?.getAttribute("d") ?? ""
    };

    const targetPathsForNextState = computeAllFacialPathsForState(model, currentState);

    const scheduleNeutralBoredTimeout = (delayMilliseconds: number, callback: () => void) => {
      if (activeNeutralBoredTimeoutRef.current) {
        clearTimeout(activeNeutralBoredTimeoutRef.current);
      }
      activeNeutralBoredTimeoutRef.current = setTimeout(() => {
        activeNeutralBoredTimeoutRef.current = null;
        callback();
      }, delayMilliseconds);
    };

    const startNeutralBoredIdleLoop = () => {
      const scheduleNextBoredAnimation = () => {
        const randomIntervalMilliseconds = pickRandomDurationMilliseconds(
          DEFAULT_NEUTRAL_BORED_INTERVAL_MIN_MS,
          DEFAULT_NEUTRAL_BORED_INTERVAL_MAX_MS
        );

        scheduleNeutralBoredTimeout(randomIntervalMilliseconds, () => {
          const randomVariantDurationMilliseconds = pickRandomDurationMilliseconds(
            DEFAULT_NEUTRAL_BORED_VARIANT_DURATION_MIN_MS,
            DEFAULT_NEUTRAL_BORED_VARIANT_DURATION_MAX_MS
          );
          const boredAnimationBuilder = pickRandomNeutralBoredAnimationBuilder();
          activeIdleAnimationRef.current?.kill();
          activeIdleAnimationRef.current = boredAnimationBuilder(animationContext, randomVariantDurationMilliseconds);

          scheduleNeutralBoredTimeout(randomVariantDurationMilliseconds, () => {
            activeIdleAnimationRef.current?.kill();
            activeIdleAnimationRef.current = null;

            if (animationContext.innerHeadGroupElementRef.current) {
              gsap.set(animationContext.innerHeadGroupElementRef.current, { clearProps: "transform" });
            }
            if (animationContext.antennaCircleElementRef.current) {
              gsap.set(animationContext.antennaCircleElementRef.current, { clearProps: "transform" });
            }

            scheduleNextBoredAnimation();
          });
        });
      };

      scheduleNextBoredAnimation();
    };

    const startIdleAnimationForCurrentState = () => {
      if (browserPrefersReducedMotion()) {
        activeIdleAnimationRef.current = null;
        return;
      }

      if (currentState === "neutral") {
        if (neutralIdleMode === "static") {
          activeIdleAnimationRef.current = null;
          return;
        }
        startNeutralBoredIdleLoop();
        return;
      }

      const idleBuilder = idleAnimationBuildersByStateKey[currentState];
      activeIdleAnimationRef.current = idleBuilder(animationContext);
    };

    const allFacialPathsAlreadyMatchTarget =
      currentlyRenderedPaths.leftEyePathString === targetPathsForNextState.leftEyePathString &&
      currentlyRenderedPaths.rightEyePathString === targetPathsForNextState.rightEyePathString &&
      currentlyRenderedPaths.mouthPathString === targetPathsForNextState.mouthPathString;

    if (allFacialPathsAlreadyMatchTarget) {
      startIdleAnimationForCurrentState();
    } else {
      const morphProgressContainer = { easedProgress: 0 };
      activeMorphTweenRef.current = gsap.to(morphProgressContainer, {
        easedProgress: 1,
        duration: transitionDurationSeconds,
        ease: "power3.inOut",
        onUpdate: () => {
          const progress = morphProgressContainer.easedProgress;
          animationContext.leftEyePathElementRef.current?.setAttribute(
            "d",
            interpolateNumericValuesBetweenPathStrings(
              currentlyRenderedPaths.leftEyePathString,
              targetPathsForNextState.leftEyePathString,
              progress
            )
          );
          animationContext.rightEyePathElementRef.current?.setAttribute(
            "d",
            interpolateNumericValuesBetweenPathStrings(
              currentlyRenderedPaths.rightEyePathString,
              targetPathsForNextState.rightEyePathString,
              progress
            )
          );
          animationContext.mouthPathElementRef.current?.setAttribute(
            "d",
            interpolateNumericValuesBetweenPathStrings(
              currentlyRenderedPaths.mouthPathString,
              targetPathsForNextState.mouthPathString,
              progress
            )
          );
        },
        onComplete: startIdleAnimationForCurrentState
      });
    }

    return () => {
      activeMorphTweenRef.current?.kill();
      activeIdleAnimationRef.current?.kill();
      if (activeNeutralBoredTimeoutRef.current) {
        clearTimeout(activeNeutralBoredTimeoutRef.current);
        activeNeutralBoredTimeoutRef.current = null;
      }
    };
  }, [model, currentState, neutralIdleMode, paused, transitionDurationSeconds]);

  const initialPaths = initialPathSetRef.current;
  const computedAriaLabel = ariaLabel ?? `Bot avatar - ${currentState} state`;
  const colors = { shadowColor, lightColor, accentColor };
  const [viewBoxMinX, viewBoxMinY, viewBoxWidth, viewBoxHeight] = model.viewBox;
  const viewBoxAttribute = `${viewBoxMinX} ${viewBoxMinY} ${viewBoxWidth} ${viewBoxHeight}`;

  const bodyShapes = model.body.map((shape, index) =>
    renderProceduralShape(shape, index, colors, antennaCircleElementRef)
  );
  const eyesOriginX = (model.features.leftEye.cx + model.features.rightEye.cx) / 2;
  const eyesOriginY = (model.features.leftEye.cy + model.features.rightEye.cy) / 2;
  const eyePaths = (
    <>
      <path ref={leftEyePathElementRef} d={initialPaths.leftEyePathString} fill={resolveFillColor(model.features.leftEye.fillRole, colors)} />
      <path ref={rightEyePathElementRef} d={initialPaths.rightEyePathString} fill={resolveFillColor(model.features.rightEye.fillRole, colors)} />
    </>
  );
  const eyeAndMouthShapes = (
    <>
      {gazeIsActive ? (
        <g
          ref={gazeGroupElementRef}
          className="vultus-gaze"
          style={{ transformBox: "view-box", transformOrigin: `${eyesOriginX}px ${eyesOriginY}px` }}
        >
          <g
            ref={eyelidGroupElementRef}
            className="vultus-eyelid"
            style={{ transformBox: "view-box", transformOrigin: `${eyesOriginX}px ${eyesOriginY}px` }}
          >
            {eyePaths}
          </g>
        </g>
      ) : (
        eyePaths
      )}
      {model.features.mouth ? (
        <path
          ref={mouthPathElementRef}
          d={initialPaths.mouthPathString}
          fill={resolveFillColor(model.features.mouth.fillRole, colors)}
        />
      ) : null}
    </>
  );

  // When bodyFlinch is enabled, only shapes tagged slot:"flinchBody" (plus
  // the eyes) sit inside the group a click animates — everything else
  // (e.g. a back "shadow" bubble) stays a static sibling, unaffected.
  // Skipped entirely when bodyFlinch is off, so non-flinch models render
  // exactly as before (bodyShapes/eyeAndMouthShapes as flat siblings).
  const bodyContent = bodyFlinchIsActive ? (
    <>
      {model.body
        .filter((shape) => shape.slot !== "flinchBody")
        .map((shape, index) => renderProceduralShape(shape, index, colors, antennaCircleElementRef))}
      <g
        ref={flinchBodyElementRef}
        className="vultus-flinch-body"
        style={{ transformBox: "view-box", transformOrigin: `${eyesOriginX}px ${eyesOriginY}px` }}
      >
        {model.body
          .filter((shape) => shape.slot === "flinchBody")
          .map((shape, index) => renderProceduralShape(shape, index, colors, antennaCircleElementRef))}
        {eyeAndMouthShapes}
      </g>
    </>
  ) : (
    <>
      {bodyShapes}
      {eyeAndMouthShapes}
    </>
  );

  return (
    <svg
      ref={svgElementRef}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBoxAttribute}
      width={size}
      height={size}
      role="img"
      aria-label={computedAriaLabel}
      style={
        gazeIsActive
          ? // Default SVG hit-testing (visiblePainted) only responds over
            // actually-painted pixels, so a mark with transparent corners
            // (like the Chatticus mark) would silently miss pointerenter
            // for a real cursor unless the whole rectangular box is made
            // hit-testable. Scoped to gaze-active instances only, so
            // every other BotAvatar usage (including the classic model's
            // golden-snapshot-tested output) is untouched.
            { display: "block", pointerEvents: "all" }
          : { display: "block" }
      }
    >
      {model.clipShape ? (
        <defs>
          <clipPath id={headClipPathId}>
            <circle cx={model.clipShape.cx} cy={model.clipShape.cy} r={model.clipShape.r} />
          </clipPath>
        </defs>
      ) : null}
      {model.background ? <rect width={viewBoxWidth} height={viewBoxHeight} fill={resolveFillColor(model.background, colors)} /> : null}
      <g ref={innerHeadGroupElementRef}>
        {(model.underlayShapes ?? []).map((shape, index) =>
          renderProceduralShape(shape, index, colors, antennaCircleElementRef)
        )}
        {model.clipShape ? <g clipPath={`url(#${headClipPathId})`}>{bodyContent}</g> : bodyContent}
      </g>
    </svg>
  );
};

export const BotAvatar = ({
  model = VULTUS_CLASSIC_MODEL,
  state = "neutral",
  size = 240,
  lightColor = DEFAULT_BOT_AVATAR_LIGHT_COLOR_NAME,
  ariaLabel,
  paused = false,
  ...proceduralProps
}: BotAvatarProps) => {
  const currentState: BotAvatarState = isBotAvatarState(state) ? state : "neutral";
  if (model.renderer === "lottie") {
    return (
      <LottieBotAvatar
        model={model}
        state={currentState}
        size={size}
        lightColor={lightColor}
        ariaLabel={ariaLabel}
        paused={paused}
      />
    );
  }
  return (
    <ProceduralBotAvatar
      {...proceduralProps}
      model={model}
      state={currentState}
      size={size}
      lightColor={lightColor}
      ariaLabel={ariaLabel}
      paused={paused}
    />
  );
};
