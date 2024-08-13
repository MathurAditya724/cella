import { Check } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AvatarWrap } from '~/modules/common/avatar-wrap';
import { dropdowner } from '~/modules/common/dropdowner/state';
import { Kbd } from '~/modules/common/kbd.tsx';
import { useWorkspaceStore } from '~/store/workspace.ts';
import type { User } from '~/types/index.ts';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '~/modules/ui/command.tsx';
import { inNumbersArray } from './helpers.ts';
import { updateTask } from '~/api/tasks.ts';
import { dispatchCustomEvent } from '~/lib/custom-events.ts';

type AssignableMember = Omit<User, 'counts'>;

interface AssignMembersProps {
  value: AssignableMember[];
  projectId: string;
  triggerWidth?: number;
  creationValueChange?: (users: AssignableMember[]) => void;
}

const AssignMembers = ({ projectId, value, creationValueChange, triggerWidth = 240 }: AssignMembersProps) => {
  const { t } = useTranslation();
  const { focusedTaskId, projects } = useWorkspaceStore();
  const [selectedMembers, setSelectedMembers] = useState<AssignableMember[]>(value);
  const [searchValue, setSearchValue] = useState('');
  const [showAll, setShowAll] = useState(false);

  const currentProject = projects.find((p) => p.id === projectId);
  const members = currentProject?.members || [];
  const sortedMembers = [...members].sort((a, b) => {
    const aSelected = selectedMembers.some((user) => user.id === a.id) ? 1 : 0;
    const bSelected = selectedMembers.some((user) => user.id === b.id) ? 1 : 0;
    return bSelected - aSelected;
  });

  const showedMembers = showAll ? sortedMembers : sortedMembers.slice(0, 6);
  const isSearching = searchValue.length > 0;

  const changeAssignedTo = async (members: AssignableMember[]) => {
    if (!focusedTaskId) return;
    const updatedTask = await updateTask(
      focusedTaskId,
      'assignedTo',
      members.map((user) => user.id),
    );
    dispatchCustomEvent('taskTableCRUD', { array: [updatedTask], action: 'update' });
    dispatchCustomEvent('taskCRUD', { array: [updatedTask], action: 'update' });
  };

  const handleSelectClick = (id: string) => {
    if (!id) return;
    setSearchValue('');
    dropdowner.remove();
    const existingUser = selectedMembers.find((user) => user.id === id);
    if (existingUser) {
      const updatedList = selectedMembers.filter((user) => user.id !== id);
      setSelectedMembers(updatedList);
      if (creationValueChange) return creationValueChange(updatedList);
      return changeAssignedTo(updatedList);
    }
    const newUser = members.find((m) => m.id === id);
    if (newUser) {
      const updatedList = [...selectedMembers, newUser];
      setSelectedMembers(updatedList);
      if (creationValueChange) return creationValueChange(updatedList);
      changeAssignedTo(updatedList);
      return;
    }
  };

  return (
    <Command className="relative rounded-lg max-h-[40vh] overflow-y-auto" style={{ width: `${triggerWidth}px` }}>
      <CommandInput
        autoFocus={true}
        value={searchValue}
        onValueChange={(searchValue) => {
          // If the user types a number, select status like useHotkeys
          if (!showAll && inNumbersArray(6, searchValue)) return handleSelectClick(members[Number.parseInt(searchValue) - 1]?.id);
          setSearchValue(searchValue);
        }}
        clearValue={setSearchValue}
        wrapClassName="max-sm:hidden"
        className="leading-normal"
        placeholder={t('common:placeholder.assign')}
      />
      {!isSearching && <Kbd value="A" className="max-sm:hidden absolute top-3 right-2.5" />}
      <CommandList>
        {!!searchValue.length && (
          <CommandEmpty className="flex justify-center items-center p-2 text-sm">
            {t('common:no_resource_found', { resource: t('common:members').toLowerCase() })}
          </CommandEmpty>
        )}
        {sortedMembers && (
          <CommandGroup>
            {showedMembers.map((user, index) => (
              <CommandItem
                key={user.id}
                value={user.id}
                onSelect={(id) => {
                  handleSelectClick(id);
                  dropdowner.remove();
                  setSearchValue('');
                }}
                className="group rounded-md flex justify-between items-center w-full leading-normal"
              >
                <div className="flex items-center gap-3">
                  <AvatarWrap type="user" id={user.id} name={user.name} url={user.thumbnailUrl} className="h-6 w-6 text-xs" />
                  <span>{user.name}</span>
                </div>

                <div className="flex items-center">
                  {selectedMembers.some((u) => u.id === user.id) && <Check size={16} className="text-success" />}
                  {!isSearching && !showAll && <span className="max-sm:hidden text-xs opacity-50 ml-3 mr-1">{index + 1}</span>}
                </div>
              </CommandItem>
            ))}
            {sortedMembers.length > 5 && (
              <CommandItem className="flex items-center justify-center opacity-80 hover:opacity-100" onSelect={() => setShowAll(!showAll)}>
                <span className="text-xs">{showAll ? t('common:hide') : t('common:show_all')}</span>
              </CommandItem>
            )}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );
};

export default AssignMembers;
