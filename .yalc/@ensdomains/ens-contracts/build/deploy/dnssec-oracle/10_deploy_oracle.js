"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dns_packet_1 = __importDefault(require("dns-packet"));
const hardhat_1 = require("hardhat");
const realAnchors = [
    {
        name: '.',
        type: 'DS',
        class: 'IN',
        ttl: 3600,
        data: {
            keyTag: 19036,
            algorithm: 8,
            digestType: 2,
            digest: new Buffer('49AAC11D7B6F6446702E54A1607371607A1A41855200FD2CE1CDDE32F24E8FB5', 'hex'),
        },
    },
    {
        name: '.',
        type: 'DS',
        klass: 'IN',
        ttl: 3600,
        data: {
            keyTag: 20326,
            algorithm: 8,
            digestType: 2,
            digest: new Buffer('E06D44B80B8F1D39A95C0B0D7C65D08458E880409BBC683457104237C7F8EC8D', 'hex'),
        },
    },
];
const dummyAnchor = {
    name: '.',
    type: 'DS',
    class: 'IN',
    ttl: 3600,
    data: {
        keyTag: 1278,
        algorithm: 253,
        digestType: 253,
        digest: new Buffer('', 'hex'),
    },
};
function encodeAnchors(anchors) {
    return ('0x' +
        anchors
            .map((anchor) => {
            return dns_packet_1.default.answer.encode(anchor).toString('hex');
        })
            .join(''));
}
const func = async function (hre) {
    const { getNamedAccounts, deployments, network } = hre;
    const { deploy } = deployments;
    const { deployer, owner } = await getNamedAccounts();
    const anchors = realAnchors.slice();
    let algorithms = {
        5: 'RSASHA1Algorithm',
        7: 'RSASHA1Algorithm',
        8: 'RSASHA256Algorithm',
        13: 'P256SHA256Algorithm',
    };
    const digests = {
        1: 'SHA1Digest',
        2: 'SHA256Digest',
    };
    const nsec_digests = {
        1: 'SHA1NSEC3Digest',
    };
    if (network.tags.test) {
        anchors.push(dummyAnchor);
        algorithms[253] = 'DummyAlgorithm';
        algorithms[254] = 'DummyAlgorithm';
        digests[253] = 'DummyDigest';
    }
    await deploy('DNSSECImpl', {
        from: deployer,
        args: [encodeAnchors(anchors)],
        log: true,
    });
    const dnssec = await hardhat_1.ethers.getContract('DNSSECImpl');
    const transactions = [];
    for (const [id, alg] of Object.entries(algorithms)) {
        const address = (await deployments.get(alg)).address;
        if (address != (await dnssec.algorithms(id))) {
            transactions.push(await dnssec.setAlgorithm(id, address));
        }
    }
    for (const [id, digest] of Object.entries(digests)) {
        const address = (await deployments.get(digest)).address;
        if (address != (await dnssec.digests(id))) {
            transactions.push(await dnssec.setDigest(id, address));
        }
    }
    for (const [id, digest] of Object.entries(nsec_digests)) {
        const address = (await deployments.get(digest)).address;
        if (address != (await dnssec.nsec3Digests(id))) {
            transactions.push(await dnssec.setNSEC3Digest(id, address));
        }
    }
    console.log(`Waiting on ${transactions.length} transactions setting DNSSEC parameters`);
    await Promise.all(transactions.map((tx) => tx.wait()));
};
func.tags = ['dnssec-oracle'];
func.dependencies = [
    'dnssec-algorithms',
    'dnssec-digests',
    'dnssec-nsec3-digests',
];
exports.default = func;