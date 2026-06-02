"use client";

import { useState, useRef } from "react";
import YouTubePlayer from "./YouTubePlayer";
import styles from "./VideoWithIntro.module.css";

interface VideoWithIntroProps {
  videoId: string;
  autoplay?: boolean;
  isLive?: boolean;
  title?: string;
}

export default function VideoWithIntro({
  videoId,
  autoplay = false,
  isLive = false,
  title,
}: VideoWithIntroProps) {
  const [introEnded, setIntroEnded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleIntroEnd = () => {
    setIntroEnded(true);
  };

  return (
    <div className={styles.container}>
      {/* Logo animation intro */}
      {!introEnded && (
        <div className={styles.intro}>
          <video
            ref={videoRef}
            className={styles.introVideo}
            autoPlay
            muted
            playsInline
            onEnded={handleIntroEnd}
            poster="/assets/vishvavahini-logo-animation-poster.jpg"
          >
            <source
              src="/assets/vishvavahini-logo-animation.mp4"
              type="video/mp4"
            />
          </video>
          <button
            className={styles.skipBtn}
            onClick={handleIntroEnd}
            aria-label="Skip intro"
          >
            Skip
          </button>
        </div>
      )}

      {/* YouTube player — loads after intro */}
      <div
        className={styles.player}
        style={{ opacity: introEnded ? 1 : 0 }}
      >
        <YouTubePlayer
          videoId={videoId}
          autoplay={introEnded && autoplay}
          isLive={isLive}
          title={title}
        />
      </div>
    </div>
  );
}
