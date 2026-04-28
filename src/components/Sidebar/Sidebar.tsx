import { ComponentType } from 'react';
import {
    Network,
    Settings,
    FolderOpen,
    Save,
    Minimize2,
    HelpCircle,
    Wrench
} from 'lucide-react';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onOpen?: () => void;
    onSave?: () => void;
    onMinify?: () => void;
    onLogoClick?: () => void;
    onDeveloperToolsToggle?: () => void;
    isDeveloperToolsActive?: boolean;
    hasUnsavedChanges?: boolean;
}

export const Sidebar = ({
    activeTab,
    setActiveTab,
    onOpen,
    onSave,
    onMinify,
    onLogoClick,
    onDeveloperToolsToggle,
    isDeveloperToolsActive = false,
    hasUnsavedChanges = false
}: SidebarProps) => {
    const NavItem = ({ id, Icon, label, onClick, highlight, active }: { id?: string, Icon: ComponentType<any>, label: string, onClick?: () => void, highlight?: boolean, active?: boolean }) => (
        <button
            onClick={onClick || (() => id && setActiveTab(id))}
            className={`p-3 rounded-xl transition-all mb-2 tooltip-trigger group relative
          ${(active ?? activeTab === id) ? 'bg-primary text-background' : 'text-muted hover:text-text hover:bg-muted/10'}
          ${highlight ? 'shadow-[0_0_15px_rgba(122,162,247,0.5)] border border-primary/50 text-primary bg-primary/10' : ''}
        `}
            title={label}
        >
            <Icon size={24} className={highlight ? 'animate-pulse' : ''} />
            <span className="absolute left-14 bg-surface px-2 py-1 rounded text-xs text-text border border-border opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                {label}
            </span>
        </button>
    );

    return (
        <div className="w-20 h-full bg-[#16161e]/80 backdrop-blur-xl border-r border-border flex flex-col items-center py-6 z-10">
            <div className="mb-6 flex flex-col gap-2 items-center">
                <button
                    onClick={onLogoClick}
                    className="w-10 h-10 rounded-lg overflow-hidden mb-4 shadow-lg border border-primary/20 hover:scale-105 transition-transform active:scale-95"
                >
                    <img src="/logo.png" alt="JSONMap Logo" className="w-full h-full object-cover" />
                </button>
                {onOpen && <NavItem Icon={FolderOpen} label="Open File" onClick={onOpen} />}
                {onSave && (
                    <NavItem
                        Icon={Save}
                        label={hasUnsavedChanges ? "Save Changes (Unsaved)" : "Save File"}
                        onClick={onSave}
                        highlight={hasUnsavedChanges}
                    />
                )}
                {onMinify && <NavItem Icon={Minimize2} label="Minify/Compact" onClick={onMinify} />}
                <div className="w-8 h-[1px] bg-border my-2" />
            </div>

            <NavItem id="visualizer" Icon={Network} label="Visualizer" />
            <NavItem
                Icon={Wrench}
                label="Developer Tools"
                onClick={onDeveloperToolsToggle}
                active={isDeveloperToolsActive}
            />

            <div className="mt-auto flex flex-col items-center">
                <NavItem id="help" Icon={HelpCircle} label="Help & Shortcuts" />
                <NavItem id="settings" Icon={Settings} label="Settings" />
            </div>
        </div>
    );
};
