import { ComponentType } from 'react';
import {
    Network,
    FileCode,
    Settings,
    Wand2,
    ShieldCheck,
    FolderOpen,
    Save,
    Minimize2,
    HelpCircle,
    Microscope
} from 'lucide-react';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onOpen?: () => void;
    onSave?: () => void;
    onMinify?: () => void;
}

export const Sidebar = ({ activeTab, setActiveTab, onOpen, onSave, onMinify }: SidebarProps) => {
    const NavItem = ({ id, Icon, label, onClick }: { id?: string, Icon: ComponentType<any>, label: string, onClick?: () => void }) => (
        <button
            onClick={onClick || (() => id && setActiveTab(id))}
            className={`p-3 rounded-xl transition-all mb-2 tooltip-trigger group relative
          ${activeTab === id ? 'bg-primary text-background' : 'text-muted hover:text-text hover:bg-muted/10'}
        `}
            title={label}
        >
            <Icon size={24} />
            <span className="absolute left-14 bg-surface px-2 py-1 rounded text-xs text-text border border-border opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                {label}
            </span>
        </button>
    );

    return (
        <div className="w-20 h-full bg-[#16161e]/80 backdrop-blur-xl border-r border-border flex flex-col items-center py-6 z-10">
            <div className="mb-6 flex flex-col gap-2 items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center font-bold text-background mb-4">
                    JM
                </div>
                {onOpen && <NavItem Icon={FolderOpen} label="Open File" onClick={onOpen} />}
                {onSave && <NavItem Icon={Save} label="Save File" onClick={onSave} />}
                {onMinify && <NavItem Icon={Minimize2} label="Minify/Compact" onClick={onMinify} />}
                <div className="w-8 h-[1px] bg-border my-2" />
            </div>

            <NavItem id="visualizer" Icon={Network} label="Visualizer" />
            <NavItem id="codegen" Icon={FileCode} label="Code Generation" />
            <NavItem id="converter" Icon={Wand2} label="Converter" />
            <NavItem id="schema" Icon={Microscope} label="Schema Tools" />
            <NavItem id="tools" Icon={ShieldCheck} label="Tools (jq, JWT)" />

            <div className="mt-auto flex flex-col items-center">
                <NavItem id="help" Icon={HelpCircle} label="Help & Shortcuts" />
                <NavItem id="settings" Icon={Settings} label="Settings" />
            </div>
        </div>
    );
};
