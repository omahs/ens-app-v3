import { useQuery } from "@apollo/client";
import { isENSReadyReactive } from "@app/apollo/reactiveVars";
import { GET_REVERSE_RECORD } from "@app/graphql/queries";
import { emptyAddress } from "@ensdomains/ui";

export const useGetReverseRecord = (address: string, skip: any) => {
  const { data: { getReverseRecord: _data } = {}, loading } = useQuery(
    GET_REVERSE_RECORD,
    {
      variables: {
        address,
      },
      skip: skip || !isENSReadyReactive(),
    }
  );

  const data = !_data || _data.name === emptyAddress ? null : _data;

  return { data, loading };
};
