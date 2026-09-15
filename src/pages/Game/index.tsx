import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router";
import styles from "./index.module.scss";

const screenshots = [
  [
    "/cocos/web-mobile/assets/resources/native/50/50bbb160-b58b-4ce4-8b3e-30b4600a7adc.png",
    "废墟城市 · 场景搭建",
    "01",
  ],
  [
    "/cocos/web-mobile/assets/resources/native/7d/7d81c8d7-abc8-4c34-9655-3293f0f031d7.png",
    "环境叙事 · 氛围设计",
    "02",
  ],
  [
    "/cocos/web-mobile/assets/resources/native/52/52985011-5204-4632-bdce-b60a70fbdc77.png",
    "灯光系统 · 关卡引导",
    "03",
  ],
  [
    "/cocos/web-mobile/assets/resources/native/f0/f0ec0644-4469-4f28-9454-47a87780f123.png",
    "探索路线 · 镜头构图",
    "04",
  ],
  [
    "/cocos/web-mobile/assets/resources/native/83/8352f5d3-c6b1-461c-a820-38254016a7ec.png",
    "像素资产 · 视觉规范",
    "05",
  ],
  [
    "/cocos/web-mobile/assets/resources/native/f5/f537f103-7771-4965-a062-aa06239b9f63.png",
    "交互原型 · Web 适配",
    "06",
  ],
] as const;

function GameLanding() {
  const [videoReady, setVideoReady] = useState(false);

  return (
    <div className={styles.landing}>
      <header className={styles.header}>
        <Link className={styles.brand} to="/game">
          <span className={styles.brandMark}>DX</span>
          <span>
            <strong>DESIGN & CODE</strong>
            <small>PERSONAL PORTFOLIO / 2026</small>
          </span>
        </Link>
        <nav className={styles.nav} aria-label="作品导航">
          <a href="#overview">概览</a>
          <a href="#process">负责内容</a>
          <a href="#gallery">视觉记录</a>
          <Link className={styles.navPlay} to="/game/playable">
            试玩 Demo <span>↗</span>
          </Link>
        </nav>
      </header>

      <main>
        <section className={styles.hero} id="overview">
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>
              PROJECT 01 <span>/</span> GAME DEVELOPMENT
            </p>
            <h1>
              Echoes
              <br />
              <em>After Ashes</em>
            </h1>
            <p className={styles.subtitle}>
              一款基于 Cocos Creator 的像素叙事探索游戏
            </p>
            <p className={styles.lede}>
              我负责从玩法原型、场景搭建到 Web
              端发布的完整实现，把一段关于“在废墟中寻找回应”的故事，做成可直接在浏览器体验的作品。
            </p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryButton} to="/game/playable">
                <span>▶</span> 在线试玩
              </Link>
              <a className={styles.textButton} href="#process">
                查看我的贡献 ↓
              </a>
            </div>
            <a className={styles.scrollCue} href="#process">
              <span /> 向下浏览项目详情
            </a>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.heroFrame}>
              <video
                className={styles.heroVideo}
                autoPlay
                muted
                loop
                playsInline
                poster={screenshots[0][0]}
                onCanPlay={() => setVideoReady(true)}
              >
                <source
                  src="/cocos/web-mobile/assets/resources/native/aa/aa03b21d-b900-4137-be12-da8799175132.mp4"
                  type="video/mp4"
                />
              </video>
              {!videoReady && (
                <div className={styles.videoFallback} aria-hidden="true" />
              )}
              <div className={styles.frameLabel}>GAMEPLAY REEL / 00:42</div>
            </div>
            <div className={styles.visualCaption}>
              <span>WEB MOBILE BUILD</span>
              <span>COCOS CREATOR 3.x</span>
            </div>
          </div>
        </section>

        <section className={styles.projectFacts} aria-label="项目概览">
          <div>
            <span>我的角色</span>
            <strong>独立开发 / 全栈实现</strong>
          </div>
          <div>
            <span>项目周期</span>
            <strong>2026 · 6 周</strong>
          </div>
          <div>
            <span>技术栈</span>
            <strong>TypeScript · Cocos · React</strong>
          </div>
          <div>
            <span>交付形式</span>
            <strong>Web / Desktop Browser</strong>
          </div>
        </section>

        <section className={styles.processSection} id="process">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.kicker}>ROLE & CONTRIBUTION</p>
              <h2>我做了什么</h2>
            </div>
            <p className={styles.sectionNote}>
              从第一个交互原型，到现在
              <br />
              你正在浏览的这个页面。
            </p>
          </div>
          <div className={styles.processGrid}>
            <article>
              <span>01</span>
              <h3>玩法与交互</h3>
              <p>
                设计移动、探索、对话和物品收集的核心循环，建立可复用的状态管理与输入反馈。
              </p>
            </article>
            <article>
              <span>02</span>
              <h3>场景与视觉</h3>
              <p>
                搭建废墟城市关卡，统一像素资产、灯光层级和镜头构图，让环境本身承担叙事。
              </p>
            </article>
            <article>
              <span>03</span>
              <h3>工程与发布</h3>
              <p>
                完成 Cocos Web 构建、资源路径适配，并将游戏嵌入 React
                作品集，支持在线试玩。
              </p>
            </article>
          </div>
        </section>

        <section className={styles.gallerySection} id="gallery">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.kicker}>SELECTED SCREENS</p>
              <h2>
                视觉记录 <em>/ 06</em>
              </h2>
            </div>
            <p className={styles.sectionNote}>
              项目中的关键画面与
              <br />
              实现思路记录。
            </p>
          </div>
          <div className={styles.galleryGrid}>
            {screenshots.map(([src, title, index], i) => (
              <figure
                className={`${styles.galleryItem} ${i === 0 ? styles.featured : ""}`}
                key={src}
              >
                <div className={styles.imageWrap}>
                  <img src={src} alt={title} loading="lazy" />
                  <span>{index}</span>
                  <b>↗</b>
                </div>
                <figcaption>
                  <strong>{title}</strong>
                  <small>CASE STUDY</small>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className={styles.ctaSection}>
          <div>
            <p className={styles.kicker}>TRY THE BUILD</p>
            <h2>
              亲自体验
              <br />
              <em>我的作品。</em>
            </h2>
          </div>
          <Link className={styles.ctaButton} to="/game/playable">
            打开试玩 Demo <span>↗</span>
          </Link>
        </section>
      </main>
      <footer className={styles.footer}>
        <span>DX / GAME DEVELOPER</span>
        <span>OPEN TO OPPORTUNITIES</span>
        <a href="mailto:hello@example.com">HELLO@EXAMPLE.COM ↗</a>
      </footer>
    </div>
  );
}

export default function GamePage() {
  const location = useLocation();
  const isPlayable = location.pathname.endsWith("/playable");
  return (
    <main className={styles.page}>
      {isPlayable && (
        <Link className={styles.backButton} to="/game">
          ← 返回项目
        </Link>
      )}
      <Outlet />
    </main>
  );
}

export { GameLanding };
