import { useTranslation } from 'react-i18next';
import type { Organization } from '~/types';

import { Link } from '@tanstack/react-router';
import { Shield, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useBreakpoints } from '~/hooks/use-breakpoints';
import { dateShort } from '~/lib/utils';
import CheckboxColumn from '~/modules/common/data-table/checkbox-column';
import { AvatarWrap } from '../../common/avatar-wrap';
import type { ColumnOrColumnGroup } from '../../common/data-table/columns-view';
import HeaderCell from '../../common/data-table/header-cell';
import UpdateRow from './update-row';

export const useColumns = (callback: (organizations: Organization[], action: 'create' | 'update' | 'delete') => void) => {
  const { t } = useTranslation();
  const isMobile = useBreakpoints('max', 'sm');

  const mobileColumns: ColumnOrColumnGroup<Organization>[] = [
    CheckboxColumn,
    {
      key: 'name',
      name: t('common:name'),
      visible: true,
      sortable: true,
      renderHeaderCell: HeaderCell,
      renderCell: ({ row, tabIndex }) => (
        <Link
          to="/$idOrSlug/members"
          tabIndex={tabIndex}
          params={{ idOrSlug: row.slug }}
          className="flex space-x-2 items-center outline-0 ring-0 group"
        >
          <AvatarWrap type="ORGANIZATION" className="h-8 w-8" id={row.id} name={row.name} url={row.thumbnailUrl} />
          <span className="group-hover:underline underline-offset-4 truncate font-medium">{row.name || '-'}</span>
        </Link>
      ),
    },
    {
      key: 'edit',
      name: '',
      visible: true,
      width: 32,
      renderCell: ({ row, tabIndex }) => {
        if (row.counts.memberships.admins > 0 || row.counts.memberships.members > 0)
          return <UpdateRow organization={row} tabIndex={tabIndex} callback={callback} />;
      },
    },
  ];

  return useState<ColumnOrColumnGroup<Organization>[]>(
    isMobile
      ? mobileColumns
      : [
          ...mobileColumns,
          {
            key: 'role',
            name: t('common:your_role'),
            sortable: true,
            visible: true,
            renderHeaderCell: HeaderCell,
            renderCell: ({ row }) => (row.membership?.role ? t(row.membership.role.toLowerCase()) : '-'),
            width: 120,
          },
          {
            key: 'subscription',
            name: t('common:subscription'),
            sortable: false,
            visible: true,
            renderHeaderCell: HeaderCell,
            renderCell: () => '-',
            minWidth: 140,
          },
          {
            key: 'createdAt',
            name: t('common:created_at'),
            sortable: true,
            visible: true,
            renderHeaderCell: HeaderCell,
            renderCell: ({ row }) => dateShort(row.createdAt),
            minWidth: 180,
          },
          {
            key: 'memberCount',
            name: t('common:members'),
            sortable: false,
            visible: true,
            renderHeaderCell: HeaderCell,
            renderCell: ({ row }) => (
              <>
                <UserRound className="mr-2 opacity-50" size={16} />
                {row.counts.memberships.members}
              </>
            ),
            width: 140,
          },
          {
            key: 'adminCount',
            name: t('common:admins'),
            sortable: false,
            visible: true,
            renderHeaderCell: HeaderCell,
            renderCell: ({ row }) => (
              <>
                <Shield className="mr-2 opacity-50" size={16} />
                {row.counts.memberships.admins}
              </>
            ),
            width: 140,
          },
        ],
  );
};
