import { config } from 'config';
import { useTranslation } from 'react-i18next';
import { cn } from '~/lib/utils';
import { RadioGroup, RadioGroupItem } from '~/modules/ui/radio-group';
import type { ContextEntity } from '~/types/common';

interface SelectRoleProps {
  entityType?: ContextEntity;
  onChange: (value?: string) => void;
  value?: (typeof config.rolesByType.allRoles)[number];
  className?: string;
}

const SelectRole = ({ entityType, onChange, value, className }: SelectRoleProps) => {
  const { t } = useTranslation();

  const roles = entityType ? config.rolesByType.entityRoles : ['user'];

  return (
    <RadioGroup value={value} onValueChange={onChange} className={cn('inline-flex gap-4 items-center', className)}>
      {roles.map((role) => (
        <label key={role} className="inline-flex gap-2 items-center cursor-pointer ">
          <RadioGroupItem key={role} value={role} />
          <span className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{t(role)}</span>
        </label>
      ))}
    </RadioGroup>
  );
};

export default SelectRole;
