import React from 'react';
import { useStore } from '../../services/store';
import { WifiOff, RefreshCw, CheckCircle2, X } from 'lucide-react';

export const OfflineSyncBanner: React.FC = () => {
  const { isOnline, isSyncing, pendingSyncCount, syncMessage, syncOfflineData, dismissSyncMessage } =
    useStore();

  if (isOnline && !syncMessage && pendingSyncCount === 0) {
    return null;
  }

  return (
    <div
      className={`sticky top-0 z-50 px-4 py-2 text-xs font-semibold flex items-center justify-between gap-3 shadow-sm transition-all ${
        !isOnline
          ? 'bg-amber-600 text-white'
          : isSyncing
          ? 'bg-[#14532D] text-white'
          : 'bg-emerald-700 text-white'
      }`}
    >
      <div className="flex items-center gap-2 truncate">
        {!isOnline ? (
          <WifiOff className="w-4 h-4 shrink-0 text-amber-100" />
        ) : isSyncing ? (
          <RefreshCw className="w-4 h-4 shrink-0 animate-spin text-emerald-200" />
        ) : (
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-200" />
        )}
        <span className="truncate">
          {!isOnline
            ? `Offline mode: Cache active · ${pendingSyncCount > 0 ? `${pendingSyncCount} changes pending sync` : 'Read-only catalog ready'}`
            : syncMessage || (pendingSyncCount > 0 ? `${pendingSyncCount} changes pending sync` : 'Data synced')}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {isOnline && pendingSyncCount > 0 && !isSyncing && (
          <button
            onClick={syncOfflineData}
            className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-[11px] font-bold uppercase transition-colors"
          >
            Sync Now
          </button>
        )}
        {syncMessage && (
          <button
            onClick={dismissSyncMessage}
            className="p-1 hover:bg-white/20 rounded-md transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
