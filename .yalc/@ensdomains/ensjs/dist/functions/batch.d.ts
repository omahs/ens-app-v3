import { ethers } from 'ethers';
import { ENSArgs, GenericGeneratedRawFunction } from '..';
export declare function _batch({ contracts }: ENSArgs<'contracts'>, transactions: ethers.providers.TransactionRequest[], requireSuccess?: boolean): Promise<import("../generated/Multicall").Multicall3.ResultStructOutput[]>;
declare type BatchItem = [GenericGeneratedRawFunction, ...any[]];
export declare function batch({ contracts }: ENSArgs<'contracts'>, ...items: BatchItem[]): Promise<any[]>;
export {};