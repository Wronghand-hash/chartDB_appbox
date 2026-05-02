import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { sqlImportToDiagram } from '@/lib/data/sql-import';
import { DatabaseType } from '@/lib/domain/database-type';
import { isMySQLFormat } from '../../mysql/mysql';

const ILLUSIVE_FIXTURE = join(process.cwd(), 'illusive-apparel(7).sql');

/** Minimal reproduction of dbdiagram-style: backticks + PostgreSQL types */
const BACKTICK_PG_SNIPPET = `
CREATE TABLE \`users\` (
  \`id\` uuid PRIMARY KEY,
  \`email\` text,
  \`last_sign_in\` timestamp
);

CREATE TABLE \`automation_runs\` (
  \`id\` uuid PRIMARY KEY,
  \`automation_id\` uuid,
  \`payload\` jsonb,
  \`created_at\` datetime
);
`;

describe('PostgreSQL DDL with MySQL-style backticks', () => {
    it('does not classify snippet as MySQL when jsonb / uuid are present', () => {
        expect(isMySQLFormat(BACKTICK_PG_SNIPPET)).toBe(false);
    });

    it('parses columns when importing as GENERIC (auto-detect → PostgreSQL)', async () => {
        const diagram = await sqlImportToDiagram({
            sqlContent: BACKTICK_PG_SNIPPET,
            sourceDatabaseType: DatabaseType.GENERIC,
            targetDatabaseType: DatabaseType.POSTGRESQL,
        });

        expect(diagram.tables?.length).toBe(2);
        const users = diagram.tables?.find((t) => t.name === 'users');
        expect(users?.fields?.length).toBeGreaterThanOrEqual(3);
        const runs = diagram.tables?.find((t) => t.name === 'automation_runs');
        expect(runs?.fields?.length).toBeGreaterThanOrEqual(4);
    });

    it.skipIf(!existsSync(ILLUSIVE_FIXTURE))(
        'parses illusive-apparel fixture when checked into workspace',
        async () => {
            const sql = readFileSync(ILLUSIVE_FIXTURE, 'utf-8');
            const diagram = await sqlImportToDiagram({
                sqlContent: sql,
                sourceDatabaseType: DatabaseType.GENERIC,
                targetDatabaseType: DatabaseType.POSTGRESQL,
            });
            expect(diagram.tables?.length).toBeGreaterThan(40);
            const users = diagram.tables?.find((t) => t.name === 'users');
            expect(users?.fields?.length).toBeGreaterThanOrEqual(2);
        }
    );
});
