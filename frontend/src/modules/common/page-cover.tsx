import type { Entity } from 'backend/types/common';
import { Upload } from 'lucide-react';
import { Suspense, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { lazyWithPreload } from 'react-lazy-with-preload';
import { dispatchCustomEvent } from '~/lib/custom-events';
import { getColorClass } from '~/lib/utils';
import { dialog } from '~/modules/common/dialoger/state';
import { Button } from '~/modules/ui/button';
import { UploadType } from '~/types/common';

// Lazy load the upload component
const UploadUppy = lazyWithPreload(() => import('~/modules/common/upload/upload-uppy'));

export interface PageCoverProps {
  id: string;
  type: Entity;
  canUpdate: boolean;
  url?: string | null;
}

const PageCover = memo(({ type, id, canUpdate, url }: PageCoverProps) => {
  const { t } = useTranslation();

  const [coverUrl, setCoverUrl] = useState(url);

  const bannerHeight = url ? 'h-[20vw] min-h-40 sm:min-w-52' : 'h-32'; // : 'h-14';
  const bannerClass = url ? 'bg-background' : getColorClass(id);

  const setUrl = (bannerUrl: string) => {
    setCoverUrl(bannerUrl);
    dispatchCustomEvent('updateEntityCover', { bannerUrl, entity: type });
  };

  // Open the upload dialog
  const openUploadDialog = () => {
    dialog(
      <Suspense>
        <UploadUppy
          isPublic={true}
          organizationId={id}
          uploadType={UploadType.Organization}
          uppyOptions={{
            restrictions: {
              maxFileSize: 10 * 1024 * 1024, // 10MB
              maxNumberOfFiles: 1,
              allowedFileTypes: ['.jpg', '.jpeg', '.png'],
              minFileSize: null,
              maxTotalFileSize: 10 * 1024 * 1024, // 100MB
              minNumberOfFiles: null,
              requiredMetaFields: [],
            },
          }}
          plugins={['webcam', 'image-editor']}
          imageMode="cover"
          callback={(result) => {
            const url = result[0].url;
            if (url) setUrl(url);
            dialog.remove(true, 'page-cover');
          }}
        />
      </Suspense>,
      {
        id: 'page-cover',
        drawerOnMobile: false,
        title: t('common:upload_cover'),
        className: 'md:max-w-xl',
      },
    );
  };
  return (
    <div
      className={`relative bg-cover bg-muted bg-center ${bannerHeight} ${bannerClass}`}
      style={coverUrl ? { backgroundImage: `url(${coverUrl})` } : {}}
    >
      {canUpdate && (
        <Button
          variant="secondary"
          size="sm"
          className="absolute top-3 right-3 opacity-50 hover:opacity-80 hover:bg-secondary"
          onClick={openUploadDialog}
          onMouseOver={() => UploadUppy.preload()}
        >
          <Upload size={16} />
          <span className="ml-1">{t('common:upload_cover')}</span>
        </Button>
      )}
    </div>
  );
});

export { PageCover };
