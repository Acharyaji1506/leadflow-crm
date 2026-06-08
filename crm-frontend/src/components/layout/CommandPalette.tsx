'use client';
import { useEffect, useState, useCallback } from 'react';
import { Command } from 'cmdk';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, Kanban, ClipboardList, Plus,
  Search, Moon, Sun, ArrowRight,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Lead } from '@/types';
import { leadsApi } from '@/services/api';
import { StatusBadge } from '@/components/common/StatusBadge';

interface CommandPaletteProps {
  onAddLead: () => void;
}

export function CommandPalette({ onAddLead }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Lead[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // Ctrl+K / Cmd+K toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Live search
  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { leads } = await leadsApi.getAll({ search, limit: 5 });
        setSearchResults(leads);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const runCommand = useCallback((fn: () => void) => {
    setOpen(false);
    setSearch('');
    fn();
  }, []);

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'Leads', icon: Users, path: '/leads' },
    { label: 'Kanban Board', icon: Kanban, path: '/kanban' },
    { label: 'Audit Logs', icon: ClipboardList, path: '/audit-logs' },
  ];

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            />

            {/* Palette */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -8 }}
              transition={{ duration: 0.15 }}
              className="fixed left-1/2 top-[15%] -translate-x-1/2 w-full max-w-lg z-[101]"
            >
              <Command
                className="bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
                shouldFilter={false}
              >
                {/* Input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                  <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                  <Command.Input
                    value={search}
                    onValueChange={setSearch}
                    placeholder="Search leads, navigate, actions..."
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground text-foreground"
                    autoFocus
                  />
                  <kbd className="text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5">ESC</kbd>
                </div>

                {/* Results */}
                <Command.List className="max-h-80 overflow-y-auto p-2">
                  <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                    No results found.
                  </Command.Empty>

                  {/* Lead search results */}
                  {search.trim() && (
                    <Command.Group heading={
                      <span className="text-xs font-semibold text-muted-foreground px-2 py-1.5 block uppercase tracking-wider">
                        {isSearching ? 'Searching...' : `Leads (${searchResults.length})`}
                      </span>
                    }>
                      {searchResults.map((lead) => (
                        <Command.Item
                          key={lead._id}
                          value={lead._id}
                          onSelect={() => runCommand(() => router.push(`/leads?highlight=${lead._id}`))}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-muted transition-colors text-sm"
                        >
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                            {lead.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{lead.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{lead.company}</p>
                          </div>
                          <StatusBadge status={lead.status} />
                        </Command.Item>
                      ))}
                    </Command.Group>
                  )}

                  {/* Actions */}
                  <Command.Group heading={
                    <span className="text-xs font-semibold text-muted-foreground px-2 py-1.5 block uppercase tracking-wider">Actions</span>
                  }>
                    <Command.Item
                      value="add-lead"
                      onSelect={() => runCommand(onAddLead)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-muted transition-colors text-sm"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
                        <Plus className="w-4 h-4 text-emerald-600" />
                      </div>
                      <span className="text-foreground">Add New Lead</span>
                    </Command.Item>

                    <Command.Item
                      value="toggle-theme"
                      onSelect={() => runCommand(() => setTheme(theme === 'dark' ? 'light' : 'dark'))}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-muted transition-colors text-sm"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center">
                        {theme === 'dark'
                          ? <Sun className="w-4 h-4 text-amber-600" />
                          : <Moon className="w-4 h-4 text-amber-600" />}
                      </div>
                      <span className="text-foreground">Toggle {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
                    </Command.Item>
                  </Command.Group>

                  {/* Navigation */}
                  <Command.Group heading={
                    <span className="text-xs font-semibold text-muted-foreground px-2 py-1.5 block uppercase tracking-wider">Navigate</span>
                  }>
                    {navItems.map((item) => (
                      <Command.Item
                        key={item.path}
                        value={`navigate-${item.label.toLowerCase()}`}
                        onSelect={() => runCommand(() => router.push(item.path))}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-muted transition-colors text-sm"
                      >
                        <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                          <item.icon className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <span className="text-foreground flex-1">Go to {item.label}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                      </Command.Item>
                    ))}
                  </Command.Group>
                </Command.List>

                {/* Footer */}
                <div className="px-4 py-2 border-t border-border flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <kbd className="border border-border rounded px-1 py-0.5">↑</kbd>
                    <kbd className="border border-border rounded px-1 py-0.5">↓</kbd>
                    navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="border border-border rounded px-1 py-0.5">↵</kbd>
                    select
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="border border-border rounded px-1 py-0.5">ESC</kbd>
                    close
                  </span>
                </div>
              </Command>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
