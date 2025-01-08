// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Context.sol";

/// @title NetSepio
/// @notice Smart contract for managing nodes in the NetSepio network with admin and operator control
contract NetSepioV1 is Context, AccessControl {
    /// Status codes for nodes
    /// @dev 0: Offline, 1: Online, 2: Maintenance, 4: Deactivated
    enum Status {
        Offline,
        Online,
        Maintenance,
        Deactivated
    }

    /// Role definition for admin
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    /// @notice Structure to store node information
    struct Node {
        string id;
        address addr;
        string name;
        string spec;
        string config;
        string ipAddress;
        string region;
        string location;
        string metadata;
        address owner;
        Status status;
        bool exists;
    }

    /// @notice Mapping to store nodes
    mapping(string => Node) public nodes;

    /// @notice Structure to store checkpoint data
    mapping(string => string) public checkpoint;

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
    constructor() {
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setRoleAdmin(OPERATOR_ROLE, ADMIN_ROLE);
        _grantRole(ADMIN_ROLE, _msgSender());
        _grantRole(OPERATOR_ROLE, _msgSender());
    }

    /// @notice Registers a new node in the network
    /// @dev Anyone including operator can register a node
    function registerNode(
        string memory id,
        address _addr,
        string memory name,
        string memory spec,
        string memory config,
        string memory ipAddress,
        string memory region,
        string memory location,
        string memory metadata,
        address _owner
    ) external {
        require(!nodes[id].exists, "NetSepio: Node already exists!");

        nodes[id] = Node({
            id: id,
            name: name,
            addr: _addr,
            spec: spec,
            config: config,
            ipAddress: ipAddress,
            region: region,
            location: location,
            metadata: metadata,
            owner: _owner,
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

    // The following functions are overrides required by Solidity.
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
