import { describe, expect, it } from 'vitest';
import sourceFixture from './__fixtures__/codegen-source.json';
import { generateCodeFromJson, type CodegenLanguage } from './codegen';

const sourceContent = JSON.stringify(sourceFixture);

const languageSnapshots: Array<[CodegenLanguage, string]> = [
    ['typescript', './__fixtures__/codegen/typescript.ts.snap'],
    ['python', './__fixtures__/codegen/python.py.snap'],
    ['pydantic', './__fixtures__/codegen/pydantic.py.snap'],
    ['go', './__fixtures__/codegen/go.go.snap'],
    ['rust', './__fixtures__/codegen/rust.rs.snap'],
];

describe('generateCodeFromJson', () => {
    it.each(languageSnapshots)('matches the stable %s fixture snapshot', async (language, snapshotPath) => {
        const generatedCode = await generateCodeFromJson(sourceContent, language);

        await expect(generatedCode).toMatchFileSnapshot(snapshotPath);
    });
});
