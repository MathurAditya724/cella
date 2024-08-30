import { Column, Img, Row, Section, Text } from 'jsx-email';

import { config } from 'config';
import { i18n } from '../../backend/src/lib/i18n';

import type { OrganizationModel } from '../../backend/src/db/schema/organizations';
import type { UserModel } from '../../backend/src/db/schema/users';
import { EmailContainer } from './components/container';
import { EmailButton } from './components/email-button';
import { EmailHeader } from './components/email-header';
import { EmailReplyTo } from './components/email-reply-to';
import { Footer } from './components/footer';

interface Props {
  organization: OrganizationModel;
  targetUser?: UserModel;
  user: UserModel;
  token: string;
}

const productionUrl = config.productionUrl;

export const InviteMemberEmail = ({ organization, user, targetUser, token }: Props) => {
  const emailLanguage = organization?.defaultLanguage || targetUser?.language || config.defaultLanguage;
  const i18nInstance = i18n.cloneInstance({ lng: i18n.languages.includes(emailLanguage) ? emailLanguage : config.defaultLanguage });
  const username = targetUser?.name || targetUser?.email || i18nInstance.t('common:unknown_name');
  const orgName = organization?.name || i18nInstance.t('common:unknown_organization');
  const orgLogo = organization?.logoUrl || organization?.thumbnailUrl || `${productionUrl}/static/email/org.png`;
  const userLogo = targetUser?.thumbnailUrl ? targetUser?.thumbnailUrl : `${productionUrl}/static/email/user.png`;

  return (
    <EmailContainer
      previewText={i18nInstance.t('backend:email.invite_in_organization_preview_text', { orgName })}
      containerStyle={{
        marginTop: '2.5rem',
        marginBottom: '2.5rem',
        width: '32rem',
      }}
    >
      <EmailHeader
        headerText={
          <div
            // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
            dangerouslySetInnerHTML={{
              __html: i18nInstance.t('backend:email.invite_to_organization_title', { orgName: orgName }),
            }}
          />
        }
      />
      <Section
        style={{
          borderRadius: '0.25rem',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: '#eaeaea',
          padding: '1rem',
        }}
      >
        <Text
          style={{
            fontSize: '1rem',
            lineHeight: '1.5rem',
            color: '#000000',
          }}
        >
          <div
            // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
            dangerouslySetInnerHTML={{
              __html: i18nInstance.t('backend:email.invite_to_organization_description', {
                username,
                invitedBy: user.name || i18nInstance.t('common:unknown_inviter'),
                orgName,
              }),
            }}
          />
        </Text>
        <Row>
          <Column align="right">
            <Img
              style={{
                borderRadius: '9999px',
              }}
              src={userLogo}
              width="64"
              height="64"
            />
          </Column>
          <Column align="center">
            <Img src={`${productionUrl}/static/email/arrow.png`} width="12" height="9" alt="invited to" />
          </Column>
          <Column align="left">
            <Img
              style={{
                borderRadius: '9999px',
              }}
              src={orgLogo}
              width="64"
              height="64"
            />
          </Column>
        </Row>
        <EmailButton ButtonText={i18nInstance.t('common:accept')} href={`${config.frontendUrl}/auth/invite/${token}`} />
        <Text style={{ fontSize: '.75rem', color: '#6a737d', margin: '0.5rem 0 0 0' }}>{i18n.t('backend:email.invite_expire')}</Text>
      </Section>
      <EmailReplyTo email={user.email} />
      <Footer />
    </EmailContainer>
  );
};

export default InviteMemberEmail;
