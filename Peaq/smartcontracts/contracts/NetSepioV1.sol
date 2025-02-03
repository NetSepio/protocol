// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "hardhat/console.sol";

/// TODO
/// 1. add a function to burn the NFT

/// @title NetSepio
/// @notice Smart contract for managing nodes in the NetSepio network with admin and operator control
contract NetSepioV1 is Context, AccessControl, ERC721 {
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
        bool exists;
    }

    /// @notice Mapping to store nodes
    mapping(string => Node) public nodes;

    /// @notice Structure to store checkpoint data
    mapping(string => string) public checkpoint;

    mapping(uint256 => string) private _tokenURI;

    mapping(uint256 => string) public tokenIdToNodeId;

    /// @notice Events for different node operations
    // Modified added config, metadata
    event NodeRegistered(
        string id,
        string name,
        address addr,
        string spec,
        string config,
        string ipAddress,
        string region,
        string location,
        string metadata,
        address owner,
        address registrant
    );

    event NodeStatusUpdated(string id, Status newStatus);

    event CheckpointCreated(string nodeId, string data);

    /// @notice Contract constructor that sets up admin role
    constructor() ERC721("NetSepio", "NSP") {
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
        require(!nodes[id].exists, "NetSepio: Node already exists!");

        counter++;
        uint256 tokenId = counter;

        _mint(_owner, tokenId);
        _tokenURI[tokenId] = nftMetadata;

        nodes[id] = Node({
            name: name,
            addr: _addr,
            spec: spec,
            config: config,
            ipAddress: ipAddress,
            region: region,
            location: location,
            metadata: metadata,
            owner: _owner,
            tokenId: tokenId,
            status: Status.Offline,
            exists: true
        });

        emit NodeRegistered(
            id,
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
    ) external onlyRole(OPERATOR_ROLE) {
        require(nodes[id].exists, "NetSepio: Node does not exist");

        nodes[id].status = newStatus;

        emit NodeStatusUpdated(id, newStatus);
    }

    /// @notice Creates a checkpoint for a node
    /// @dev Only operator and owner can create checkpoints
    function createCheckpoint(
        string memory nodeId,
        string memory data
    ) external {
        require(
            _msgSender() == nodes[nodeId].owner ||
                hasRole(OPERATOR_ROLE, _msgSender()),
            "NetSepio: Not the owner of the node or the operator"
        );
        require(nodes[nodeId].exists, "NetSepio: Node does not exist");

        checkpoint[nodeId] = data;

        emit CheckpointCreated(nodeId, data);
    }

    function deactivateNode(string memory nodeId, uint256 tokenId) public {
        require(nodes[nodeId].exists, "NetSepio: Node does not exist");
        require(
            ownerOf(tokenId) == _msgSender(),
            "NetSepio: Not the owner of the node"
        );
        _burn(tokenId);
        nodes[nodeId].status = Status.Deactivated;
        nodes[nodeId].exists = false;
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
