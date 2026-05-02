import { useMemo, useRef, type MutableRefObject } from 'react';
import type { StorageContext } from './storage-context';
import { storageInitialValue } from './storage-context';
import { useSupabaseAuth } from '@/context/supabase-auth/use-supabase-auth';
import {
    getSupabaseBrowserClient,
    isSupabaseConfigured,
} from '@/lib/supabase/client';
import {
    diagramToSnapshot,
    snapshotRowToDiagram,
} from '@/lib/supabase/diagram-snapshot';
import type { Diagram } from '@/lib/domain/diagram';

const DEBOUNCE_MS = 1400;

const fullDiagramLoadOptions = {
    includeTables: true,
    includeRelationships: true,
    includeDependencies: true,
    includeAreas: true,
    includeCustomTypes: true,
    includeNotes: true,
} as const;

function totalDiagramFieldCount(diagram: Diagram | undefined): number {
    if (!diagram?.tables?.length) {
        return 0;
    }
    return diagram.tables.reduce((sum, t) => sum + (t.fields?.length ?? 0), 0);
}

type ListArgs = Parameters<StorageContext['listDiagrams']>;
type GetDiagramArgs = Parameters<StorageContext['getDiagram']>;

const MUTATING_KEYS: (keyof StorageContext)[] = [
    'updateDiagram',
    'addTable',
    'updateTable',
    'putTable',
    'deleteTable',
    'deleteDiagramTables',
    'addRelationship',
    'updateRelationship',
    'deleteRelationship',
    'deleteDiagramRelationships',
    'addDependency',
    'updateDependency',
    'deleteDependency',
    'deleteDiagramDependencies',
    'addArea',
    'updateArea',
    'deleteArea',
    'deleteDiagramAreas',
    'addCustomType',
    'updateCustomType',
    'deleteCustomType',
    'deleteDiagramCustomTypes',
    'addNote',
    'updateNote',
    'deleteNote',
    'deleteDiagramNotes',
    'updateDiagramFilter',
    'deleteDiagramFilter',
];

function extractDiagramId(
    prop: keyof StorageContext,
    args: unknown[]
): string | undefined {
    const head = args[0];
    if (head === undefined || head === null) {
        return undefined;
    }
    switch (prop) {
        case 'addDiagram':
            return (head as { diagram: Diagram }).diagram?.id;
        case 'updateDiagram':
            return (head as { id: string }).id;
        case 'deleteDiagram':
            return head as string;
        case 'deleteDiagramTables':
        case 'deleteDiagramRelationships':
        case 'deleteDiagramDependencies':
        case 'deleteDiagramAreas':
        case 'deleteDiagramCustomTypes':
        case 'deleteDiagramNotes':
        case 'getDiagramFilter':
        case 'deleteDiagramFilter':
        case 'updateDiagramFilter':
            return head as string;
        default:
            if (typeof head === 'object' && 'diagramId' in head) {
                return (head as { diagramId: string }).diagramId;
            }
            return undefined;
    }
}

async function pushDiagramSnapshot(params: {
    inner: StorageContext;
    supabase: NonNullable<ReturnType<typeof getSupabaseBrowserClient>>;
    orgId: string;
    userId: string;
    diagramId: string;
}): Promise<void> {
    const { inner, supabase, orgId, userId, diagramId } = params;
    const full = await inner.getDiagram(diagramId, {
        includeTables: true,
        includeRelationships: true,
        includeDependencies: true,
        includeAreas: true,
        includeCustomTypes: true,
        includeNotes: true,
    });
    if (!full) {
        return;
    }
    const snapshot = diagramToSnapshot(full);
    const { error } = await supabase.from('chartdb_diagrams').upsert(
        {
            id: full.id,
            org_id: orgId,
            name: full.name,
            snapshot,
            created_at: full.createdAt.toISOString(),
            updated_at: full.updatedAt.toISOString(),
            created_by: userId,
        },
        { onConflict: 'id' }
    );
    if (error) {
        console.error('chartdb_diagrams upsert', error);
    }
}

