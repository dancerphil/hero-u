/* eslint-disable max-lines */
import { createContext, useContext, useState, type ReactNode } from 'react';

export type Lang = 'en' | 'zh';

export const T = {
    en: {
        appTitle: 'Rules Manager',
        nav: {
            tools: 'AI Tools',
            versions: 'Versions',
            folders: 'Folders',
            sync: 'Sync',
            settings: 'Settings',
        },
        workflow: {
            scan: 'Scan',
            sync: 'Sync',
            overviewTitle: 'Overview',
            overviewDesc: 'Configure scan folders, instructions, and sync targets here.',
            resultTitle: 'Result',
            resultDesc: 'Scan and sync outputs are shown here.',
            scanFolders: 'Scan Folders',
            noProjectSync: 'No project sync record yet. Run Scan and add projects to sync.',
            scanResult: 'Scan Result',
            scanResultEmpty: 'Click Scan in the top-right corner to load projects.',
            syncResult: 'Sync Result',
            syncResultEmpty: 'Click Sync in the top-right corner to execute sync.',
            overwriteAndSync: 'Overwrite conflicts and sync',
        },
        common: {
            cancel: 'Cancel',
            save: 'Save',
            delete: 'Delete',
            remove: 'Remove',
            import: 'Import',
            enable: 'Enable',
            overwrite: 'Overwrite',
            view: 'View',
            hide: 'Hide',
            details: 'Details',
            collapse: 'Collapse',
        },
        tools: {
            title: 'AI Tools',
            toolsFound: (n: number) => `${n} tools found`,
            desc: 'Detected AI tools and their global instruction files.',
            detecting: 'Detecting tools...',
            installed: 'installed',
            notDetected: 'not detected',
            notFound: 'not found',
            noGlobal: 'No global instruction file. Project file:',
            noGlobalFile: 'No global file',
            fileNotFound: 'file not found',
            importTitle: 'Import as instructions',
            versionNamePlaceholder: 'Instruction set name (e.g. default, work)',
            importedAs: (name: string) => `Imported as "${name}"`,
            deleteGlobalConfirm: 'Delete this global instruction file?',
            openInFinder: 'Open in Finder',
        },
        rules: {
            title: 'Instructions',
            desc: 'Create and edit instruction sets.',
            newBtn: '+ New',
            ruleName: 'Instruction set name',
            noRules: 'No instructions yet',
            selectPrompt: 'Select an instruction set to edit.',
            createPrompt: 'Create an instruction set to get started, or import one from the Tools page.',
            contentPlaceholder: 'Enter instruction content (Markdown)...',
            updatedAt: (date: string) => `Updated ${date}`,
            deleteConfirm: 'Delete this instruction set?',
            loading: 'Loading instructions...',
        },
        folders: {
            title: 'Project Folders',
            desc: 'Scan local project folders for AI instruction files.',
            scanFoldersSectionTitle: 'Scan Folders',
            folderPlaceholder: '~/code',
            addFolder: 'Add Folder',
            noFolders: 'No folders added yet.',
            scanNow: 'Scan Now',
            scanning: 'Scanning...',
            projectsFound: (n: number) => `${n} Projects Found`,
            withRules: (n: number) => `${n} with instruction files`,
            hasRules: 'has instructions',
            inSync: 'in sync',
            addToSync: 'Add to Sync',
            removeFromSync: 'Remove from Sync',
            deleteRuleConfirm: 'Delete this instruction file?',
            importedAs: (name: string) => `Imported as "${name}"`,
        },
        sync: {
            title: 'Sync',
            desc: 'Distribute instructions to AI tools and projects. Add projects via the Folders page.',
            globalFiles: 'Global Rules',
            noTools: 'No AI tools detected. Install Claude, Cursor, or Windsurf to sync global files.',
            selectVersion: 'Select instruction...',
            projectFiles: (n: number) => `Project Rules (${n})`,
            syncNow: 'Sync Now',
            checking: 'Checking...',
            synced: (n: number) => `${n} synced`,
            skippedN: (n: number) => `, ${n} skipped`,
            failed: (n: number) => `, ${n} failed`,
            noTargets: 'No sync targets configured. Enable tools above and select instructions to sync.',
            conflictTitle: 'Conflicts Detected',
            conflictDesc: (n: number) => `${n} file(s) already exist with different content. Choose how to resolve each.`,
            currentFile: 'Current file',
            newVersion: 'New version',
            applyChoices: 'Apply choices',
        },
        settings: {
            title: 'Settings',
            desc: 'Configuration stored in ~/.hero-u/rules',
            storage: 'Storage',
            openFinder: 'Open in Finder',
            projectRecords: 'Project Sync Records',
            projectRecordsDesc: 'Remembered choices for each project discovered during scanning.',
            enabled: 'Enabled',
            disabled: 'Disabled',
            versionNone: 'instruction: none',
            scanFolders: 'Scan Folders',
            noFolders: 'No folders configured. Go to the Folders tab to add scan folders.',
            loading: 'Loading...',
        },
    },
    zh: {
        appTitle: '指令集管理',
        nav: {
            tools: 'AI 工具',
            versions: '版本',
            folders: '文件夹',
            sync: '同步',
            settings: '设置',
        },
        workflow: {
            scan: '扫描',
            sync: '同步',
            overviewTitle: 'Overview',
            overviewDesc: '在这里完成扫描目录、指令集与同步目标配置。',
            resultTitle: 'Result',
            resultDesc: '扫描与同步输出会展示在这里。',
            scanFolders: '扫描文件夹',
            noProjectSync: '暂无项目同步记录。请先执行扫描并将项目加入同步。',
            scanResult: '扫描结果',
            scanResultEmpty: '点击右上角「扫描」获取项目扫描结果。',
            syncResult: '同步结果',
            syncResultEmpty: '点击右上角「同步」执行同步。',
            overwriteAndSync: '覆盖冲突并同步',
        },
        common: {
            cancel: '取消',
            save: '保存',
            delete: '删除',
            remove: '移除',
            import: '导入',
            enable: '启用',
            overwrite: '覆盖',
            view: '查看',
            hide: '收起',
            details: '详情',
            collapse: '收起',
        },
        tools: {
            title: 'AI 工具',
            toolsFound: (n: number) => `找到 ${n} 个工具`,
            desc: '已检测到的 AI 工具及其全局指令文件。',
            detecting: '正在检测工具...',
            installed: '已安装',
            notDetected: '未检测到',
            notFound: '未找到',
            noGlobal: '无全局指令文件。项目文件：',
            noGlobalFile: '暂无全局文件',
            fileNotFound: '文件不存在',
            importTitle: '导入为指令集',
            versionNamePlaceholder: '指令集名称（如 default、work）',
            importedAs: (name: string) => `已导入为"${name}"`,
            deleteGlobalConfirm: '删除这个全局指令文件？',
            openInFinder: '在访达中打开',
        },
        rules: {
            title: '指令集',
            desc: '创建和编辑指令集。',
            newBtn: '+ 新建',
            ruleName: '指令集名称',
            noRules: '暂无指令集',
            selectPrompt: '选择一个指令集来编辑。',
            createPrompt: '创建一个指令集，或从 AI 工具页面导入。',
            contentPlaceholder: '输入指令内容（Markdown）...',
            updatedAt: (date: string) => `更新于 ${date}`,
            deleteConfirm: '删除此指令集？',
            loading: '正在加载指令集...',
        },
        folders: {
            title: '项目文件夹',
            desc: '扫描本地项目文件夹中的 AI 指令文件。',
            scanFoldersSectionTitle: '扫描文件夹',
            folderPlaceholder: '~/code',
            addFolder: '添加文件夹',
            noFolders: '尚未添加文件夹。',
            scanNow: '立即扫描',
            scanning: '扫描中...',
            projectsFound: (n: number) => `找到 ${n} 个项目`,
            withRules: (n: number) => `${n} 个含指令文件`,
            hasRules: '含指令',
            inSync: '已加入同步',
            addToSync: '加入同步',
            removeFromSync: '取消同步',
            deleteRuleConfirm: '删除此指令文件？',
            importedAs: (name: string) => `已导入为"${name}"`,
        },
        sync: {
            title: '同步',
            desc: '将指令集分发到 AI 工具和项目。在文件夹页面添加项目。',
            globalFiles: '全局指令',
            noTools: '未检测到 AI 工具。请安装 Claude、Cursor 或 Windsurf 以同步全局文件。',
            selectVersion: '选择指令...',
            projectFiles: (n: number) => `项目指令（${n}）`,
            syncNow: '立即同步',
            checking: '检查中...',
            synced: (n: number) => `已同步 ${n} 个`,
            skippedN: (n: number) => `，已跳过 ${n} 个`,
            failed: (n: number) => `，失败 ${n} 个`,
            noTargets: '未配置同步目标。请在上方启用工具并选择指令。',
            conflictTitle: '检测到冲突',
            conflictDesc: (n: number) => `${n} 个文件已有不同内容，请逐一选择处理方式。`,
            currentFile: '当前文件',
            newVersion: '新版本',
            applyChoices: '应用选择',
        },
        settings: {
            title: '设置',
            desc: '配置存储于 ~/.hero-u/rules',
            storage: '存储位置',
            openFinder: '在访达中打开',
            projectRecords: '项目同步记录',
            projectRecordsDesc: '已记住的各项目配置，来自扫描发现的项目。',
            enabled: '已启用',
            disabled: '已禁用',
            versionNone: '指令：无',
            scanFolders: '扫描文件夹',
            noFolders: '尚未配置文件夹。前往文件夹标签页添加。',
            loading: '加载中...',
        },
    },
} as const;

export type Translations = typeof T.en;

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
    lang: 'en',
    setLang: () => {},
});

export function I18nProvider({ children }: { children: ReactNode }) {
    const [lang, setLang] = useState<Lang>(() => {
        const stored = localStorage.getItem('hero-u-lang');
        if (stored === 'zh' || stored === 'en') {
            return stored;
        }
        return navigator.language.startsWith('zh') ? 'zh' : 'en';
    });
    const setLangAndStore = (l: Lang) => {
        setLang(l);
        localStorage.setItem('hero-u-lang', l);
    };
    return (
        <LangContext value={{ lang, setLang: setLangAndStore }}>
            {children}
        </LangContext>
    );
}

export function useT(): Translations {
    const { lang } = useContext(LangContext);
    return T[lang] as unknown as Translations;
}

export function useLang() {
    return useContext(LangContext);
}
