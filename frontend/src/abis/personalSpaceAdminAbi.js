export const personalSpaceAdminAbi = [
  {
    inputs: [
      { internalType: "address", name: "dao", type: "address" },
      { internalType: "address", name: "where", type: "address" },
      { internalType: "address", name: "who", type: "address" },
      { internalType: "bytes32", name: "permissionId", type: "bytes32" },
    ],
    name: "DaoUnauthorized",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "caller", type: "address" }],
    name: "NotAMember",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "address", name: "dao", type: "address" },
      {
        indexed: false,
        internalType: "address",
        name: "editor",
        type: "address",
      },
    ],
    name: "EditorAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "address", name: "dao", type: "address" },
      {
        indexed: false,
        internalType: "address",
        name: "editor",
        type: "address",
      },
    ],
    name: "EditorLeft",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "address", name: "dao", type: "address" },
      {
        indexed: false,
        internalType: "address",
        name: "editor",
        type: "address",
      },
    ],
    name: "EditorRemoved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "address", name: "dao", type: "address" },
      {
        indexed: false,
        internalType: "address[]",
        name: "editors",
        type: "address[]",
      },
    ],
    name: "EditorsAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "uint8", name: "version", type: "uint8" },
    ],
    name: "Initialized",
    type: "event",
  },
  {
    inputs: [
      { internalType: "string", name: "_editsContentUri", type: "string" },
      { internalType: "bytes", name: "_editsMetadata", type: "bytes" },
      { internalType: "address", name: "_spacePlugin", type: "address" },
    ],
    name: "submitEdits",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
