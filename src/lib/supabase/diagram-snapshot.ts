import type { Diagram } from '@/lib/domain/diagram';
import { diagramSchema } from '@/lib/domain/diagram';

export function diagramToSnapshot(diagram: Diagram): unknown {
    return JSON.parse(JSON.stringify(diagram)) as unknown;
}

type ListOptions = {
    includeTables?: boolean;
    includeRelationships?: boolean;
    includeDependencies?: boolean;
    includeAreas?: boolean;
    includeCustomTypes?: boolean;
    includeNotes?: boolean;
};

export function snapshotRowToDiagram(
    row: {
        id: string;
        name: string;
        snapshot: unknown;
        created_at: string;
        updated_at: string;
    },
    options: ListOptions = {}
): Diagram {
    const snap =
        typeof row.snapshot === 'string'
            ? (JSON.parse(row.snapshot) as Record<string, unknown>)
            : (row.snapshot as Record<string, unknown>);
    const base = diagramSchema.parse({
        ...snap,
        id: row.id,
        name: row.name,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
    });

    if (!options.includeTables) {
        delete base.tables;
    }
    if (!options.includeRelationships) {
        delete base.relationships;
    }
    if (!options.includeDependencies) {
        delete base.dependencies;
    }
    if (!options.includeAreas) {
        delete base.areas;
    }
    if (!options.includeCustomTypes) {
        delete base.customTypes;
    }
    if (!options.includeNotes) {
        delete base.notes;
    }

    return base;
}
