import styles from "./VideoPlayer.module.css";

const PLAYER_CONTAINER_ID = "youtube-player";

interface VideoPlayerProps {
  /** Pass this ID to useYouTubePlayer's containerId */
  containerId?: string;
}

export function VideoPlayer({
  containerId = PLAYER_CONTAINER_ID,
}: VideoPlayerProps) {
  return (
    <div className={styles.container} data-testid="video-player">
      <div id={containerId} className={styles.player} />
    </div>
  );
}

VideoPlayer.CONTAINER_ID = PLAYER_CONTAINER_ID;
