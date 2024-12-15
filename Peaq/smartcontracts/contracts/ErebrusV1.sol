// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/// @title ErebrusV1
/// @notice Smart contract for managing nodes in the Erebrus network with admin control
contract ErebrusV1 is AccessControl {
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

    /// @notice Structure to store node information
    struct Node {
        string id;
        address user;
        string name;
        string nodeType;
        string config;
        string ipAddress;
        string region;
        string location;
        string metadata;
        string owner;
        Status status;
        bool exists;
    }

    /// @notice Mapping to store nodes
    mapping(string => Node) public nodes;

    /// @notice Structure to store checkpoint data
    mapping(string => string) public Checkpoint;

    /// @notice Array to store all node IDs
    string[] public nodeIds;

    /// @notice Events for different node operations
    event NodeRegistered(
        string id,
        string name,
        string nodeType,
        string ipAddress,
        string region,
        string location,
        string owner
    );

    event NodeDeactivated(string id, address operator, uint256 timestamp);

    event NodeStatusUpdated(string id, Status newStatus, address operator);

    event CheckpointCreated(string nodeId, string data, uint256 timestamp);

    /// @notice Contract constructor that sets up admin role
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /// @notice Registers a new node in the network
    /// @dev Only admin can register new nodes
    function registerNode(
        string memory id,
        string memory name,
        string memory nodeType,
        string memory config,
        string memory ipAddress,
        string memory region,
        string memory location,
        string memory metadata,
        string memory owner
    ) external onlyRole(ADMIN_ROLE) {
        require(!nodes[id].exists, "Node already exists");

        nodes[id] = Node({
            id: id,
            user: msg.sender,
            name: name,
            nodeType: nodeType,
            config: config,
            ipAddress: ipAddress,
            region: region,
            location: location,
            metadata: metadata,
            owner: owner,
            status: Status.Online,
            exists: true
        });

        nodeIds.push(id);

        emit NodeRegistered(
            id,
            name,
            nodeType,
            ipAddress,
            region,
            location,
            owner
        );
    }

    /// @notice Deactivates an existing node
    /// @dev Only admin can deactivate nodes
    function deactivateNode(string memory id) external onlyRole(ADMIN_ROLE) {
        require(nodes[id].exists, "Node does not exist");

        nodes[id].status = Status.Deactivated;

        emit NodeDeactivated(id, msg.sender, block.timestamp);
    }

    /// @notice Updates the status of an existing node
    /// @dev Only admin can update node status
    function updateNodeStatus(
        string memory id,
        Status newStatus
    ) external onlyRole(ADMIN_ROLE) {
        require(nodes[id].exists, "Node does not exist");
        require(
            newStatus != Status.Deactivated,
            "Use deactivateNode for deactivation"
        );

        nodes[id].status = newStatus;

        emit NodeStatusUpdated(id, newStatus, msg.sender);
    }

    /// @notice Creates a checkpoint for a node
    /// @dev Only admin can create checkpoints
    function createCheckpoint(
        string memory nodeId,
        string memory data
    ) external onlyRole(ADMIN_ROLE) {
        require(nodes[nodeId].exists, "Node does not exist");

        checkpoint[nodeId] = data;

        emit CheckpointCreated(nodeId, data, block.timestamp);
    }

    /// @notice Gets all registered nodes
    /// @return Array of all Node structs
    function getAllNodes() external view returns (Node[] memory) {
        Node[] memory allNodes = new Node[](nodeIds.length);

        for (uint i = 0; i < nodeIds.length; i++) {
            allNodes[i] = nodes[nodeIds[i]];
        }

        return allNodes;
    }

    /// @notice Gets a specific node by ID
    /// @return Node struct for the requested ID
    function getNode(string memory id) external view returns (Node memory) {
        require(nodes[id].exists, "Node does not exist");
        return nodes[id];
    }

    // The following functions are overrides required by Solidity.

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
