import styles from './index.module.scss';
import { GoogleIcon, GitHubIcon } from '@/components/Icons';

interface SocialButtonsProps {
  onClick: (provider: string) => void;
}

const SocialButtons = ({ onClick }: SocialButtonsProps) => (
    <>
        <div className={styles.divider}>或 使用以下方式</div>
        <div className={styles.socialBtns}>
            <button className={styles.socialBtn} onClick={() => onClick('Google')}>
                <GoogleIcon />
                Google
            </button>
            <button className={styles.socialBtn} onClick={() => onClick('GitHub')}>
                <GitHubIcon />
                GitHub
            </button>
        </div>
    </>
);

export default SocialButtons;