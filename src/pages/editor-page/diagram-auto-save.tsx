import { useEffect } from 'react';
import { useChartDB } from '@/hooks/use-chartdb';
import { useStorage } from '@/hooks/use-storage';

/**
 * Flushes debounced cloud sync when the tab goes away so recent edits are not lost
 * if the user closes the tab before the normal debounce window.
 */
export const DiagramAutoSave = () => {
    const { currentDiagram, readonly } = useChartDB();
    const storage = useStorage();
    const diagramId = currentDiagram?.id ?? '';

    useEffect(() => {
        if (!diagramId || readonly) {
            return;
        }

        const flush = () => {
            void storage.flushPendingRemoteSync(diagramId);
        };

        const onVisibility = () => {
            if (document.visibilityState === 'hidden') {
                flush();
            }
        };

        window.addEventListener('pagehide', flush);
        window.addEventListener('online', flush);
        document.addEventListener('visibilitychange', onVisibility);
        return () => {
            window.removeEventListener('pagehide', flush);
            window.removeEventListener('online', flush);
            document.removeEventListener('visibilitychange', onVisibility);
        };
    }, [diagramId, readonly, storage]);

    return null;
};
