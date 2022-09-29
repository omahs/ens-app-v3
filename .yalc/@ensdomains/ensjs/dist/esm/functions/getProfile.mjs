// src/functions/getProfile.ts
import { formatsByName } from "@ensdomains/address-encoder";
import { ethers } from "ethers";
import { decodeContenthash } from "../utils/contentHash.mjs";
import { hexEncodeName } from "../utils/hexEncodedName.mjs";
import { namehash } from "../utils/normalise.mjs";
import { parseInputType } from "../utils/validation.mjs";
var makeMulticallData = async ({
  _getAddr,
  _getContentHash,
  _getText,
  resolverMulticallWrapper
}, name, options) => {
  let calls = [];
  if (options.texts)
    calls = [
      ...calls,
      ...await Promise.all(
        options.texts.map(async (x) => ({
          key: x,
          data: await _getText.raw(name, x),
          type: "text"
        }))
      )
    ];
  if (options.coinTypes)
    calls = [
      ...calls,
      ...await Promise.all(
        options.coinTypes.map(async (x) => ({
          key: x,
          data: await _getAddr.raw(name, x, true),
          type: "addr"
        }))
      )
    ];
  if (typeof options.contentHash === "boolean" && options.contentHash) {
    calls.push({
      key: "contentHash",
      data: await _getContentHash.raw(name),
      type: "contenthash"
    });
  }
  if (!calls.find((x) => x.key === "60")) {
    calls.push({
      key: "60",
      data: await _getAddr.raw(name, "60", true),
      type: "addr"
    });
  }
  const prRawData = await resolverMulticallWrapper.raw(calls.map((x) => x.data));
  return { data: prRawData.data, calls };
};
var fetchWithoutResolverMulticall = async ({ multicallWrapper }, calls, resolverAddress) => {
  const callsWithResolver = calls.map((call) => ({
    to: resolverAddress,
    data: call.data.data
  }));
  return (await multicallWrapper(callsWithResolver)).map(
    (x) => x[1]
  );
};
var formatRecords = async ({
  _getText,
  _getAddr,
  _getContentHash
}, data, calls, options) => {
  const returnedRecords = (await Promise.all(
    data.map(async (item, i) => {
      let decodedFromAbi;
      let itemRet = {
        key: calls[i].key,
        type: calls[i].type
      };
      if (itemRet.type === "contenthash") {
        ;
        [decodedFromAbi] = ethers.utils.defaultAbiCoder.decode(
          ["bytes"],
          item
        );
        if (ethers.utils.hexStripZeros(decodedFromAbi) === "0x") {
          return;
        }
      }
      switch (calls[i].type) {
        case "text":
          itemRet = {
            ...itemRet,
            value: await _getText.decode(item)
          };
          if (itemRet.value === "" || itemRet.value === void 0)
            return;
          break;
        case "addr":
          try {
            const addr = await _getAddr.decode(item, "", calls[i].key);
            if (addr) {
              itemRet = {
                ...itemRet,
                ...addr
              };
              break;
            } else {
              return;
            }
          } catch {
            return;
          }
        case "contenthash":
          try {
            itemRet = {
              ...itemRet,
              value: await _getContentHash.decode(item)
            };
            break;
          } catch {
            return;
          }
      }
      return itemRet;
    })
  )).filter((x) => {
    return typeof x === "object";
  }).filter((x) => x);
  const returnedResponse = {};
  if (typeof options.contentHash === "string" || typeof options.contentHash === "object") {
    if (typeof options.contentHash === "string" && ethers.utils.hexStripZeros(options.contentHash) === "0x") {
      returnedResponse.contentHash = null;
    } else if (ethers.utils.isBytesLike(options.contentHash.decoded) && ethers.utils.hexStripZeros(options.contentHash.decoded) === "0x") {
      returnedResponse.contentHash = null;
    } else {
      returnedResponse.contentHash = options.contentHash;
    }
  } else if (options.contentHash) {
    const foundRecord = returnedRecords.find(
      (item) => item.type === "contenthash"
    );
    returnedResponse.contentHash = foundRecord ? foundRecord.value : null;
  }
  if (options.texts) {
    returnedResponse.texts = returnedRecords.filter(
      (x) => x.type === "text"
    );
  }
  if (options.coinTypes) {
    returnedResponse.coinTypes = returnedRecords.filter(
      (x) => x.type === "addr"
    );
  }
  return returnedResponse;
};
var getDataForName = async ({
  contracts,
  _getAddr,
  _getContentHash,
  _getText,
  resolverMulticallWrapper,
  multicallWrapper
}, name, options, fallbackResolver, specificResolver) => {
  const universalResolver = await contracts?.getUniversalResolver();
  const { data, calls } = await makeMulticallData(
    { _getAddr, _getContentHash, _getText, resolverMulticallWrapper },
    name,
    options
  );
  let resolvedData;
  let useFallbackResolver = false;
  try {
    if (specificResolver) {
      const publicResolver = await contracts?.getPublicResolver(
        void 0,
        specificResolver
      );
      resolvedData = await publicResolver?.callStatic.multicall(
        calls.map((x) => x.data)
      );
    } else {
      resolvedData = await universalResolver?.resolve(hexEncodeName(name), data);
    }
  } catch {
    useFallbackResolver = true;
  }
  let resolverAddress;
  let recordData;
  if (useFallbackResolver) {
    resolverAddress = specificResolver || fallbackResolver;
    recordData = await fetchWithoutResolverMulticall(
      { multicallWrapper },
      calls,
      resolverAddress
    );
  } else {
    resolverAddress = specificResolver || resolvedData["1"];
    if (specificResolver) {
      recordData = resolvedData;
    } else {
      ;
      [recordData] = await resolverMulticallWrapper.decode(resolvedData["0"]);
    }
  }
  const matchAddress = recordData[calls.findIndex((x) => x.key === "60")];
  return {
    address: matchAddress && await _getAddr.decode(matchAddress),
    records: await formatRecords(
      { _getAddr, _getContentHash, _getText },
      recordData,
      calls,
      options
    ),
    resolverAddress
  };
};
var graphFetch = async ({ gqlInstance }, name, wantedRecords, resolverAddress) => {
  const query = gqlInstance.gql`
    query getRecords($id: String!) {
      domain(id: $id) {
        isMigrated
        createdAt
        resolver {
          texts
          coinTypes
          contentHash
          addr {
            id
          }
          address
        }
      }
    }
  `;
  const customResolverQuery = gqlInstance.gql`
    query getRecordsWithCustomResolver($id: String!, $resolverId: String!) {
      domain(id: $id) {
        isMigrated
        createdAt
      }
      resolver(id: $resolverId) {
        texts
        coinTypes
        contentHash
        addr {
          id
        }
      }
    }
  `;
  const { client } = gqlInstance;
  const id = namehash(name);
  let domain;
  let resolverResponse;
  if (!resolverAddress) {
    ;
    ({ domain } = await client.request(query, { id }));
    resolverResponse = domain?.resolver;
  } else {
    const resolverId = `${resolverAddress.toLowerCase()}-${id}`;
    ({ resolver: resolverResponse, domain } = await client.request(
      customResolverQuery,
      { id, resolverId }
    ));
  }
  if (!domain)
    return;
  const { isMigrated, createdAt } = domain;
  const returnedRecords = {};
  if (!resolverResponse)
    return { isMigrated, createdAt };
  if (!wantedRecords)
    return {
      isMigrated,
      createdAt,
      graphResolverAddress: resolverResponse.address || resolverAddress
    };
  Object.keys(wantedRecords).forEach((key) => {
    const data = wantedRecords[key];
    if (typeof data === "boolean" && data) {
      if (key === "contentHash") {
        returnedRecords[key] = decodeContenthash(resolverResponse.contentHash);
      } else {
        returnedRecords[key] = resolverResponse[key];
      }
    }
  });
  return {
    ...returnedRecords,
    isMigrated,
    createdAt,
    graphResolverAddress: resolverResponse.address || resolverAddress
  };
};
var getProfileFromName = async ({
  contracts,
  gqlInstance,
  _getAddr,
  _getContentHash,
  _getText,
  resolverMulticallWrapper,
  multicallWrapper
}, name, options) => {
  const { resolverAddress, ..._options } = options || {};
  const optsLength = Object.keys(_options).length;
  let usingOptions;
  if (!optsLength || _options?.texts === true || _options?.coinTypes === true) {
    if (optsLength)
      usingOptions = _options;
    else
      usingOptions = { contentHash: true, texts: true, coinTypes: true };
  }
  const graphResult = await graphFetch(
    { gqlInstance },
    name,
    usingOptions,
    resolverAddress
  );
  if (!graphResult)
    return;
  const {
    isMigrated,
    createdAt,
    graphResolverAddress,
    ...wantedRecords
  } = graphResult;
  if (!graphResolverAddress && !options?.resolverAddress)
    return { isMigrated, createdAt, message: "Name doesn't have a resolver" };
  const result = await getDataForName(
    {
      contracts,
      _getAddr,
      _getContentHash,
      _getText,
      resolverMulticallWrapper,
      multicallWrapper
    },
    name,
    usingOptions ? wantedRecords : options,
    graphResolverAddress,
    options?.resolverAddress
  );
  if (!result)
    return { isMigrated, createdAt, message: "Records fetch didn't complete" };
  return { ...result, isMigrated, createdAt, message: void 0 };
};
var getProfileFromAddress = async ({
  contracts,
  gqlInstance,
  getName,
  _getAddr,
  _getContentHash,
  _getText,
  resolverMulticallWrapper,
  multicallWrapper
}, address, options) => {
  let name;
  try {
    name = await getName(address);
  } catch (e) {
    return;
  }
  if (!name || !name.name || name.name === "")
    return;
  if (!name.match)
    return { ...name, isMigrated: null, createdAt: null };
  const result = await getProfileFromName(
    {
      contracts,
      gqlInstance,
      _getAddr,
      _getContentHash,
      _getText,
      resolverMulticallWrapper,
      multicallWrapper
    },
    name.name,
    options
  );
  if (!result || result.message)
    return;
  delete result.address;
  return {
    ...result,
    ...name,
    message: void 0
  };
};
async function getProfile_default({
  contracts,
  gqlInstance,
  getName,
  _getAddr,
  _getContentHash,
  _getText,
  resolverMulticallWrapper,
  multicallWrapper
}, nameOrAddress, options) {
  if (options && options.coinTypes && typeof options.coinTypes !== "boolean") {
    options.coinTypes = options.coinTypes.map((coin) => {
      if (!Number.isNaN(parseInt(coin))) {
        return coin;
      }
      return `${formatsByName[coin.toUpperCase()].coinType}`;
    });
  }
  const inputType = parseInputType(nameOrAddress);
  if (inputType.type === "unknown" || inputType.info === "unsupported") {
    throw new Error("Invalid input type");
  }
  if (inputType.type === "address") {
    return getProfileFromAddress(
      {
        contracts,
        gqlInstance,
        getName,
        _getAddr,
        _getContentHash,
        _getText,
        resolverMulticallWrapper,
        multicallWrapper
      },
      nameOrAddress,
      options
    );
  }
  return getProfileFromName(
    {
      contracts,
      gqlInstance,
      _getAddr,
      _getContentHash,
      _getText,
      resolverMulticallWrapper,
      multicallWrapper
    },
    nameOrAddress,
    options
  );
}
export {
  getProfile_default as default
};