export function useCloudBackedStorage(
    innerRef: MutableRefObject<StorageContext>
): StorageContext {
    const { session, orgId, ready } = useSupabaseAuth();
    const supabase = getSupabaseBrowserClient();
    const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
        new Map()
    );

    const cloudActive =
        isSupabaseConfigured() &&
        ready &&
        session !== null &&
        orgId !== null &&
        supabase !== null;

    return useMemo(() => {
        const inner = () => innerRef.current;

        const schedulePush = (diagramId: string | undefined) => {
            if (!cloudActive || !diagramId || !session || !orgId || !supabase) {
                return;
            }
            const timers = timersRef.current;
            const prev = timers.get(diagramId);
            if (prev) {
                clearTimeout(prev);
            }
            timers.set(
                diagramId,
                setTimeout(() => {
                    timers.delete(diagramId);
                    void pushDiagramSnapshot({
                        inner: inner(),
                        supabase,
                        orgId,
                        userId: session.user.id,
                        diagramId,
                    });
                }, DEBOUNCE_MS)
            );
        };

        const flushPush = async (diagramId: string | undefined) => {
            if (!cloudActive || !diagramId || !session || !orgId || !supabase) {
                return;
            }
            const timers = timersRef.current;
            const prev = timers.get(diagramId);
            if (prev) {
                clearTimeout(prev);
                timers.delete(diagramId);
            }
            await pushDiagramSnapshot({
                inner: inner(),
                supabase,
                orgId,
                userId: session.user.id,
                diagramId,
            });
        };

        const remoteListDiagrams: StorageContext['listDiagrams'] = async (
            ...args: ListArgs
        ) => {
            const options = args[0] ?? {};
            if (!cloudActive || !orgId || !supabase) {
                return inner().listDiagrams(...args);
            }
            const { data, error } = await supabase
                .from('chartdb_diagrams')
                .select('id,name,snapshot,created_at,updated_at,org_id')
                .eq('org_id', orgId)
                .order('updated_at', { ascending: false });
            if (error) {
                console.error('chartdb_diagrams list', error);
                return inner().listDiagrams(...args);
            }
            return (data ?? []).map((row) =>
                snapshotRowToDiagram(
                    {
                        id: row.id,
                        name: row.name,
                        snapshot: row.snapshot,
                        created_at: row.created_at,
                        updated_at: row.updated_at,
                    },
                    options
                )
            );
        };

        const remoteHydrateIfNeeded: StorageContext['getDiagram'] = async (
            ...args: GetDiagramArgs
        ) => {
            const [id, options = {}] = args;
            if (!cloudActive || !orgId || !supabase) {
                return inner().getDiagram(...args);
            }

            const { data: row, error } = await supabase
                .from('chartdb_diagrams')
                .select('id,name,snapshot,created_at,updated_at')
                .eq('id', id)
                .eq('org_id', orgId)
                .maybeSingle();

            if (error) {
                console.error('chartdb_diagrams get', error);
                return inner().getDiagram(...args);
            }

            const local = await inner().getDiagram(id, options);
            const remoteUpdated = row ? new Date(row.updated_at).getTime() : 0;
            const localUpdated = local?.updatedAt.getTime() ?? 0;

            const localFull =
                (await inner().getDiagram(id, fullDiagramLoadOptions)) ?? local;
            const remoteDiagram = row
                ? snapshotRowToDiagram(
                      {
                          id: row.id,
                          name: row.name,
                          snapshot: row.snapshot,
                          created_at: row.created_at,
                          updated_at: row.updated_at,
                      },
                      fullDiagramLoadOptions
                  )
                : null;

            const localFields = totalDiagramFieldCount(localFull);
            const remoteFields = totalDiagramFieldCount(
                remoteDiagram ?? undefined
            );

            // Never clobber a hydrated local diagram with an empty remote snapshot
            // (e.g. clock skew or a stale row written before columns existed in the app).
            const remoteWouldWipeLocalColumns =
                !!localFull && localFields > 0 && remoteFields === 0;

            const remoteIsStrictlyNewerThanLocal = remoteUpdated > localUpdated;

            if (
                row &&
                remoteDiagram &&
                !remoteWouldWipeLocalColumns &&
                (!local || remoteIsStrictlyNewerThanLocal)
            ) {
                await inner()
                    .deleteDiagram(id)
                    .catch(() => undefined);
                await inner().addDiagram({ diagram: remoteDiagram });
            }

            return inner().getDiagram(...args);
        };

        const remoteDeleteDiagram: StorageContext['deleteDiagram'] = async (
            id: string
        ) => {
            await inner().deleteDiagram(id);
            if (!cloudActive || !orgId || !supabase) {
                return;
            }
            timersRef.current.delete(id);
            const { error } = await supabase
                .from('chartdb_diagrams')
                .delete()
                .eq('id', id)
                .eq('org_id', orgId);
            if (error) {
                console.error('chartdb_diagrams delete', error);
            }
        };

        const remoteAddDiagram: StorageContext['addDiagram'] = async (
            params
        ) => {
            await inner().addDiagram(params);
            await flushPush(params.diagram.id);
        };

        return new Proxy(storageInitialValue, {
            get(_t, prop: keyof StorageContext) {
                const target = inner();
                if (prop === 'listDiagrams') {
                    return remoteListDiagrams;
                }
                if (prop === 'getDiagram') {
                    return remoteHydrateIfNeeded;
                }
                if (prop === 'deleteDiagram') {
                    return remoteDeleteDiagram;
                }
                if (prop === 'addDiagram') {
                    return remoteAddDiagram;
                }

                const val = target[prop];
                if (typeof val !== 'function') {
                    return val;
                }

                return (...args: unknown[]) => {
                    const result = (
                        val as (...a: unknown[]) => unknown | Promise<unknown>
                    ).apply(target, args as never);
                    const done = (r: unknown) => {
                        if (cloudActive && MUTATING_KEYS.includes(prop)) {
                            schedulePush(extractDiagramId(prop, args));
                        }
                        return r;
                    };
                    if (result instanceof Promise) {
                        return result.then(done);
                    }
                    return done(result);
                };
            },
        }) as StorageContext;
    }, [cloudActive, orgId, session, supabase, innerRef]);
}
