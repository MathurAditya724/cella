import { config } from 'config';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Down levels are specific categories of alerts for maintenance (503) or offline (no connection) status
type downLevels = 'maintenance' | 'offline' | null;

interface AlertState {
  alertsSeen: string[];
  downAlert: downLevels;
  setAlertSeen: (alertSeen: string) => void;
  resetAlertSeen: (alertSeen: string[]) => void;
  setDownAlert: (downLevel: downLevels) => void;
  clearAlertStore: () => void;
}

const initStore = {
  downAlert: config.maintenance ? 'maintenance' : (null as downLevels),
  alertsSeen: [] as string[],
};

export const useAlertStore = create<AlertState>()(
  devtools(
    immer(
      persist(
        (set) => ({
          ...initStore,
          setAlertSeen: (alertSeen) => {
            set((state) => {
              state.alertsSeen.push(alertSeen);
            });
          },
          setDownAlert: (downLevel) => {
            set((state) => {
              state.downAlert = downLevel;
            });
          },
          resetAlertSeen: (alertsSeen) => {
            set((state) => {
              state.alertsSeen = alertsSeen;
            });
          },
          clearAlertStore: () => set((state) => ({ ...state, ...initStore }), true),
        }),
        {
          version: 1,
          name: `${config.slug}-alerts-seen`,
          partialize: (state) => ({
            alertsSeen: state.alertsSeen,
          }),
          storage: createJSONStorage(() => localStorage),
        },
      ),
    ),
  ),
);
