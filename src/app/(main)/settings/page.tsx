'use client';

import { useTheme, THEME_PALETTES, ThemeId } from '@/contexts/ThemeContext';

const SettingsPage = () => {
    return (
        <div className="p-8 sm:p-10 h-full overflow-y-auto">
            <header className="mb-8">
                <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    Settings
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    現在、設定可能な項目はありません。
                </p>
            </header>
        </div>
    );
};

export default SettingsPage;