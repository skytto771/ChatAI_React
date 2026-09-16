import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router";
import styles from "./index.module.scss";

const shots = [
  ["01-menu.png", "Menu", "主菜单 · 项目入口"],
  ["02-weapons.png", "Camp / Workshop", "武器工坊 · 6 类武器"],
  ["03-upgrades.png", "Camp / Upgrade", "属性强化 · 局外成长"],
  ["04-camp.png", "Camp", "营地 · 行动终端"],
  ["05-route.png", "Route", "分层路线 · 节点状态"],
  ["06-battle.png", "Battle", "战斗节点 · 击杀目标"],
  ["07-boss.png", "Boss Battle", "鸣骨裂颅兽 · Boss 血条"],
] as const;

function PortfolioLanding() {
  const [preview, setPreview] = useState<string | null>(null);
  return (
    <div className={styles.portfolio}>
      <div className={styles.grain} aria-hidden="true" />
      <header className={styles.nav}>
        <div className={`${styles.shell} ${styles.navInner}`}>
          <Link className={styles.brand} to="/game">
            DXF / GAME DEV
          </Link>
          <nav className={styles.navLinks}>
            <a href="#demo">演示</a>
            <a href="#gallery">视觉</a>
            <a href="#systems">系统</a>
            <a href="#about">关于</a>
          </nav>
        </div>
      </header>
      <main id="top">
        <section className={`${styles.shell} ${styles.hero}`}>
          <div>
            <p className={styles.eyebrow}>
              <i /> COCOS CREATOR · PERSONAL PROJECT
            </p>
            <h1>
              鸣骨灾变<span>The Ringing Bone Disaster</span>
            </h1>
            <p className={styles.heroCopy}>
              <strong>一款俯视角 Roguelite 生存游戏原型。</strong>
              <br />
              从前端开发转入游戏客户端，独立完成玩法拆分、代码整合、编辑器配置与实机验证，使用
              AI Agent 提升开发效率。
            </p>
            <div className={styles.actions}>
              <Link className={styles.btn} to="/game/playable">
                ▶ 立即试玩
              </Link>
              <a className={styles.btnSecondary} href="#demo">
                观看演示 ↓
              </a>
            </div>
            <div className={styles.meta}>
              <div>
                <b>3.8.8</b>Cocos Creator
              </div>
              <div>
                <b>6 + 3</b>武器 · 敌人
              </div>
            </div>
          </div>
          <div className={styles.heroArt}>
            <video
              className={styles.heroVideo}
              autoPlay
              muted
              loop
              playsInline
              poster="/cocos/web-mobile/assets/resources/native/50/50bbb160-b58b-4ce4-8b3e-30b4600a7adc.png"
            >
              <source
                src="/cocos/web-mobile/assets/resources/native/aa/aa03b21d-b900-4137-be12-da8799175132.mp4"
                type="video/mp4"
              />
            </video>
            <span>DEMO / IN PROGRESS</span>
          </div>
        </section>
        <section id="demo">
          <div className={styles.shell}>
            <div className={styles.sectionHead}>
              <div>
                <p className={styles.kicker}>01 · WATCH IT MOVE</p>
                <h2>动态演示</h2>
              </div>
              {/* <p>先看节奏，再进入试玩。页面已预留完整实机录屏替换位。</p> */}
            </div>
            <div className={styles.videoWrap}>
              <div className={styles.videoCard}>
                <video
                  controls
                  muted
                  loop
                  playsInline
                  poster="/portfolio/screens/06-battle.png"
                >
                  <source
                    src="/portfolio/screens/demoPreview.mp4"
                    type="video/mp4"
                  />
                </video>
                <div className={styles.videoNote}>
                  <strong>实机视频入口</strong>
                  {/* 当前使用项目动态演示片段，可替换为完整录屏文件。 */}
                </div>
              </div>
              <aside className={styles.videoSide}>
                <div>
                  <h3>Playable slice</h3>
                  <ul>
                    <li>营地 → 路线 → 战斗 → 奖励</li>
                    <li>3 类敌人 · 6 类自动武器</li>
                    <li>普通 / 困难 / 地狱三档难度</li>
                    <li>Web Desktop 构建试玩</li>
                  </ul>
                </div>
                <Link className={styles.btn} to="/game/playable">
                  打开试玩 ↗
                </Link>
              </aside>
            </div>
          </div>
        </section>
        <section id="gallery">
          <div className={styles.shell}>
            <div className={styles.sectionHead}>
              <div>
                <p className={styles.kicker}>02 · IN-GAME CAPTURES</p>
                <h2>实际运行截图</h2>
              </div>
              <p>来自当前构建与实机回归的界面、路线、战斗和 Boss 场景。</p>
            </div>
            <div className={styles.gallery}>
              {shots.map(([file, label, title], index) => (
                <button
                  className={styles.shot}
                  key={file}
                  onClick={() => setPreview(`/portfolio/screens/${file}`)}
                >
                  <img src={`/portfolio/screens/${file}`} alt={title} />
                  <span>
                    <small>{label}</small>
                    {title}
                  </span>
                  <b>0{index + 1}</b>
                </button>
              ))}
            </div>
          </div>
        </section>
        <section id="systems">
          <div className={styles.shell}>
            <div className={styles.sectionHead}>
              <div>
                <p className={styles.kicker}>03 · ENGINEERING</p>
                <h2>我做了什么</h2>
              </div>
              <p>从可玩的核心循环出发，把功能拆成可验证的模块。</p>
            </div>
            <div className={styles.systems}>
              <article>
                <span>01 / FLOW</span>
                <h3>流程与路线</h3>
                <p>营地、分层路线、节点状态、Boss 可达性校验和 Run 快照。</p>
              </article>
              <article>
                <span>02 / COMBAT</span>
                <h3>战斗与成长</h3>
                <p>自动攻击、投射物、敌人 AI、经验升级、节点奖励与 Boss 战。</p>
              </article>
              <article>
                <span>03 / MAP</span>
                <h3>地图与导航</h3>
                <p>Tiled JSON、碰撞、前景遮挡、导航网格、A* 与出生点筛选。</p>
              </article>
              <article>
                <span>04 / TOOLING</span>
                <h3>AI × Pixel Art</h3>
                <p>
                  AI Agent 辅助编码排错；Aseprite 绘制、切图并导出基础帧动画。
                </p>
              </article>
            </div>
          </div>
        </section>
        <section id="about">
          <div className={`${styles.shell} ${styles.about}`}>
            <div>
              <p className={styles.kicker}>04 · ABOUT THE MAKER</p>
              <h2>从前端到游戏客户端。</h2>
              <p>
                2026 年 6 月 21 日开始学习 Cocos
                Creator。这个项目是一次持续中的独立实践：我负责需求取舍、代码整合、Cocos
                编辑器配置、素材处理和实机回归，并借助 AI Agent
                快速学习与定位问题。
              </p>
              <p>
                目前 Demo 已完成阶段性 Web
                构建回归和难度调试，虽然有不少缺点，但仍在继续补充完整内容。
              </p>
              <div className={styles.stack}>
                <span>Cocos Creator 3.8.8</span>
                <span>TypeScript</span>
                <span>Tiled</span>
                <span>Aseprite</span>
                <span>AI Agent</span>
              </div>
            </div>
            <div className={styles.facts}>
              <div>
                <span>定位</span>
                <b>初级游戏客户端 / Cocos Creator</b>
              </div>
              <div>
                <span>开发方式</span>
                <b>个人独立开发 · AI 辅助</b>
              </div>
              <div>
                <span>当前状态</span>
                <b>Demo 开发中</b>
              </div>
              <div>
                <span>试玩平台</span>
                <b>Web Desktop</b>
              </div>
            </div>
          </div>
        </section>
        <section className={`${styles.shell} ${styles.cta}`}>
          <div className={styles.ctaBox}>
            <div>
              <h2>想看代码和实际运行？</h2>
              <p>
                欢迎从试玩开始，也欢迎交流 Cocos、TypeScript 与 AI 协作开发。
              </p>
            </div>
            <Link className={styles.btn} to="/game/playable">
              进入试玩 ↗
            </Link>
          </div>
        </section>
      </main>
      <footer className={`${styles.shell} ${styles.footer}`}>
        <span>© 2026 DXF · The Ringing Bone Disaster</span>
        <span>Personal portfolio / Work in progress</span>
      </footer>
      {preview && (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-label="截图预览"
          onClick={() => setPreview(null)}
        >
          <button aria-label="关闭预览" onClick={() => setPreview(null)}>
            ×
          </button>
          <img src={preview} alt="截图放大预览" />
        </div>
      )}
    </div>
  );
}

export default function GamePage() {
  const location = useLocation();
  const playable = location.pathname.endsWith("/playable");
  return (
    <main className={styles.page}>
      {playable && (
        <Link className={styles.backButton} to="/game">
          ← 返回项目
        </Link>
      )}
      <Outlet />
    </main>
  );
}

export { PortfolioLanding };
