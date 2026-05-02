import type { DBMLError } from '@/lib/dbml/dbml-import/dbml-import-error';
import type * as Monaco from 'monaco-editor';

/** Full monaco module (passed from editor `onMount`); avoids static `monaco-editor` import in this file. */
export type MonacoRuntime = typeof import('monaco-editor');

export const highlightErrorLine = ({
    monaco,
    error,
    model,
    editorDecorationsCollection,
}: {
    monaco: MonacoRuntime;
    error: DBMLError;
    model?: Monaco.editor.ITextModel | null;
    editorDecorationsCollection:
        | Monaco.editor.IEditorDecorationsCollection
        | undefined;
}) => {
    if (!model) return;
    if (!editorDecorationsCollection) return;

    const decorations = [
        {
            range: new monaco.Range(
                error.line,
                1,
                error.line,
                model.getLineMaxColumn(error.line)
            ),
            options: {
                isWholeLine: true,
                className: 'dbml-error-line',
                glyphMarginClassName: 'dbml-error-glyph',
                hoverMessage: { value: error.message },
                overviewRuler: {
                    color: '#ff0000',
                    position: monaco.editor.OverviewRulerLane.Right,
                    darkColor: '#ff0000',
                },
            },
        },
    ];

    editorDecorationsCollection?.set(decorations);
};

export const clearErrorHighlight = (
    editorDecorationsCollection:
        | Monaco.editor.IEditorDecorationsCollection
        | undefined
) => {
    if (editorDecorationsCollection) {
        editorDecorationsCollection.clear();
    }
};
