import { useMemo } from 'react'
import { useAccount } from 'wagmi'

import { useBasicName } from './useBasicName'
import { useGetWrapperData } from './useGetWrapperData'
import { useHasSubnames } from './useHasSubnames'

type Permissions = {
  // Ownership permissions
  canTransfer: boolean
  canTransferRegistrant: boolean
  canTransferOwner: boolean
  canDelete: boolean | string
  canDeleteFromRegistry: boolean | string
  canDeleteFromNameWrapper: boolean | string
  canUnwrap: boolean
  parentCanControl: boolean
  canExtend: boolean
  // Editing permissions
  canEdit: boolean
  canBurnFuses: boolean
  canSetResolver: boolean
  canSetTTL: boolean
  canCreateSubdomain: boolean
}

export const usePermissions = (name: string) => {
  const nameParts = name?.split('.') || []
  const parent = nameParts.slice(1)?.join('.')
  const isTLD = nameParts.length === 1
  const isEth = nameParts[-1] === 'eth'
  const is2LD = nameParts.length === 2
  const isSubname = nameParts.length > 2

  const { address } = useAccount()
  const { ownerData, isWrapped } = useBasicName(name)
  const { wrapperData } = useGetWrapperData(name, isWrapped)
  const { fuseObj } = wrapperData || {}

  const { ownerData: parentOwnerData, isWrapped: isParentWrapped } = useBasicName(parent)
  const { hasSubnames } = useHasSubnames(name)

  return useMemo(() => {
    const permissions: Permissions = {
      canTransfer: false,
      canTransferRegistrant: false,
      canTransferOwner: false,
      canDelete: false,
      canDeleteFromRegistry: false,
      canDeleteFromNameWrapper: false,
      canUnwrap: false,
      parentCanControl: false,
      canExtend: false,
      canEdit: false,
      canBurnFuses: false,
      canSetResolver: false,
      canSetTTL: false,
      canCreateSubdomain: false,
    }

    if (isTLD || !address || !ownerData) return permissions

    if (is2LD && isEth) permissions.canExtend = true

    if (address === ownerData.owner) {
      permissions.canTransfer = true
      permissions.canTransferOwner = true
      permissions.canEdit = true
      permissions.canSetResolver = true
      permissions.canSetTTL = true
      permissions.canCreateSubdomain = true
    }

    if (address === ownerData.registrant) {
      permissions.canTransfer = true
      permissions.canTransferRegistrant = true
      permissions.canTransferOwner = true
    }

    // NOT SURE IF SHOULD INCLUDE PARENT OWNER REGISTRANT
    if (
      isSubname &&
      (parentOwnerData?.owner === address || parentOwnerData?.registrant === address)
    ) {
      permissions.canTransfer = true
      permissions.canTransferOwner = true
      const canDeleteValue = hasSubnames ? 'This name has subnames' : true
      permissions.canDeleteFromRegistry = !isParentWrapped ? canDeleteValue : false
      permissions.canDeleteFromNameWrapper = isParentWrapped ? canDeleteValue : false
      permissions.canDelete =
        permissions.canDeleteFromRegistry || permissions.canDeleteFromNameWrapper
    }

    if (!isWrapped) return permissions

    permissions.canTransfer = permissions.canTransfer && !!fuseObj && !fuseObj?.CANNOT_TRANSFER
    permissions.canDelete = permissions.canDelete && !!fuseObj && !fuseObj?.PARENT_CANNOT_CONTROL
    permissions.canUnwrap = ownerData.owner === address && !!fuseObj && !fuseObj?.CANNOT_UNWRAP
    permissions.parentCanControl = !!fuseObj && !fuseObj?.PARENT_CANNOT_CONTROL
    permissions.canBurnFuses = permissions.canEdit && !!fuseObj && !fuseObj.CANNOT_BURN_FUSES
    permissions.canSetResolver =
      permissions.canSetResolver && !!fuseObj && !fuseObj.CANNOT_SET_RESOLVER
    permissions.canSetTTL = permissions.canSetTTL && !!fuseObj && !fuseObj.CANNOT_SET_TTL
    permissions.canCreateSubdomain =
      !!fuseObj && permissions.canCreateSubdomain && !fuseObj.CANNOT_CREATE_SUBDOMAIN

    return permissions
  }, [
    isTLD,
    is2LD,
    isEth,
    isSubname,
    address,
    ownerData,
    parentOwnerData,
    hasSubnames,
    isParentWrapped,
    fuseObj,
    isWrapped,
  ])
}
