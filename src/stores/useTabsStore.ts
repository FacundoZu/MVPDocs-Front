import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TabType = 'project' | 'document' | 'network' | 'unknown';

export interface Tab {
    id: string;
    path: string;
    title: string;
    type: TabType;
}

interface TabsState {
    tabs: Tab[];
    activeTabId: string | null;
    addTab: (tab: Omit<Tab, 'id'>) => string;
    updateTab: (id: string, updates: Partial<Tab>) => void;
    removeTab: (id: string) => void;
    setActiveTab: (id: string) => void;
}

export const useTabsStore = create<TabsState>()(
    persist(
        (set) => ({
            tabs: [],
            activeTabId: null,

            addTab: (tabData) => {
                const id = crypto.randomUUID();
                const newTab: Tab = { ...tabData, id };
                set((state) => ({
                    tabs: [...state.tabs, newTab],
                    activeTabId: id,
                }));
                return id;
            },

            updateTab: (id, updates) => set((state) => ({
                tabs: state.tabs.map((t) => (t.id === id ? { ...t, ...updates } : t)),
            })),

            removeTab: (id) => set((state) => {
                const filteredTabs = state.tabs.filter((t) => t.id !== id);
                let newActiveTabId = state.activeTabId;

                if (state.activeTabId === id) {
                    const closedIndex = state.tabs.findIndex((t) => t.id === id);
                    if (filteredTabs.length > 0) {
                        const newIndex = Math.max(0, closedIndex - 1);
                        newActiveTabId = filteredTabs[newIndex].id;
                    } else {
                        newActiveTabId = null;
                    }
                }

                return { tabs: filteredTabs, activeTabId: newActiveTabId };
            }),

            setActiveTab: (id) => set({ activeTabId: id }),
        }),
        {
            name: 'navigation-tabs-storage',
        }
    )
);
