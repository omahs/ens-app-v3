import { useMemo } from 'react'
import { useAccount } from 'wagmi'

import { useBasicName } from './useBasicName'
import { useGetWrapperData } from './useGetWrapperData'
import { useHasSubnames } from './useHasSubnames'

export const usePermissions = (name: string) => {
  const nameParts = name?.split('.') || []
  const parent = nameParts.slice(1)?.join('.')
  const isSubname = nameParts.length > 2
  const is2LDEth = nameParts.length === 2 && nameParts[1] === 'eth'

  const { address } = useAccount()
  const { ownerData, isWrapped } = useBasicName(name)
  const { wrapperData } = useGetWrapperData(name, isWrapped)
  const { fuseObj } = wrapperData || {}

  const { ownerData: parentOwnerData, isWrapped: isParentWrapped } = useBasicName(parent)
  const { hasSubnames } = useHasSubnames(name)
  const canDeleteSubnames = parentOwnerData?.owner === address

  return useMemo(() => {
    const permissions = {
      canEdit: false,
      canSend: false,
      canExtend: false,
      canDeleteFromRegistry: false,
      canDeleteFromNameWrapper: false,
      canDeleteError: '',
      canChangeOwner: false,
      canChangeRegistrant: false,
      canUnwrap: false,
      canBurnFuses: false,
      canTransfer: false,
      canSetResolver: false,
      canSetTTL: false,
      canCreateSubdomain: false,
      parentCanControl: false,
    }

    if (!address || !ownerData) return permissions

    if (is2LDEth) permissions.canExtend = true
    if (address === ownerData.owner) {
      permissions.canSend = true
    }
    if (address === parentOwnerData?.registrant || address === parentOwnerData?.owner) {
      permissions.canSend = true
    }
    if (
      ownerData.registrant === address ||
      (!ownerData.registrant && ownerData.owner === address)
    ) {
      permissions.canSend = true
      permissions.canChangeOwner = true
      permissions.canChangeRegistrant = true
    }
    if (ownerData.owner === address) {
      permissions.canEdit = true
      permissions.canChangeOwner = true
    }

    if (isSubname && canDeleteSubnames && !isParentWrapped) {
      permissions.canDeleteFromRegistry = !hasSubnames
      permissions.canDeleteError = hasSubnames ? 'This name has subnames' : ''
    }
    if (isSubname && canDeleteSubnames && isParentWrapped) {
      permissions.canDeleteFromNameWrapper = !hasSubnames
      permissions.canDeleteError = hasSubnames ? 'This name has subnames' : ''
    }

    if (isWrapped && fuseObj && address === ownerData.owner) {
      permissions.canUnwrap = !fuseObj.CANNOT_UNWRAP
      permissions.canBurnFuses = !fuseObj.CANNOT_BURN_FUSES
      permissions.canTransfer = !fuseObj.CANNOT_TRANSFER
      permissions.canSetResolver = !fuseObj.CANNOT_SET_RESOLVER
      permissions.canSetTTL = !fuseObj.CANNOT_SET_TTL
      permissions.canCreateSubdomain = !fuseObj.CANNOT_CREATE_SUBDOMAIN
      permissions.parentCanControl = !fuseObj.PARENT_CANNOT_CONTROL
    }

    return permissions
  }, [
    address,
    ownerData,
    parentOwnerData,
    is2LDEth,
    isSubname,
    canDeleteSubnames,
    hasSubnames,
    isParentWrapped,
    fuseObj,
    isWrapped,
  ])
}
