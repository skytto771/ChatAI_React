import styles from "./PlayablePage.module.scss";

export default function Playable() {
  return (
    <>
      <div className={styles.playable}>
        <iframe
          className={styles.game}
          title="My Cocos Game"
          src="/cocos/web-mobile/index.html"
          allow="fullscreen"
        />
      </div>
    </>
  );
}
