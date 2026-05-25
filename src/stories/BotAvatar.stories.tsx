import { useEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { BotAvatar } from "../lib/BotAvatar";
import {
  automatedSpeakingPlaybackSequence,
  BOT_AVATAR_STATES,
  orderedStateButtonDescriptors
} from "../lib/avatarStates";
import type { BotAvatarState } from "../lib/avatarStates";
import { BotAvatarDemo } from "../demo/BotAvatarDemo";
import "../demo/editorial.css";

const meta: Meta<typeof BotAvatar> = {
  title: "BotAvatar/BotAvatar",
  component: BotAvatar,
  tags: ["autodocs"],
  args: {
    state: "neutral",
    size: 260,
    transitionDurationSeconds: 0.55,
    shadowColor: "dimgray",
    lightColor: "white"
  },
  argTypes: {
    state: {
      control: { type: "select" },
      options: BOT_AVATAR_STATES
    }
  }
};

export default meta;
type Story = StoryObj<typeof BotAvatar>;

export const Playground: Story = {};

export const States: Story = {
  render: (args) => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
      {BOT_AVATAR_STATES.map((stateKey) => (
        <div
          key={stateKey}
          style={{
            border: "1px solid #d7d1c8",
            padding: 12,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8
          }}
        >
          <BotAvatar {...args} state={stateKey} size={150} />
          <code>{stateKey}</code>
        </div>
      ))}
    </div>
  )
};

const SpeakingSequencePreview = () => {
  const [state, setState] = useState<BotAvatarState>("neutral");
  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    let cumulativeDelayMilliseconds = 0;
    automatedSpeakingPlaybackSequence.forEach((sequenceFrame) => {
      const timeoutHandle = window.setTimeout(() => {
        setState(sequenceFrame.stateKey);
      }, cumulativeDelayMilliseconds);
      timeoutsRef.current.push(timeoutHandle);
      cumulativeDelayMilliseconds += sequenceFrame.holdMilliseconds;
    });

    const loopHandle = window.setInterval(() => {
      let loopDelayMilliseconds = 0;
      automatedSpeakingPlaybackSequence.forEach((sequenceFrame) => {
        const timeoutHandle = window.setTimeout(() => {
          setState(sequenceFrame.stateKey);
        }, loopDelayMilliseconds);
        timeoutsRef.current.push(timeoutHandle);
        loopDelayMilliseconds += sequenceFrame.holdMilliseconds;
      });
    }, cumulativeDelayMilliseconds);

    return () => {
      window.clearInterval(loopHandle);
      timeoutsRef.current.forEach((timeoutHandle) => window.clearTimeout(timeoutHandle));
      timeoutsRef.current = [];
    };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <BotAvatar state={state} size={240} />
      <div style={{ fontFamily: "monospace", fontSize: 12 }}>Current: {state}</div>
      <div style={{ fontFamily: "monospace", fontSize: 12 }}>
        Sequence states: {orderedStateButtonDescriptors.map((descriptor) => descriptor.stateKey).join(", ")}
      </div>
    </div>
  );
};

export const SpeakingSequence: Story = {
  render: () => <SpeakingSequencePreview />
};

export const EditorialDemo: Story = {
  render: () => <BotAvatarDemo />
};
