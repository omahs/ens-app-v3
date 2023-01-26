import { UseFormRegister } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { CheckboxRow, Dialog, Typography } from '@ensdomains/thorin'

import { PermissionsCheckbox } from '@app/components/@molecules/PermissionsCheckbox/PermissionsCheckbox'

import type { FormData } from '../RevokePermissions-flow'
import { AccountLink } from '../components/AccountLink'

type Props = {
  manager: string
  register: UseFormRegister<FormData>
  onDismiss: () => void
}

const CenterAlignedTypography = styled(Typography)(
  () => css`
    text-align: center;
  `,
)

export const RevokePCCView = ({ manager = 'wrapped.eth', register }: Props) => {
  const { t } = useTranslation('transactionFlow')
  return (
    <>
      <Dialog.Heading title={t('input.revokePermissions.views.revokePCC.title')} />
      <CenterAlignedTypography fontVariant="body" color="text">
        <Trans
          i18nKey="input.revokePermissions.views.revokePCC.subtitle"
          t={t}
          values={{ account: manager }}
          components={{
            manager: <AccountLink nameOrAddress={manager} />,
          }}
        />
      </CenterAlignedTypography>
      <CheckboxRow
        label={t('input.revokePermissions.views.revokePCC')}
        {...register('fuseObj.PARENT_CANNOT_CONTROL')}
      />
      <PermissionsCheckbox
        title="Give up permission"
        {...register('fuseObj.PARENT_CANNOT_CONTROL')}
      />
    </>
  )
}