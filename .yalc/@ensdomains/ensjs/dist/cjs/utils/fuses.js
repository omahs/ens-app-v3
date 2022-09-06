"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unnamedFuses = exports.fuseEnum = void 0;
const CANNOT_UNWRAP = 1;
const CANNOT_BURN_FUSES = 2;
const CANNOT_TRANSFER = 4;
const CANNOT_SET_RESOLVER = 8;
const CANNOT_SET_TTL = 16;
const CANNOT_CREATE_SUBDOMAIN = 32;
const PARENT_CANNOT_CONTROL = 64;
const CAN_DO_EVERYTHING = 0;
exports.fuseEnum = {
    CANNOT_UNWRAP,
    CANNOT_BURN_FUSES,
    CANNOT_TRANSFER,
    CANNOT_SET_RESOLVER,
    CANNOT_SET_TTL,
    CANNOT_CREATE_SUBDOMAIN,
    PARENT_CANNOT_CONTROL,
};
exports.unnamedFuses = [
    128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072, 262144,
    524288, 1048576, 2097152, 4194304, 8388608, 16777216, 33554432, 67108864,
    134217728, 268435456, 536870912, 1073741824, 2147483648, 4294967296,
];
const fullFuseEnum = {
    ...exports.fuseEnum,
    CAN_DO_EVERYTHING,
};
exports.default = fullFuseEnum;
