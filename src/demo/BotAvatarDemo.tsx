import { useEffect, useRef, useState } from "react";
import { BotAvatar } from "../lib/BotAvatar";
import {
  automatedSpeakingPlaybackSequence,
  formatStateKeyAsReadableLabel,
  orderedStateButtonDescriptors
} from "../lib/avatarStates";
import type { BotAvatarState } from "../lib/avatarStates";

export const BotAvatarDemo = () => {
  const [currentlyDisplayedState, setCurrentlyDisplayedState] = useState<BotAvatarState>("neutral");
  const [isPlayingAutomatedSpeechSequence, setIsPlayingAutomatedSpeechSequence] = useState(false);
  const scheduledPlaybackTimeoutHandlesRef = useRef<number[]>([]);

  const cancelAllScheduledPlaybackTimeouts = () => {
    scheduledPlaybackTimeoutHandlesRef.current.forEach((handle) => window.clearTimeout(handle));
    scheduledPlaybackTimeoutHandlesRef.current = [];
  };

  useEffect(() => () => cancelAllScheduledPlaybackTimeouts(), []);

  const handleManualStateButtonPress = (stateKey: BotAvatarState) => {
    cancelAllScheduledPlaybackTimeouts();
    setIsPlayingAutomatedSpeechSequence(false);
    setCurrentlyDisplayedState(stateKey);
  };

  const startAutomatedSpeakingPlayback = () => {
    cancelAllScheduledPlaybackTimeouts();
    setIsPlayingAutomatedSpeechSequence(true);
    let cumulativeDelayMilliseconds = 0;

    automatedSpeakingPlaybackSequence.forEach((sequenceFrame, frameIndex) => {
      const scheduledHandle = window.setTimeout(() => {
        setCurrentlyDisplayedState(sequenceFrame.stateKey);
        if (frameIndex === automatedSpeakingPlaybackSequence.length - 1) {
          setIsPlayingAutomatedSpeechSequence(false);
        }
      }, cumulativeDelayMilliseconds);
      scheduledPlaybackTimeoutHandlesRef.current.push(scheduledHandle);
      cumulativeDelayMilliseconds += sequenceFrame.holdMilliseconds;
    });
  };

  const currentEditionDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <div className="editorial-frame">
      <div className="masthead-row">
        <span className="edition-label">The Avatar Almanac - Vol. III</span>
        <span className="edition-meta">{currentEditionDate}</span>
      </div>
      <div className="double-rule" />

      <h1 className="display-title">
        A <em>Living</em> Countenance,
        <br />
        in Nine Acts
      </h1>
      <p className="deck-subtitle">
        Each state is animated on its own - the bot blinks when neutral, lets its eyes wander while thinking, breathes
        when deep in thought, pulses its antenna while calling tools, scans like it is reading when handling a response,
        and chatters its mouth when speaking. Press any state to call it forth.
      </p>

      <div className="stage-with-caption">
        <div className="avatar-stage">
          <BotAvatar state={currentlyDisplayedState} size={300} />
        </div>
        <div className="state-caption">
          <span className="caption-label">Now showing</span>
          <span className="caption-value">{formatStateKeyAsReadableLabel(currentlyDisplayedState)}</span>
        </div>
      </div>

      <h2 className="section-heading">States - choose one</h2>
      <div className="control-grid" role="group" aria-label="Bot avatar state selector">
        {orderedStateButtonDescriptors.map((descriptor) => {
          const isCurrentlyActive = currentlyDisplayedState === descriptor.stateKey;
          return (
            <button
              key={descriptor.stateKey}
              type="button"
              className={`state-button${isCurrentlyActive ? " is-active" : ""}`}
              onClick={() => handleManualStateButtonPress(descriptor.stateKey)}
              aria-pressed={isCurrentlyActive}
            >
              <span className="button-index">{descriptor.romanNumeralIndex}</span>
              <span className="button-label">{descriptor.buttonLabel}</span>
            </button>
          );
        })}
      </div>

      <div className="sequence-row">
        <button
          type="button"
          className={`sequence-button${isPlayingAutomatedSpeechSequence ? " is-running" : ""}`}
          onClick={startAutomatedSpeakingPlayback}
        >
          {isPlayingAutomatedSpeechSequence ? "Playing speech sequence..." : "> Play full speech sequence"}
        </button>
      </div>

      <div className="footer-note">
        <span>Reusable React component</span>
        <span className="usage-snippet">
          {'<BotAvatar state="thinking" shadowColor="dimgray" lightColor="white" />'}
        </span>
        <span>Idle animations - per state</span>
      </div>
    </div>
  );
};
