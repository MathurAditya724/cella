import { useEffect, useState } from 'react';
import useMounted from '~/hooks/use-mounted';
import { cn } from '~/lib/utils';
import { Step, Stepper } from '~/modules/common/stepper';
import { onDefaultBoardingSteps } from '~/modules/home/onboarding-config';
import StepperFooter from '~/modules/home/onboarding/footer';
import { OnboardingStart } from '~/modules/home/onboarding/start';
import CreateOrganizationForm from '~/modules/organizations/create-organization-form';
import { Card, CardContent, CardDescription, CardHeader } from '~/modules/ui/card';
import InviteUsers from '~/modules/users/invite-users';
import UpdateUserForm from '~/modules/users/update-user-form';
import { useNavigationStore } from '~/store/navigation';
import { useUserStore } from '~/store/user';
import type { Organization } from '~/types/common';

export type OnboardingStates = 'start' | 'stepper' | 'completed';

interface OnboardingProps {
  onboarding: OnboardingStates;
  setOnboarding: (value: OnboardingStates) => void;
}

const Onboarding = ({ onboarding = 'start', setOnboarding }: OnboardingProps) => {
  const { hasStarted } = useMounted();
  const [steps, setSteps] = useState(onDefaultBoardingSteps);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const animateClass = `transition-all will-change-transform duration-500 ease-out ${hasStarted ? 'opacity-1' : 'opacity-0 scale-95 translate-y-4'}`;

  const { menu } = useNavigationStore();
  const { user } = useUserStore();

  const onCreateOrganization = (organization: Organization) => {
    setOrganization(organization);
  };

  useEffect(() => {
    if (menu.organizations.length > 0) setSteps([onDefaultBoardingSteps[0]]);
  }, []);

  return (
    <div className="flex flex-col min-h-[90vh] sm:min-h-screen items-center">
      <div className="mt-auto mb-auto w-full">
        {onboarding === 'start' && <OnboardingStart setOnboarding={setOnboarding} />}
        {onboarding === 'stepper' && (
          <div className={cn('mx-auto mt-8 flex flex-col justify-center gap-4 px-4 py-8 sm:w-10/12 max-w-3xl', animateClass)}>
            <Stepper initialStep={0} steps={steps} orientation="vertical">
              {steps.map(({ description, label, id }) => (
                <Step key={label} label={label}>
                  <Card>
                    <CardHeader>
                      <CardDescription className="font-light">{description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {id === 'profile' && (
                        <UpdateUserForm user={user} hiddenFields={['email', 'bio', 'newsletter', 'slug']}>
                          <StepperFooter setOnboarding={setOnboarding} />
                        </UpdateUserForm>
                      )}
                      {id === 'organization' && (
                        <CreateOrganizationForm callback={onCreateOrganization}>
                          <StepperFooter setOnboarding={setOnboarding} />
                        </CreateOrganizationForm>
                      )}
                      {id === 'invitation' && organization && (
                        <InviteUsers entity={organization} mode="email">
                          <StepperFooter organization={organization} setOnboarding={setOnboarding} />
                        </InviteUsers>
                      )}
                    </CardContent>
                  </Card>
                </Step>
              ))}
            </Stepper>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
