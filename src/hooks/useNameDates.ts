import { useQuery } from 'wagmi'

import { labelhash } from '@ensdomains/ensjs/utils/labels'

import { useEns } from '@app/utils/EnsProvider'

const query = `
  query getNameDates($id: String!) {
    registration(id: $id) {
      registrationDate
      expiryDate
    }
  }
`

export const useNameDates = (name: string) => {
  const { ready, gqlInstance } = useEns()
  const {
    data,
    isLoading,
    status,
    internal: { isFetchedAfterMount },
    isFetched,
    // don't remove this line, it updates the isCachedData state (for some reason) but isn't needed to verify it
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isFetching: _isFetching,
  } = useQuery(
    ['getNameDates', name],
    async () => {
      const { registration } = await gqlInstance.request(query, {
        id: labelhash(name.split('.')[0]),
      })
      return registration as { registrationDate: string; expiryDate: string }
    },
    {
      enabled: ready,
      select: (d) => ({
        registrationDate: new Date(parseInt(d.registrationDate) * 1000),
        expiryDate: new Date(parseInt(d.expiryDate) * 1000),
      }),
    },
  )

  return {
    data,
    isLoading,
    isCachedData: status === 'success' && isFetched && !isFetchedAfterMount,
  }
}