import { invoke } from '@tauri-apps/api/core';

export type FileFormat = 'json' | 'yaml' | 'xml' | 'toml' | 'csv';

export const tauriApi = {
    parseContent: async (content: string, format: string): Promise<any> => {
        return await invoke('parse_content', { content, format });
    },

    convertFormat: async (content: string, sourceFormat: string, targetFormat: string): Promise<string> => {
        return await invoke('convert_format', { content, sourceFormat, targetFormat });
    },

    runJq: async (filter: string, json: any): Promise<any> => {
        return await invoke('run_jq', { filter, json });
    },

    runJsonPath: async (path: string, json: any): Promise<any> => {
        return await invoke('run_jsonpath', { path, json });
    },

    anonymizeData: async (json: any): Promise<any> => {
        return await invoke('anonymize_data', { json });
    },

    decodeJwt: async (token: string): Promise<any> => {
        return await invoke('decode_jwt', { token });
    },

    addRecentFile: async (path: string): Promise<void> => {
        return await invoke('add_recent_file', { path });
    },

    getRecentFiles: async (): Promise<string[]> => {
        return await invoke('get_recent_files');
    },

    getSetting: async (key: string): Promise<any> => {
        return await invoke('get_setting', { key });
    },

    setSetting: async (key: string, value: any): Promise<void> => {
        return await invoke('set_setting', { key, value });
    },

    showNotification: async (title: string, body: string): Promise<void> => {
        return await invoke('show_notification', { title, body });
    },

    fetchUrl: async (url: string): Promise<string> => {
        return await invoke('fetch_url', { url });
    },

    generateSchema: async (json: any): Promise<any> => {
        return await invoke('generate_schema', { json });
    },

    generateMockData: async (schema: any): Promise<any> => {
        return await invoke('generate_mock_data', { schema });
    },

    validateJsonSchema: async (json: any, schema: any): Promise<string[]> => {
        return await invoke('validate_json_schema', { json, schema });
    },

    openFile: async (): Promise<{ content: string; path: string; format: FileFormat } | null> => {
        if (!window.__TAURI__) return null;
        try {
            const { open } = await import('@tauri-apps/plugin-dialog');
            const { readTextFile } = await import('@tauri-apps/plugin-fs');

            const selected = await open({
                multiple: false,
                filters: [{
                    name: 'Supported Files',
                    extensions: ['json', 'yaml', 'yml', 'xml', 'toml', 'csv']
                }]
            });

            if (selected) {
                const path = selected as string; // in single mode it returns string or null
                const content = await readTextFile(path);
                const ext = path.split('.').pop()?.toLowerCase();
                let format: FileFormat = 'json';
                if (['yaml', 'yml'].includes(ext || '')) format = 'yaml';
                if (ext === 'xml') format = 'xml';
                if (ext === 'toml') format = 'toml';
                if (ext === 'csv') format = 'csv';

                return { content, path, format };
            }
            return null;
        } catch (e) {
            console.error("File open error:", e);
            throw e;
        }
    },

    saveFile: async (content: string, filename?: string): Promise<string | null> => {
        if (!window.__TAURI__) return null;
        try {
            const { save } = await import('@tauri-apps/plugin-dialog');
            const { writeTextFile } = await import('@tauri-apps/plugin-fs');

            const path = await save({
                defaultPath: filename || 'untitled.json',
                filters: [{
                    name: 'All Files',
                    extensions: ['json', 'yaml', 'yml', 'xml', 'toml', 'csv']
                }]
            });

            if (path) {
                await writeTextFile(path, content);
                return path;
            }
            return null;
        } catch (e) {
            console.error("File save error:", e);
            throw e;
        }
    },

    saveImage: async (dataUrl: string, format: 'png' | 'jpeg' | 'svg'): Promise<void> => {
        if (!window.__TAURI__) return;
        try {
            const { save } = await import('@tauri-apps/plugin-dialog');
            const { writeFile, writeTextFile } = await import('@tauri-apps/plugin-fs');

            const ext = format === 'jpeg' ? 'jpg' : format;
            const path = await save({
                defaultPath: `graph.${ext}`,
                filters: [{
                    name: `Image (${format.toUpperCase()})`,
                    extensions: [ext]
                }]
            });

            if (!path) return;

            if (format === 'svg') {
                const content = decodeURIComponent(dataUrl.replace(/data:image\/svg\+xml;charset=utf-8,/, ''));
                await writeTextFile(path, content);
            } else {
                const base64 = dataUrl.split(',')[1];
                const binaryString = atob(base64);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                await writeFile(path, bytes);
            }
        } catch (e) {
            console.error("Image save error:", e);
            throw e;
        }
    }
};
