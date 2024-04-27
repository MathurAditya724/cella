import { useEffect, useState } from 'react';
import { Button } from '~/modules/ui/button';
import { Check, UserX } from 'lucide-react';
import type { User } from '~/mocks/dataGeneration.ts';
import { CommandItem, CommandList, Command, CommandInput, CommandGroup } from '../ui/command.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover.tsx';
import { Kbd } from '../common/kbd.tsx';
import { AvatarWrap } from '~/modules/common/avatar-wrap';
import { AvatarGroup, AvatarGroupList, AvatarOverflowIndicator } from '~/modules/ui/avatar';
import { useTranslation } from 'react-i18next';
import { useHotkeys } from '~/hooks/use-hot-keys.ts';
import { useFormContext } from 'react-hook-form';

const defaultMembers = [
  { bio: 'poor advocate, photographer 👕', id: '9a4630c1-5036-4cdf-a521-c0dee7f48304', name: 'Alton Labadie', thumbnailUrl: null },
  { bio: 'agent advocate', id: 'e128c479-7618-477d-8f8f-9fb9b8e6587f', name: 'Jane Balistreri', thumbnailUrl: null },
  { bio: 'blogger, environmentalist', id: '41e8c32e-188e-4f9d-bb10-c90dfdc25e68', name: 'Karla Jacobson', thumbnailUrl: null },
  { bio: 'scientist', id: 'ae8e81ea-8880-439a-ac00-ef4c81d17177', name: 'Rudy Cole', thumbnailUrl: null },
  { bio: 'entrepreneur', id: 'cda6e97e-07a9-4b90-9b71-b5f6cd85c944', name: 'Leticia Grimes', thumbnailUrl: null },
];

interface AssignMembersProps {
  members?: User[];
  mode: 'create' | 'edit';
  changeAssignedTo?: (users: User[]) => void;
}

const AssignMembers = ({ members = defaultMembers, mode, changeAssignedTo }: AssignMembersProps) => {
  const { t } = useTranslation();
  const formValue = useFormContext?.()?.getValues('assignedTo');
  const [openPopover, setOpenPopover] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>(formValue || []);
  const [searchValue, setSearchValue] = useState('');
  const isSearching = searchValue.length > 0;

  const handleSelectClick = (name: string) => {
    if (!name) return;
    const existingUser = selectedUsers.find((user) => user.name === name);
    if (existingUser) {
      setSelectedUsers(selectedUsers.filter((user) => user.name !== name));
      return;
    }
    const newUser = members.find((user) => user.name === name);
    if (newUser) {
      setSelectedUsers([...selectedUsers, newUser]);
      return;
    }
  };

  // Open on key press
  useHotkeys([['a', () => setOpenPopover(true)]]);

  useEffect(() => {
    if (changeAssignedTo && selectedUsers.length > 0) changeAssignedTo(selectedUsers);
  }, [selectedUsers]);

  // Whenever the form value changes (also on reset), update the internal state
  useEffect(() => {
    setSelectedUsers(formValue || []);
  }, [formValue]);

  return (
    <Popover open={openPopover} onOpenChange={setOpenPopover}>
      <PopoverTrigger asChild>
        <Button
          aria-label="Assign"
          variant="ghost"
          size={mode === 'create' ? 'sm' : 'micro'}
          className={`flex justify-start font-light ${mode === 'create' ? 'w-full text-left border' : 'group-hover/task:opacity-100 opacity-70'}`}
        >
          {!selectedUsers.length && <UserX className="h-4 w-4 opacity-50" />}
          {!!selectedUsers.length && (
            <AvatarGroup limit={3}>
              <AvatarGroupList>
                {selectedUsers.map((user) => {
                  return <AvatarWrap type="USER" key={user.id} id={user.id} name={user.name} url={user.thumbnailUrl} className="h-6 w-6 text-xs" />;
                })}
              </AvatarGroupList>
              <AvatarOverflowIndicator className="h-6 w-6 text-xs" />
            </AvatarGroup>
          )}
          {mode === 'create' && (
            <span className="ml-2 truncate">
              {selectedUsers.length === 0 && 'Assign to'}
              {selectedUsers.length === 1 && selectedUsers[0].name}
              {selectedUsers.length === 2 && selectedUsers.map(({ name }) => name).join(', ')}
              {selectedUsers.length > 2 && `${selectedUsers.length} assigned`}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-60 p-0 rounded-lg" align="end" onCloseAutoFocus={(e) => e.preventDefault()} sideOffset={4}>
        <Command className="relative rounded-lg">
          <CommandInput
            value={searchValue}
            onValueChange={(searchValue) => {
              // If the user types a number, select the user like useHotkeys
              if ([0, 1, 2, 3, 4, 5, 6].includes(Number.parseInt(searchValue))) {
                handleSelectClick(defaultMembers[Number.parseInt(searchValue)]?.name);
                setOpenPopover(false);
                setSearchValue('');
                return;
              }
              setSearchValue(searchValue);
            }}
            clearValue={setSearchValue}
            className="leading-normal"
            placeholder={t('common:placeholder.assign')}
          />
          {!isSearching && <Kbd value="A" className="absolute top-3 right-[10px]" />}
          <CommandList>
            <CommandGroup>
              {members.map((member, index) => (
                <CommandItem
                  key={member.name}
                  value={member.name}
                  onSelect={(name) => {
                    handleSelectClick(name);
                    setSearchValue('');
                  }}
                  className="group rounded-md flex justify-between items-center w-full leading-normal"
                >
                  <div className="flex items-center gap-3">
                    <AvatarWrap type="USER" id={member.id} name={member.name} url={member.thumbnailUrl} className="h-6 w-6 text-xs" />
                    <span>{member.name}</span>
                  </div>

                  <div className="flex items-center">
                    {selectedUsers.includes(member) && <Check size={16} className="text-success" />}
                    {!isSearching && <span className="max-xs:hidden text-xs opacity-50 ml-3 mr-1">{index}</span>}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default AssignMembers;