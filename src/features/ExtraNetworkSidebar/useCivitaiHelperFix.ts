import { useEffect } from 'react';

import civitaiHelperFix from '@/scripts/civitaiHelperFix';

export const useCivitaiHelperFix = () => {
  useEffect(() => civitaiHelperFix(), []);
};
