import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Github, Globe, Heart } from 'lucide-react';

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AboutModal = ({ isOpen, onClose }: AboutModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-background/80 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden"
                    >
                        <div className="absolute top-6 right-6 z-10">
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-muted/10 rounded-full transition-colors text-muted hover:text-text"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex flex-col md:flex-row h-full max-h-[80vh]">
                            {/* Left Side - Brand */}
                            <div className="w-full md:w-1/3 bg-gradient-to-br from-primary/20 to-secondary/20 p-8 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-border">
                                <div className="w-20 h-20 rounded-2xl overflow-hidden mb-6 shadow-2xl border border-primary/20">
                                    <img src="/logo.png" alt="JSONMap Logo" className="w-full h-full object-cover" />
                                </div>
                                <h2 className="text-2xl font-bold text-text mb-1">JSONMap</h2>
                                <p className="text-sm text-text/60 mb-6">Version 1.1.2</p>

                                <div className="flex gap-4">
                                    <a href="https://github.com/Boblebol/JSONMap" target="_blank" rel="noreferrer" className="p-2 bg-background/50 hover:bg-background rounded-xl transition-all border border-border">
                                        <Github size={18} />
                                    </a>
                                    <a href="https://alexandre-enouf.fr" target="_blank" rel="noreferrer" className="p-2 bg-background/50 hover:bg-background rounded-xl transition-all border border-border">
                                        <Globe size={18} />
                                    </a>
                                </div>
                            </div>

                            {/* Right Side - Content */}
                            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                                <section className="mb-8">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-4">What's New in v1.1.0</h3>
                                    <ul className="space-y-3">
                                        <li className="flex gap-3 text-sm">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                            <span><strong>New Identity:</strong> Sophisticated new logo and unified system icons.</span>
                                        </li>
                                        <li className="flex gap-3 text-sm">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                            <span><strong>Robust Core:</strong> Full test suite coverage for both UI and Rust backend.</span>
                                        </li>
                                        <li className="flex gap-3 text-sm">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                            <span><strong>Changelog:</strong> Easily track updates directly within the application.</span>
                                        </li>
                                    </ul>
                                </section>

                                <section className="mb-8">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-secondary mb-4">About the Project</h3>
                                    <p className="text-sm text-text/80 leading-relaxed mb-4">
                                        JSONMap is a native macOS visualizer designed for speed, security, and developer productivity.
                                        Built with Rust (Tauri) and React, it ensures that your sensitive data never leaves your machine.
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-muted">
                                        <span>Made with</span>
                                        <Heart size={12} className="text-red-500 fill-red-500" />
                                        <span>by Alexandre Enouf</span>
                                    </div>
                                </section>

                                <div className="mt-auto pt-6 border-t border-border flex justify-between items-center">
                                    <span className="text-xs text-muted">License: MIT</span>
                                    <button
                                        onClick={() => window.open('https://github.com/Boblebol/JSONMap/blob/main/CHANGELOG.md', '_blank')}
                                        className="text-xs text-primary hover:underline flex items-center gap-1"
                                    >
                                        Full Changelog <ExternalLink size={12} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
