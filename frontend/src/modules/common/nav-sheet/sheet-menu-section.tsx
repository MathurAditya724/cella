import type React from 'react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { showToast } from '~/lib/taosts-show';
import { dialog } from '~/modules/common/dialoger/state';
import { MenuArchiveToggle } from '~/modules/common/nav-sheet/menu-archive-toggle';
import { MenuSectionSticky } from '~/modules/common/nav-sheet/menu-section-sticky';
import { SheetMenuItems } from '~/modules/common/nav-sheet/sheet-menu-items';
import { SheetMenuItemsOptions } from '~/modules/common/nav-sheet/sheet-menu-options';
import { useNavigationStore } from '~/store/navigation';
import type { ContextEntity, UserMenu, UserMenuItem } from '~/types/common';

interface MenuSectionProps {
  data: UserMenuItem[];
  sectionType: keyof UserMenu;
  sectionLabel: string;
  entityType: ContextEntity;
  createForm: ReactNode;
}

export const MenuSection = ({ data, sectionType, sectionLabel, entityType, createForm }: MenuSectionProps) => {
  const { t } = useTranslation();

  const [optionsView, setOptionsView] = useState(false);
  const [isArchivedVisible, setArchivedVisible] = useState(false);
  const { activeSections } = useNavigationStore();
  const isSectionVisible = activeSections?.[sectionType] !== undefined ? activeSections[sectionType] : true;
  const parentItemId = data.length > 0 ? data[0].parentId : '';

  const sectionRef = useRef<HTMLDivElement>(null);
  const archivedRef = useRef<HTMLDivElement>(null);

  const createDialog = () => {
    dialog(createForm, {
      className: 'md:max-w-2xl',
      id: `create-${entityType}`,
      title: t('common:create_resource', { resource: t(`common:${entityType}`).toLowerCase() }),
    });
  };

  const toggleOptionsView = () => {
    if (!optionsView) showToast(t('common:configure_menu.text'));
    setOptionsView(!optionsView);
  };

  const archiveToggleClick = () => {
    setArchivedVisible(!isArchivedVisible);
  };

  // Helper function to set or remove 'tabindex' attribute
  const updateTabIndex = (ref: React.RefObject<HTMLElement>, isVisible: boolean) => {
    if (!ref.current) return;

    const elements = ref.current.querySelectorAll<HTMLElement>('*');
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      if (isVisible) el.removeAttribute('tabindex');
      else el.setAttribute('tabindex', '-1');
    }
  };

  useEffect(() => {
    updateTabIndex(sectionRef, isSectionVisible);
  }, [sectionRef, isSectionVisible]);

  useEffect(() => {
    updateTabIndex(archivedRef, isArchivedVisible);
  }, [archivedRef, isArchivedVisible]);

  return (
    <>
      {!parentItemId && (
        <MenuSectionSticky
          data={data}
          sectionLabel={sectionLabel}
          sectionType={sectionType}
          optionsView={optionsView}
          isSectionVisible={isSectionVisible}
          toggleOptionsView={toggleOptionsView}
          createDialog={createDialog}
        />
      )}
      <div
        ref={sectionRef}
        className={`grid transition-[grid-template-rows] ${isSectionVisible ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'} ease-in-out duration-300`}
      >
        <ul className="overflow-hidden">
          {optionsView ? (
            <SheetMenuItemsOptions data={data} shownOption="unarchive" />
          ) : (
            <SheetMenuItems type={entityType} data={data} shownOption="unarchive" createDialog={createDialog} />
          )}
          {!!data.length && (
            <>
              <MenuArchiveToggle
                isSubmenu={typeof parentItemId === 'string'}
                archiveToggleClick={archiveToggleClick}
                inactiveCount={data.filter((i) => i.membership.archived).length}
                isArchivedVisible={isArchivedVisible}
              />
              <div
                ref={archivedRef}
                className={`grid transition-[grid-template-rows] ${
                  isArchivedVisible ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                } ease-in-out duration-300`}
              >
                <ul className="overflow-hidden">
                  {optionsView ? (
                    <SheetMenuItemsOptions data={data} shownOption="archived" />
                  ) : (
                    <SheetMenuItems type={entityType} data={data} createDialog={createDialog} shownOption="archived" />
                  )}
                </ul>
              </div>
            </>
          )}
        </ul>
      </div>
    </>
  );
};
