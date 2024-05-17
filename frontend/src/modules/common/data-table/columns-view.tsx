import { SlidersHorizontal } from 'lucide-react';
import { type Dispatch, type SetStateAction, useMemo, useState } from 'react';
import type { ColumnOrColumnGroup as BaseColumnOrColumnGroup } from 'react-data-grid';
import { useTranslation } from 'react-i18next';
import { cn } from '~/lib/utils';
import { Badge } from '~/modules/ui/badge';
import { Button } from '~/modules/ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '~/modules/ui/dropdown-menu';
import { TooltipButton } from '../tooltip-button';

export type ColumnOrColumnGroup<TData> = BaseColumnOrColumnGroup<TData> & {
  key: string;
  visible?: boolean;
};

interface Props<TData> {
  columns: ColumnOrColumnGroup<TData>[];
  setColumns: Dispatch<SetStateAction<ColumnOrColumnGroup<TData>[]>>;
  className?: string;
}

const ColumnsView = <TData,>({ columns, setColumns, className = '' }: Props<TData>) => {
  const { t } = useTranslation();
  const [columnSearch, setColumnSearch] = useState('');

  const filteredColumns = useMemo(
    () =>
      columns.filter(
        (column) => typeof column.name === 'string' && column.name && column.name.toLocaleLowerCase().includes(columnSearch.toLocaleLowerCase()),
      ),
    [columns, columnSearch],
  );

  const height = useMemo(() => (filteredColumns.length > 5 ? 6 * 32 - 16 + 4 : filteredColumns.length * 32 + 8), [filteredColumns.length]);

  return (
    <DropdownMenu
      onOpenChange={() => {
        setColumnSearch('');
      }}
    >
      <TooltipButton toolTipContent={t('common:columns_view')}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className={cn('relative flex', className)}>
            {filteredColumns.some((column) => !column.visible) && <Badge className="absolute -right-1 -top-1 flex h-2 w-2 justify-center p-0" />}
            <SlidersHorizontal className="h-4 w-4" />
            <span className="ml-1 max-xl:hidden">{t('common:view')}</span>
          </Button>
        </DropdownMenuTrigger>
      </TooltipButton>
      <DropdownMenuContent align="end" className="min-w-[220px] pt-2" collisionPadding={16}>
        <div className="overflow-y-auto relative" style={{ height }}>
          {filteredColumns.map((column) => (
            <DropdownMenuCheckboxItem
              key={column.name as string}
              className="mx-1"
              checked={column.visible}
              onCheckedChange={() =>
                setColumns((columns) =>
                  columns.map((c) =>
                    c.name === column.name
                      ? {
                          ...c,
                          visible: !c.visible,
                        }
                      : c,
                  ),
                )
              }
              onSelect={(e) => e.preventDefault()}
            >
              {column.name}
            </DropdownMenuCheckboxItem>
          ))}
          <div className="sticky bottom-0 h-[8px] bg-gradient-to-t from-popover" />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ColumnsView;
