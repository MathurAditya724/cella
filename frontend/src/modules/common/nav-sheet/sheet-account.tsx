import { Link } from '@tanstack/react-router';
import { CircleUserRound, LogOut, type LucideProps, UserCog, Wrench } from 'lucide-react';
import type React from 'react';
import { useTranslation } from 'react-i18next';

import { useEffect, useRef } from 'react';
import { cn, getColorClass } from '~/lib/utils';
import { AppFooter } from '~/modules/common/app-footer';
import { AvatarWrap } from '~/modules/common/avatar-wrap';
import { buttonVariants } from '~/modules/ui/button';
import { useUserStore } from '~/store/user';

type AccountButtonProps = {
  lucide: React.ElementType<LucideProps>;
  label: string;
  id: string;
  action: string;
};

// Create a button for each account action
const AccountButton: React.FC<AccountButtonProps> = ({ lucide: Icon, label, id, action }) => {
  const btnClass = `${id === 'btn-signout' && 'text-red-600'} hover:bg-accent/50 w-full justify-start text-left focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2`;

  return (
    <Link id={id} to={action} className={cn(buttonVariants({ variant: 'ghost', size: 'lg' }), btnClass)}>
      <Icon className="mr-2 h-4 w-4" aria-hidden="true" />
      {label}
    </Link>
  );
};

export const SheetAccount = () => {
  const { t } = useTranslation();
  const { user } = useUserStore();

  const isSystemAdmin = user.role === 'admin';
  const buttonWrapper = useRef<HTMLDivElement | null>(null);
  const bgClass = user.bannerUrl ? 'bg-background' : getColorClass(user.id);
  const bannerClass = `relative transition-all duration-300 hover:bg-opacity-50 hover:-mx-8 -mx-4 -mt-4 bg-cover bg-center h-24 ${bgClass} bg-opacity-80`;

  useEffect(() => {
    const firstRow = buttonWrapper.current?.querySelector('#btn-profile') as HTMLElement;
    firstRow?.focus();
  }, []);

  return (
    <div ref={buttonWrapper} className="flex flex-col gap-4 min-h-[calc(100vh-2rem)]">
      <Link id="account" to="/user/$idOrSlug" params={{ idOrSlug: user.slug }} className="w-full relative">
        <div className={bannerClass} style={user.bannerUrl ? { backgroundImage: `url(${user.bannerUrl})` } : {}}>
          <AvatarWrap
            className="h-16 w-16 absolute top-4 text-2xl left-[50%] -ml-8 border-bg border-2 rounded-full"
            type="user"
            id={user.id}
            name={user.name}
            url={user.thumbnailUrl}
          />
        </div>
      </Link>

      <div className="flex flex-col gap-1 max-sm:mt-4">
        <AccountButton lucide={CircleUserRound} id="btn-profile" label={t('common:view_profile')} action={`/user/${user.slug}`} />
        <AccountButton lucide={UserCog} id="btn-account" label={t('common:settings')} action="/user/settings" />
        {isSystemAdmin && <AccountButton lucide={Wrench} id="btn-system" label={t('common:system_panel')} action="/system/users" />}
        <AccountButton lucide={LogOut} id="btn-signout" label={t('common:sign_out')} action="/sign-out" />
      </div>

      <div className="grow border-b border-dashed" />

      <AppFooter className="items-center" />
    </div>
  );
};
