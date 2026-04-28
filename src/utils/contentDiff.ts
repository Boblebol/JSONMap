const normalizeContent = (content: string) => {
    try {
        return JSON.stringify(JSON.parse(content), null, 2);
    } catch {
        return content;
    }
};

export const createLineDiffPreview = (originalContent: string, currentContent: string) => {
    const original = normalizeContent(originalContent);
    const current = normalizeContent(currentContent);

    if (original === current) return 'No changes';

    const originalLines = original.split('\n');
    const currentLines = current.split('\n');
    const diffLines: string[] = [];
    const maxLines = Math.max(originalLines.length, currentLines.length);

    for (let index = 0; index < maxLines; index += 1) {
        const previousLine = originalLines[index];
        const nextLine = currentLines[index];

        if (previousLine === nextLine) continue;
        if (previousLine !== undefined) diffLines.push(`- ${previousLine}`);
        if (nextLine !== undefined) diffLines.push(`+ ${nextLine}`);
    }

    return diffLines.slice(0, 12).join('\n');
};
