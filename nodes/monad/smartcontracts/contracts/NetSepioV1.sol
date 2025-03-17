// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./did.sol";

/// @title NetSepio
/// @notice Smart contract for managing nodes in the NetSepio network with admin and operator control

contract NetSepioV1 is Context, AccessControl, ERC721, DID {
    address constant PRECOMPILE_ADDR =
        address(0x0000000000000000000000000000000000000000);

    DID constant DID_CONTRACT = DID(PRECOMPILE_ADDR);

    /// Role definition for admin
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    uint256 public counter;

    /// Status codes for nodes
    /// @dev 0: Offline, 1: Online, 2: Maintenance, 4: Deactivated
    enum Status {
        Offline,
        Online,
        Maintenance,
        Deactivated
    }

    /// @notice Structure to store node information
    struct Node {
        address addr;
        string did;
        string name;
        string spec;
        string config;
        string ipAddress;
        string region;
        string location;
        string metadata;
        address owner;
        uint256 tokenId;
        Status status;
    }

    /// @notice Mapping to store nodes
    /// @dev nodeId => Node
    mapping(string => Node) public nodes;

    /// @notice Structure to store checkpoint data
    /// @dev nodeId => latest checkpoint
    mapping(string => string) public checkpoint;

    /// @dev tokenId => NFT metadata
    mapping(uint256 => string) private _tokenURI;

    /// @dev tokenId => nodeId
    mapping(uint256 => string) public tokenIdToNodeId;

    modifier onlyWhenNodeExists(string memory nodeId) {
        require(
            balanceOf(nodes[nodeId].addr) == 1,
            "NetSepio: Node does not exist"
        );
        _;
    }

    /// @notice Events for different node operations
    // Modified added config, metadata
    event NodeRegistered(
        string id,
        string did,
        string name,
        address indexed addr,
        string spec,
        string config,
        string ipAddress,
        string region,
        string location,
        string metadata,
        address indexed owner,
        address indexed registrant
    );

    event NodeStatusUpdated(string nodeId, Status newStatus);

    event CheckpointCreated(string nodeId, string data);

    event NodeDeactivated(string nodeId, address indexed nodeAddr);

    /// @notice Contract constructor that sets up admin role
    constructor() ERC721("NetSepio", "NSPIO") {
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setRoleAdmin(OPERATOR_ROLE, ADMIN_ROLE);
        _grantRole(ADMIN_ROLE, _msgSender());
        _grantRole(OPERATOR_ROLE, _msgSender());
    }

    /// @notice Registers a new node in the network
    /// @dev Anyone including operator can register a node
    function registerNode(
        address _addr,
        string memory id,
        string memory did,
        string memory name,
        string memory spec,
        string memory config,
        string memory ipAddress,
        string memory region,
        string memory location,
        string memory metadata,
        string memory nftMetadata,
        address _owner
    ) external {
        // validate if the node is already registered, because it is soulbound
        // one node can only have one soulbound nft
        require(balanceOf(_addr) == 0, "NetSepio: Node already exists!");
        // Validate DID format
        require(_validateDID(did), "NetSepio: Invalid DID format");
        // Validate address
        require(_addr != address(0), "NetSepio: Invalid address");
        // Validate owner
        require(_owner != address(0), "NetSepio: Invalid owner");

        counter++;
        uint256 tokenId = counter;

        /// @dev mint the nft to the node address
        _mint(_addr, tokenId);

        _tokenURI[tokenId] = nftMetadata;

        nodes[id] = Node({
            name: name,
            addr: _addr,
            did: did,
            spec: spec,
            config: config,
            ipAddress: ipAddress,
            region: region,
            location: location,
            metadata: metadata,
            owner: _owner,
            tokenId: tokenId,
            status: Status.Offline
        });

        tokenIdToNodeId[tokenId] = id;

        addAttribute(_addr, bytes("netsepio"), bytes(nftMetadata), 315569260);

        emit NodeRegistered(
            id,
            did,
            name,
            _addr,
            spec,
            config,
            ipAddress,
            region,
            location,
            metadata,
            _owner,
            _msgSender()
        );
    }

    /// @notice Updates the status of an existing node
    /// @dev Only operator can update node status
    function updateNodeStatus(
        string memory id,
        Status newStatus
    ) external onlyRole(OPERATOR_ROLE) onlyWhenNodeExists(id) {
        nodes[id].status = newStatus;
        emit NodeStatusUpdated(id, newStatus);
    }

    /// @notice Creates a checkpoint for a node
    /// @dev Only operator and node can create checkpoints
    function createCheckpoint(
        string memory nodeId,
        string memory data
    ) external onlyWhenNodeExists(nodeId) {
        uint256 tokenId = nodes[nodeId].tokenId;
        require(
            ownerOf(tokenId) == _msgSender() ||
                hasRole(OPERATOR_ROLE, _msgSender()),
            "NetSepio: Not the owner of the node or the operator"
        );

        checkpoint[nodeId] = data;

        emit CheckpointCreated(nodeId, data);
    }

    /// @notice Deactivates a node
    /// @dev Only the node address who is owner of the SBT can deactivate the node
    function deactivateNode(
        string memory nodeId
    ) public onlyWhenNodeExists(nodeId) {
        require(
            ownerOf(nodes[nodeId].tokenId) == _msgSender(),
            "NetSepio: Not the owner of the SBT"
        );
        _burn(nodes[nodeId].tokenId);
        nodes[nodeId].status = Status.Deactivated;

        emit NodeDeactivated(nodeId, _msgSender());
    }

    function updateTokenURI(
        uint256 tokenId,
        string memory uri
    ) public onlyRole(OPERATOR_ROLE) {
        _requireOwned(tokenId);
        _tokenURI[tokenId] = uri;
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        _requireOwned(tokenId);
        return _tokenURI[tokenId];
    }

    /// @notice Read an attribute for a DID account
    /// @param did_account The address of the DID account
    /// @param name The name of the attribute to read
    function readAttribute(
        address did_account,
        bytes memory name
    ) external view override returns (Attribute memory) {
        return DID_CONTRACT.readAttribute(did_account, name);
    }

    /// @notice Add a new attribute to a DID account
    /// @param did_account The address of the DID account
    /// @param name The name of the attribute
    /// @param value The value of the attribute
    /// @param validity_for The validity period of the attribute
    function addAttribute(
        address did_account,
        bytes memory name,
        bytes memory value,
        uint32 validity_for
    ) public override returns (bool) {
        require(
            did_account == _msgSender() || hasRole(OPERATOR_ROLE, _msgSender()),
            "NetSepio: Not the owner of the DID or the operator"
        );
        emit AddAttribute(_msgSender(), did_account, name, value, validity_for);
        return
            DID_CONTRACT.addAttribute(did_account, name, value, validity_for);
    }

    /// @notice Update an existing attribute for a DID account
    /// @param did_account The address of the DID account
    /// @param name The name of the attribute to update
    /// @param value The new value of the attribute
    /// @param validity_for The new validity period of the attribute
    function updateAttribute(
        address did_account,
        bytes memory name,
        bytes memory value,
        uint32 validity_for
    ) external override returns (bool) {
        require(
            did_account == _msgSender() || hasRole(OPERATOR_ROLE, _msgSender()),
            "NetSepio: Not the owner of the DID or the operator"
        );
        emit UpdateAttribute(
            _msgSender(),
            did_account,
            name,
            value,
            validity_for
        );
        return
            DID_CONTRACT.updateAttribute(
                did_account,
                name,
                value,
                validity_for
            );
    }

    /// @notice Remove an attribute from a DID account
    /// @param did_account The address of the DID account
    /// @param name The name of the attribute to remove
    function removeAttribute(
        address did_account,
        bytes memory name
    ) external override returns (bool) {
        require(
            did_account == _msgSender() || hasRole(OPERATOR_ROLE, _msgSender()),
            "NetSepio: Not the owner of the DID or the operator"
        );
        emit RemoveAttribute(did_account, name);
        return DID_CONTRACT.removeAttribute(did_account, name);
    }

    /// @notice Validates if the provided DID follows the correct format
    function _validateDID(string memory did) internal pure returns (bool) {
        bytes memory didBytes = bytes(did);

        // Check minimum length (did:netsepio: = 13 characters + at least 1 char for identifier)
        if (didBytes.length < 14) return false;

        // Check prefix "did:netsepio:"
        return _startsWith(did, "did:monad:");
    }

    /// @notice Helper function to check string prefix
    function _startsWith(
        string memory _str,
        string memory _prefix
    ) internal pure returns (bool) {
        bytes memory str = bytes(_str);
        bytes memory prefix = bytes(_prefix);

        if (str.length < prefix.length) return false;

        for (uint i = 0; i < prefix.length; i++) {
            if (str[i] != prefix[i]) return false;
        }
        return true;
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721) returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert("Soulbound: Transfer failed");
        }
        return super._update(to, tokenId, auth);
    }

    // The following functions are overrides required by Solidity.
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(AccessControl, ERC721) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
