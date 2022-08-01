"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAddr = exports._getAddr = exports.getText = exports._getText = exports.getContentHash = exports._getContentHash = void 0;
const address_encoder_1 = require("@ensdomains/address-encoder");
const ethers_1 = require("ethers");
const contentHash_1 = require("../utils/contentHash");
const normalise_1 = require("../utils/normalise");
exports._getContentHash = {
    raw: async ({ contracts }, name) => {
        const publicResolver = await contracts?.getPublicResolver();
        return {
            to: '0x0000000000000000000000000000000000000000',
            data: publicResolver.interface.encodeFunctionData('contenthash', [
                (0, normalise_1.namehash)(name),
            ]),
        };
    },
    decode: async ({ contracts }, data) => {
        const publicResolver = await contracts?.getPublicResolver();
        const [response] = publicResolver.interface.decodeFunctionResult('contenthash', data);
        if (!response) {
            return;
        }
        const decodedContent = (0, contentHash_1.decodeContenthash)(response);
        if (!decodedContent ||
            (ethers_1.ethers.utils.isBytesLike(decodedContent.decoded) &&
                ethers_1.ethers.utils.hexStripZeros(decodedContent.decoded) === '0x') ||
            Object.keys(decodedContent).length === 0) {
            return;
        }
        return decodedContent;
    },
};
exports.getContentHash = {
    raw: async ({ contracts, universalWrapper }, name) => {
        const prData = await exports._getContentHash.raw({ contracts }, name);
        return await universalWrapper.raw(name, prData.data);
    },
    decode: async ({ contracts, universalWrapper }, data) => {
        const urData = await universalWrapper.decode(data);
        if (!urData)
            return;
        return await exports._getContentHash.decode({ contracts }, urData.data);
    },
};
exports._getText = {
    raw: async ({ contracts }, name, key) => {
        const publicResolver = await contracts?.getPublicResolver();
        return {
            to: '0x0000000000000000000000000000000000000000',
            data: publicResolver.interface.encodeFunctionData('text', [
                (0, normalise_1.namehash)(name),
                key,
            ]),
        };
    },
    decode: async ({ contracts }, data) => {
        const publicResolver = await contracts?.getPublicResolver();
        const [response] = publicResolver.interface.decodeFunctionResult('text', data);
        if (!response) {
            return;
        }
        return response;
    },
};
exports.getText = {
    raw: async ({ contracts, universalWrapper }, name, key) => {
        const prData = await exports._getText.raw({ contracts }, name, key);
        return await universalWrapper.raw(name, prData.data);
    },
    decode: async ({ contracts, universalWrapper }, data) => {
        const urData = await universalWrapper.decode(data);
        if (!urData)
            return;
        return await exports._getText.decode({ contracts }, urData.data);
    },
};
exports._getAddr = {
    raw: async ({ contracts }, name, coinType, bypassFormat) => {
        if (!coinType) {
            coinType = 60;
        }
        const publicResolver = await contracts?.getPublicResolver();
        if (coinType === 60 || coinType === '60') {
            return {
                to: '0x0000000000000000000000000000000000000000',
                data: publicResolver.interface.encodeFunctionData('addr(bytes32)', [
                    (0, normalise_1.namehash)(name),
                ]),
            };
        }
        if (bypassFormat) {
            return {
                to: '0x0000000000000000000000000000000000000000',
                data: publicResolver.interface.encodeFunctionData('addr(bytes32,uint256)', [(0, normalise_1.namehash)(name), coinType]),
            };
        }
        const formatter = typeof coinType === 'string' && isNaN(parseInt(coinType))
            ? address_encoder_1.formatsByName[coinType]
            : address_encoder_1.formatsByCoinType[typeof coinType === 'number' ? coinType : parseInt(coinType)];
        if (!formatter) {
            throw new Error(`No formatter found for coin: ${coinType}`);
        }
        return {
            to: '0x0000000000000000000000000000000000000000',
            data: publicResolver.interface.encodeFunctionData('addr(bytes32,uint256)', [(0, normalise_1.namehash)(name), formatter.coinType]),
        };
    },
    decode: async ({ contracts }, data, _name, coinType) => {
        let returnCoinType = true;
        if (!coinType) {
            coinType = 60;
            returnCoinType = false;
        }
        const publicResolver = await contracts?.getPublicResolver();
        const formatter = typeof coinType === 'string' && isNaN(parseInt(coinType))
            ? address_encoder_1.formatsByName[coinType]
            : address_encoder_1.formatsByCoinType[typeof coinType === 'number' ? coinType : parseInt(coinType)];
        let response;
        if (coinType === 60 || coinType === '60') {
            ;
            [response] = publicResolver.interface.decodeFunctionResult('addr(bytes32)', data);
        }
        else {
            ;
            [response] = publicResolver.interface.decodeFunctionResult('addr(bytes32,uint256)', data);
        }
        if (!response)
            return;
        if (ethers_1.ethers.utils.hexStripZeros(response) === '0x') {
            return;
        }
        const decodedAddr = formatter.encoder(Buffer.from(response.slice(2), 'hex'));
        if (!decodedAddr) {
            return;
        }
        if (!returnCoinType) {
            return decodedAddr;
        }
        return { coin: formatter.name, addr: decodedAddr };
    },
};
exports.getAddr = {
    raw: async ({ contracts, universalWrapper }, name, coinType) => {
        const prData = await exports._getAddr.raw({ contracts }, name, coinType);
        return await universalWrapper.raw(name, prData.data);
    },
    decode: async ({ contracts, universalWrapper }, data, _name, coinType) => {
        const urData = await universalWrapper.decode(data);
        if (!urData)
            return;
        return await exports._getAddr.decode({ contracts }, urData.data, _name, coinType);
    },
};
// export async function getAddr(
//   { contracts }: ENSArgs<'contracts'>,
//   name: string,
//   coinType?: string | number,
// ) {
//   if (!coinType) {
//     coinType = 60
//   }
//   const universalResolver = await contracts?.getUniversalResolver()
//   const publicResolver = await contracts?.getPublicResolver()
//   const formatter =
//     typeof coinType === 'string'
//       ? formatsByName[coinType]
//       : formatsByCoinType[coinType]
//   if (!formatter) {
//     throw new Error(`Coin type ${coinType} is not supported`)
//   }
//   const data = publicResolver?.interface.encodeFunctionData(
//     'addr(bytes32,uint256)',
//     [ethers.utils.namehash(name), formatter.coinType],
//   )
//   const result = await universalResolver?.resolve(hexEncodeName(name), data)
//   const [encodedAddr] = ethers.utils.defaultAbiCoder.decode(
//     ['bytes'],
//     result['0'],
//   )
//   if (ethers.utils.hexStripZeros(encodedAddr) === '0x') {
//     return
//   }
//   const decodedAddr = formatter.encoder(
//     Buffer.from(encodedAddr.slice(2), 'hex'),
//   )
//   if (!decodedAddr) {
//     return
//   }
//   return decodedAddr
// }
// export const getContentHash = {
//   raw: async ({ contracts }: ENSArgs<'contracts'>, name: string) => {
//     const universalResolver = await contracts?.getUniversalResolver()!
//     const publicResolver = await contracts?.getPublicResolver()!
//     const prData = publicResolver.interface.encodeFunctionData(
//       'contenthash(bytes32)',
//       [ethers.utils.namehash(name)],
//     )
//     const urData = universalResolver.interface.encodeFunctionData(
//       'resolve(bytes,bytes)',
//       [hexEncodeName(name), prData],
//     )
//     return {
//       to: universalResolver.address,
//       data: urData,
//     }
//   },
//   decode: async ({ contracts }: ENSArgs<'contracts'>, data: string) => {
//     const universalResolver = await contracts?.getUniversalResolver()!
//     const publicResolver = await contracts?.getPublicResolver()!
//     const response = universalResolver.interface.decodeFunctionResult(
//       'resolve(bytes,bytes)',
//       data,
//     )
//     if (!response || !response[1]) {
//       return
//     }
//     const [encodedContentHash] = publicResolver.interface.decodeFunctionResult(
//       'contenthash(bytes32)',
//       response[0],
//     )
//     if (ethers.utils.hexStripZeros(encodedContentHash) === '0x') {
//       return
//     }
//     return decodeContenthash(encodedContentHash)
//   },
// }
// const getText = {
//   raw: async (
//     { contracts }: ENSArgs<'contracts'>,
//     name: string,
//     key: string,
//   ) => {
//     const universalResolver = await contracts?.getUniversalResolver()!
//     const publicResolver = await contracts?.getPublicResolver()!
//     const data = publicResolver.interface.encodeFunctionData(
//       'text(bytes32,string)',
//       [ethers.utils.namehash(name), key],
//     )
//     return {
//       to: universalResolver.address,
//       data: universalResolver.interface.encodeFunctionData(
//         'resolve(bytes,bytes)',
//         [hexEncodeName(name), data],
//       ),
//     }
//   },
//   decode: async ({ contracts }: ENSArgs<'contracts'>, data: string) => {
//     const universalResolver = await contracts?.getUniversalResolver()!
//     const publicResolver = await contracts?.getPublicResolver()!
//     const response = universalResolver.interface.decodeFunctionResult(
//       'resolve(bytes,bytes)',
//       data,
//     )
//     if (!response || !response[1]) {
//       return
//     }
//     const [decodedText] = publicResolver.interface.decodeFunctionResult(
//       'text(bytes32,string)',
//       response[0],
//     )
//     if (decodedText === '') {
//       return
//     }
//     return decodedText
//   },
// }