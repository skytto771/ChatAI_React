import React from 'react';
import { MODEL_DISPLAY_NAMES } from '@/types';
import styles from './index.module.scss';

interface ModelBadgeProps {
    model: string;
}

const ModelBadge: React.FC<ModelBadgeProps> = ({ model }) => {
    return (
        <span className={styles.modelBadge}>
            {MODEL_DISPLAY_NAMES[model] || model}
        </span>
    );
};

export default ModelBadge;