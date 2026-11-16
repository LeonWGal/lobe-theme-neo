import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { paginateNetworks } from '@/utils/networkPagination';

export const useNetworkPagination = () => {
  const { t } = useTranslation();
  useEffect(
    () =>
      paginateNetworks((typeof gradioApp === 'function' ? gradioApp() : null) || document, {
        all: t('sidebar.allFolders'),
        folder: t('sidebar.findFolder'),
        next: t('sidebar.nextPage'),
        openFolder: t('sidebar.showFolderContents'),
        previous: t('sidebar.previousPage'),
        toggleFolder: t('sidebar.toggleSubfolders'),
      }),
    [t],
  );
};
