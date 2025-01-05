/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { ErebrusV1, ErebrusV1Interface } from "../ErebrusV1";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "AccessControlBadConfirmation",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "neededRole",
        type: "bytes32",
      },
    ],
    name: "AccessControlUnauthorizedAccount",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "nodeId",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "data",
        type: "string",
      },
    ],
    name: "CheckpointCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "id",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "nodeType",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "config",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "ipAddress",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "region",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "location",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "metadata",
        type: "string",
      },
      {
        indexed: false,
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "NodeRegistered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "id",
        type: "string",
      },
      {
        indexed: false,
        internalType: "enum ErebrusV1.Status",
        name: "newStatus",
        type: "uint8",
      },
    ],
    name: "NodeStatusUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "previousAdminRole",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "newAdminRole",
        type: "bytes32",
      },
    ],
    name: "RoleAdminChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleGranted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleRevoked",
    type: "event",
  },
  {
    inputs: [],
    name: "ADMIN_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "DEFAULT_ADMIN_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "OPERATOR_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    name: "checkpoint",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "nodeId",
        type: "string",
      },
      {
        internalType: "string",
        name: "data",
        type: "string",
      },
    ],
    name: "createCheckpoint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
    ],
    name: "getRoleAdmin",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "grantRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "hasRole",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "nodeIds",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    name: "nodes",
    outputs: [
      {
        internalType: "string",
        name: "id",
        type: "string",
      },
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "nodeType",
        type: "string",
      },
      {
        internalType: "string",
        name: "config",
        type: "string",
      },
      {
        internalType: "string",
        name: "ipAddress",
        type: "string",
      },
      {
        internalType: "string",
        name: "region",
        type: "string",
      },
      {
        internalType: "string",
        name: "location",
        type: "string",
      },
      {
        internalType: "string",
        name: "metadata",
        type: "string",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "enum ErebrusV1.Status",
        name: "status",
        type: "uint8",
      },
      {
        internalType: "bool",
        name: "exists",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "id",
        type: "string",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "nodeType",
        type: "string",
      },
      {
        internalType: "string",
        name: "config",
        type: "string",
      },
      {
        internalType: "string",
        name: "ipAddress",
        type: "string",
      },
      {
        internalType: "string",
        name: "region",
        type: "string",
      },
      {
        internalType: "string",
        name: "location",
        type: "string",
      },
      {
        internalType: "string",
        name: "metadata",
        type: "string",
      },
      {
        internalType: "address",
        name: "_owner",
        type: "address",
      },
    ],
    name: "registerNode",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "callerConfirmation",
        type: "address",
      },
    ],
    name: "renounceRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "revokeRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "id",
        type: "string",
      },
      {
        internalType: "enum ErebrusV1.Status",
        name: "newStatus",
        type: "uint8",
      },
    ],
    name: "updateNodeStatus",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x60806040523480156200001157600080fd5b506200002d600080516020620018e68339815191528062000095565b62000057600080516020620018c6833981519152600080516020620018e683398151915262000095565b62000072600080516020620018e683398151915233620000e0565b506200008e600080516020620018c683398151915233620000e0565b506200018f565b600082815260208190526040808220600101805490849055905190918391839186917fbd79b86ffe0ab8e8776151514217cd7cacd52c909f66475c3af44e129f0b00ff9190a4505050565b6000828152602081815260408083206001600160a01b038516845290915281205460ff1662000185576000838152602081815260408083206001600160a01b03861684529091529020805460ff191660011790556200013c3390565b6001600160a01b0316826001600160a01b0316847f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a450600162000189565b5060005b92915050565b611727806200019f6000396000f3fe608060405234801561001057600080fd5b50600436106100f55760003560e01c806375b238fc11610097578063ca046c6211610066578063ca046c6214610216578063d547741f14610229578063f5417ca21461023c578063f5b541a61461026757600080fd5b806375b238fc146101c157806391d14854146101e857806398543166146101fb578063a217fddf1461020e57600080fd5b80632f2ff15d116100d35780632f2ff15d1461016857806336568abe1461017b5780635b5bf9941461018e5780636697a925146101a157600080fd5b806301ffc9a7146100fa5780631b82fd1e14610122578063248a9ca314610137575b600080fd5b61010d610108366004610f55565b61027c565b60405190151581526020015b60405180910390f35b610135610130366004611045565b61028d565b005b61015a610145366004611196565b60009081526020819052604090206001015490565b604051908152602001610119565b6101356101763660046111af565b61058c565b6101356101893660046111af565b6105b7565b61013561019c3660046111db565b6105ef565b6101b46101af36600461123f565b6106eb565b60405161011991906112cc565b61015a7fa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c2177581565b61010d6101f63660046111af565b610790565b6101b4610209366004611196565b6107b9565b61015a600081565b6101356102243660046112df565b6107e4565b6101356102373660046111af565b6108ef565b61024f61024a36600461123f565b610914565b6040516101199c9b9a9998979695949392919061136d565b61015a6000805160206116d283398151915281565b600061028782610dd9565b92915050565b6000805160206116d28339815191526102a581610e0e565b60018a6040516102b5919061145d565b9081526040519081900360200190206009015460ff600160a81b909104161561031c5760405162461bcd60e51b81526020600482015260146024820152734e6f646520616c7265616479206578697374732160601b60448201526064015b60405180910390fd5b6040518061018001604052808b81526020016103353390565b6001600160a01b031681526020018a8152602001898152602001888152602001878152602001868152602001858152602001848152602001836001600160a01b031681526020016001600381111561038f5761038f611335565b8152600160209091018190526040516103a9908d9061145d565b908152604051908190036020019020815181906103c69082611501565b5060208201516001820180546001600160a01b0319166001600160a01b03909216919091179055604082015160028201906104019082611501565b50606082015160038201906104169082611501565b506080820151600482019061042b9082611501565b5060a082015160058201906104409082611501565b5060c082015160068201906104559082611501565b5060e0820151600782019061046a9082611501565b5061010082015160088201906104809082611501565b506101208201516009820180546001600160a01b039092166001600160a01b0319831681178255610140850151926001600160a81b03191617600160a01b8360038111156104d0576104d0611335565b0217905550610160919091015160099091018054911515600160a81b0260ff60a81b19909216919091179055600380546001810182556000919091527fc2575a0e9e593c00f959f8c92f12db2869c3395a3b0502d05e2516446f71f85b016105388b82611501565b507fb66be261a24a8510672e1e7c496eae0c1d2ce9d29eb6e048d03c6da74f0f526c8a8a8a8a8a8a8a8a8a604051610578999897969594939291906115c1565b60405180910390a150505050505050505050565b6000828152602081905260409020600101546105a781610e0e565b6105b18383610e1b565b50505050565b6001600160a01b03811633146105e05760405163334bd91960e11b815260040160405180910390fd5b6105ea8282610ead565b505050565b6000805160206116d283398151915261060781610e0e565b600183604051610617919061145d565b9081526040519081900360200190206009015460ff600160a81b909104166106815760405162461bcd60e51b815260206004820152601c60248201527f457265627275733a204e6f646520646f6573206e6f74206578697374000000006044820152606401610313565b81600284604051610692919061145d565b908152602001604051809103902090816106ac9190611501565b507fd67d1994a0f3d42767c76ed3d9c8d88e3488034af6f2b3609baebf227a4602be83836040516106de929190611681565b60405180910390a1505050565b80516020818301810180516002825292820191909301209152805461070f90611479565b80601f016020809104026020016040519081016040528092919081815260200182805461073b90611479565b80156107885780601f1061075d57610100808354040283529160200191610788565b820191906000526020600020905b81548152906001019060200180831161076b57829003601f168201915b505050505081565b6000918252602082815260408084206001600160a01b0393909316845291905290205460ff1690565b600381815481106107c957600080fd5b90600052602060002001600091509050805461070f90611479565b6000805160206116d28339815191526107fc81610e0e565b60018360405161080c919061145d565b9081526040519081900360200190206009015460ff600160a81b909104166108765760405162461bcd60e51b815260206004820152601c60248201527f457265627275733a204e6f646520646f6573206e6f74206578697374000000006044820152606401610313565b81600184604051610887919061145d565b908152604051908190036020019020600901805460ff60a01b1916600160a01b8360038111156108b9576108b9611335565b02179055507fb43103a3adf1026cd2a4cd979b4e0d2b35045e82cf13b4b8aa839f7b28b8c08283836040516106de9291906116af565b60008281526020819052604090206001015461090a81610e0e565b6105b18383610ead565b805160208183018101805160018252928201919093012091528054819061093a90611479565b80601f016020809104026020016040519081016040528092919081815260200182805461096690611479565b80156109b35780601f10610988576101008083540402835291602001916109b3565b820191906000526020600020905b81548152906001019060200180831161099657829003601f168201915b505050600184015460028501805494956001600160a01b039092169491935091506109dd90611479565b80601f0160208091040260200160405190810160405280929190818152602001828054610a0990611479565b8015610a565780601f10610a2b57610100808354040283529160200191610a56565b820191906000526020600020905b815481529060010190602001808311610a3957829003601f168201915b505050505090806003018054610a6b90611479565b80601f0160208091040260200160405190810160405280929190818152602001828054610a9790611479565b8015610ae45780601f10610ab957610100808354040283529160200191610ae4565b820191906000526020600020905b815481529060010190602001808311610ac757829003601f168201915b505050505090806004018054610af990611479565b80601f0160208091040260200160405190810160405280929190818152602001828054610b2590611479565b8015610b725780601f10610b4757610100808354040283529160200191610b72565b820191906000526020600020905b815481529060010190602001808311610b5557829003601f168201915b505050505090806005018054610b8790611479565b80601f0160208091040260200160405190810160405280929190818152602001828054610bb390611479565b8015610c005780601f10610bd557610100808354040283529160200191610c00565b820191906000526020600020905b815481529060010190602001808311610be357829003601f168201915b505050505090806006018054610c1590611479565b80601f0160208091040260200160405190810160405280929190818152602001828054610c4190611479565b8015610c8e5780601f10610c6357610100808354040283529160200191610c8e565b820191906000526020600020905b815481529060010190602001808311610c7157829003601f168201915b505050505090806007018054610ca390611479565b80601f0160208091040260200160405190810160405280929190818152602001828054610ccf90611479565b8015610d1c5780601f10610cf157610100808354040283529160200191610d1c565b820191906000526020600020905b815481529060010190602001808311610cff57829003601f168201915b505050505090806008018054610d3190611479565b80601f0160208091040260200160405190810160405280929190818152602001828054610d5d90611479565b8015610daa5780601f10610d7f57610100808354040283529160200191610daa565b820191906000526020600020905b815481529060010190602001808311610d8d57829003601f168201915b505050600990930154919250506001600160a01b0381169060ff600160a01b8204811691600160a81b9004168c565b60006001600160e01b03198216637965db0b60e01b148061028757506301ffc9a760e01b6001600160e01b0319831614610287565b610e188133610f18565b50565b6000610e278383610790565b610ea5576000838152602081815260408083206001600160a01b03861684529091529020805460ff19166001179055610e5d3390565b6001600160a01b0316826001600160a01b0316847f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a4506001610287565b506000610287565b6000610eb98383610790565b15610ea5576000838152602081815260408083206001600160a01b0386168085529252808320805460ff1916905551339286917ff6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b9190a4506001610287565b610f228282610790565b610f515760405163e2517d3f60e01b81526001600160a01b038216600482015260248101839052604401610313565b5050565b600060208284031215610f6757600080fd5b81356001600160e01b031981168114610f7f57600080fd5b9392505050565b634e487b7160e01b600052604160045260246000fd5b600082601f830112610fad57600080fd5b813567ffffffffffffffff80821115610fc857610fc8610f86565b604051601f8301601f19908116603f01168101908282118183101715610ff057610ff0610f86565b8160405283815286602085880101111561100957600080fd5b836020870160208301376000602085830101528094505050505092915050565b80356001600160a01b038116811461104057600080fd5b919050565b60008060008060008060008060006101208a8c03121561106457600080fd5b893567ffffffffffffffff8082111561107c57600080fd5b6110888d838e01610f9c565b9a5060208c013591508082111561109e57600080fd5b6110aa8d838e01610f9c565b995060408c01359150808211156110c057600080fd5b6110cc8d838e01610f9c565b985060608c01359150808211156110e257600080fd5b6110ee8d838e01610f9c565b975060808c013591508082111561110457600080fd5b6111108d838e01610f9c565b965060a08c013591508082111561112657600080fd5b6111328d838e01610f9c565b955060c08c013591508082111561114857600080fd5b6111548d838e01610f9c565b945060e08c013591508082111561116a57600080fd5b506111778c828d01610f9c565b9250506111876101008b01611029565b90509295985092959850929598565b6000602082840312156111a857600080fd5b5035919050565b600080604083850312156111c257600080fd5b823591506111d260208401611029565b90509250929050565b600080604083850312156111ee57600080fd5b823567ffffffffffffffff8082111561120657600080fd5b61121286838701610f9c565b9350602085013591508082111561122857600080fd5b5061123585828601610f9c565b9150509250929050565b60006020828403121561125157600080fd5b813567ffffffffffffffff81111561126857600080fd5b61127484828501610f9c565b949350505050565b60005b8381101561129757818101518382015260200161127f565b50506000910152565b600081518084526112b881602086016020860161127c565b601f01601f19169290920160200192915050565b602081526000610f7f60208301846112a0565b600080604083850312156112f257600080fd5b823567ffffffffffffffff81111561130957600080fd5b61131585828601610f9c565b92505060208301356004811061132a57600080fd5b809150509250929050565b634e487b7160e01b600052602160045260246000fd5b6004811061136957634e487b7160e01b600052602160045260246000fd5b9052565b6101808152600061138261018083018f6112a0565b6001600160a01b038e16602084015282810360408401526113a3818e6112a0565b905082810360608401526113b7818d6112a0565b905082810360808401526113cb818c6112a0565b905082810360a08401526113df818b6112a0565b905082810360c08401526113f3818a6112a0565b905082810360e084015261140781896112a0565b905082810361010084015261141c81886112a0565b9150506114356101208301866001600160a01b03169052565b61144361014083018561134b565b8215156101608301529d9c50505050505050505050505050565b6000825161146f81846020870161127c565b9190910192915050565b600181811c9082168061148d57607f821691505b6020821081036114ad57634e487b7160e01b600052602260045260246000fd5b50919050565b601f8211156105ea57600081815260208120601f850160051c810160208610156114da5750805b601f850160051c820191505b818110156114f9578281556001016114e6565b505050505050565b815167ffffffffffffffff81111561151b5761151b610f86565b61152f816115298454611479565b846114b3565b602080601f831160018114611564576000841561154c5750858301515b600019600386901b1c1916600185901b1785556114f9565b600085815260208120601f198616915b8281101561159357888601518255948401946001909101908401611574565b50858210156115b15787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b60006101208083526115d58184018d6112a0565b905082810360208401526115e9818c6112a0565b905082810360408401526115fd818b6112a0565b90508281036060840152611611818a6112a0565b9050828103608084015261162581896112a0565b905082810360a084015261163981886112a0565b905082810360c084015261164d81876112a0565b905082810360e084015261166181866112a0565b91505060018060a01b0383166101008301529a9950505050505050505050565b60408152600061169460408301856112a0565b82810360208401526116a681856112a0565b95945050505050565b6040815260006116c260408301856112a0565b9050610f7f602083018461134b56fe97667070c54ef182b0f5858b034beac1b6f3089aa2d3188bb1e8929f4fa9b929a264697066735822122021e323fb88122e7600a04dc1768d997a9a4550c8b363b16ac53a480840fdbbbb64736f6c6343000814003397667070c54ef182b0f5858b034beac1b6f3089aa2d3188bb1e8929f4fa9b929a49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775";

type ErebrusV1ConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ErebrusV1ConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class ErebrusV1__factory extends ContractFactory {
  constructor(...args: ErebrusV1ConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
    this.contractName = "ErebrusV1";
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ErebrusV1> {
    return super.deploy(overrides || {}) as Promise<ErebrusV1>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): ErebrusV1 {
    return super.attach(address) as ErebrusV1;
  }
  connect(signer: Signer): ErebrusV1__factory {
    return super.connect(signer) as ErebrusV1__factory;
  }
  static readonly contractName: "ErebrusV1";
  public readonly contractName: "ErebrusV1";
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ErebrusV1Interface {
    return new utils.Interface(_abi) as ErebrusV1Interface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ErebrusV1 {
    return new Contract(address, _abi, signerOrProvider) as ErebrusV1;
  }
}
