import styles from "./index.module.scss";

export default function GamePage() {
  return (
    <main className={styles.page}>
      <iframe
        className={styles.game}
        title="My Cocos Game"
        src="/cocos/web-mobile/index.html"
        allow="fullscreen"
      />
    </main>
  );
}
