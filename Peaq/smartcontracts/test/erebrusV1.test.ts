import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { ErebrusV1 } from "../typechain-types";

describe("ErebrusV1 Contract", () => {
  let [admin, operator, user1, user2]: SignerWithAddress[] = new Array(4);
  let erebrus: ErebrusV1;

  before(async () => {
    [admin, operator, user1, user2] = await ethers.getSigners();
  });

  beforeEach(async () => {
    const ErebrusFactory = await ethers.getContractFactory("ErebrusV1");
    erebrus = await ErebrusFactory.deploy();
    await erebrus.deployed();
  });

  describe("Deployment & Role Management", () => {
    it("Should set the right admin", async () => {
      const ADMIN_ROLE = await erebrus.ADMIN_ROLE();
      expect(await erebrus.hasRole(ADMIN_ROLE, admin.address)).to.be.true;
    });

    it("Should grant operator role", async () => {
      const OPERATOR_ROLE = await erebrus.OPERATOR_ROLE();
      // Admin grants operator role to another address
      expect(erebrus.grantRole(OPERATOR_ROLE, operator.address));
      expect(await erebrus.hasRole(OPERATOR_ROLE, operator.address)).to.be.true;
    });
  });

  describe("Node Registration", () => {
    const mockNode = {
      id: "node-1",
      name: "Test Node",
      nodeType: "validator",
      config: "basic-config",
      ipAddress: "192.168.1.1",
      region: "EU-WEST",
      location: "London",
      metadata: "test-metadata",
      owner: "", // Will be set in tests
    };

    beforeEach(async () => {
      const OPERATOR_ROLE = await erebrus.OPERATOR_ROLE();
      await erebrus.grantRole(OPERATOR_ROLE, operator.address);
      mockNode.owner = user1.address;
    });

    it("Should register a new node", async () => {
      await expect(
        erebrus
          .connect(operator)
          .registerNode(
            mockNode.id,
            mockNode.name,
            mockNode.nodeType,
            mockNode.config,
            mockNode.ipAddress,
            mockNode.region,
            mockNode.location,
            mockNode.metadata,
            mockNode.owner
          )
      )
        .to.emit(erebrus, "NodeRegistered")
        .withArgs(
          mockNode.id,
          mockNode.name,
          mockNode.nodeType,
          mockNode.config,
          mockNode.ipAddress,
          mockNode.region,
          mockNode.location,
          mockNode.metadata,
          mockNode.owner
        );

      const node = await erebrus.nodes(mockNode.id);
      expect(node.exists).to.be.true;
      expect(node.status).to.equal(1); // Status.Online
      expect(node.owner).to.equal(mockNode.owner);
    });

    it("Should not allow non-operators to register nodes", async () => {
      await expect(
        erebrus
          .connect(user1)
          .registerNode(
            mockNode.id,
            mockNode.name,
            mockNode.nodeType,
            mockNode.config,
            mockNode.ipAddress,
            mockNode.region,
            mockNode.location,
            mockNode.metadata,
            mockNode.owner
          )
      ).to.be.reverted;
    });

    it("Should not allow registering duplicate node IDs", async () => {
      // Register first node
      await erebrus
        .connect(operator)
        .registerNode(
          mockNode.id,
          mockNode.name,
          mockNode.nodeType,
          mockNode.config,
          mockNode.ipAddress,
          mockNode.region,
          mockNode.location,
          mockNode.metadata,
          mockNode.owner
        );

      // Try to register the same node ID again
      await expect(
        erebrus
          .connect(operator)
          .registerNode(
            mockNode.id,
            mockNode.name,
            mockNode.nodeType,
            mockNode.config,
            mockNode.ipAddress,
            mockNode.region,
            mockNode.location,
            mockNode.metadata,
            mockNode.owner
          )
      ).to.be.revertedWith("Node already exists!");
    });
  });

  describe("Node Status Management", () => {
    const mockNode = {
      id: "node-1",
      name: "Test Node",
      nodeType: "validator",
      config: "basic-config",
      ipAddress: "192.168.1.1",
      region: "EU-WEST",
      location: "London",
      metadata: "test-metadata",
      owner: "",
    };

    beforeEach(async () => {
      const OPERATOR_ROLE = await erebrus.OPERATOR_ROLE();
      await erebrus.grantRole(OPERATOR_ROLE, operator.address);
      mockNode.owner = user1.address;

      // Register a node for status update tests
      await erebrus
        .connect(operator)
        .registerNode(
          mockNode.id,
          mockNode.name,
          mockNode.nodeType,
          mockNode.config,
          mockNode.ipAddress,
          mockNode.region,
          mockNode.location,
          mockNode.metadata,
          mockNode.owner
        );
    });

    it("Should update node status", async () => {
      await expect(erebrus.connect(operator).updateNodeStatus(mockNode.id, 2)) // Set to Maintenance
        .to.emit(erebrus, "NodeStatusUpdated")
        .withArgs(mockNode.id, 2);

      const node = await erebrus.nodes(mockNode.id);
      expect(node.status).to.equal(2); // Status.Maintenance
    });

    it("Should not update status of non-existent node", async () => {
      await expect(
        erebrus.connect(operator).updateNodeStatus("non-existent-node", 2)
      ).to.be.revertedWith("Erebrus: Node does not exist");
    });

    it("Should not allow non-operators to update node status", async () => {
      await expect(erebrus.connect(user1).updateNodeStatus(mockNode.id, 2)).to
        .be.reverted;
    });
  });

  describe("Checkpoint Management", () => {
    const mockNode = {
      id: "node-1",
      name: "Test Node",
      nodeType: "validator",
      config: "basic-config",
      ipAddress: "192.168.1.1",
      region: "EU-WEST",
      location: "London",
      metadata: "test-metadata",
      owner: "",
    };

    beforeEach(async () => {
      const OPERATOR_ROLE = await erebrus.OPERATOR_ROLE();
      await erebrus.grantRole(OPERATOR_ROLE, operator.address);
      mockNode.owner = user1.address;

      // Register a node for checkpoint tests
      await erebrus
        .connect(operator)
        .registerNode(
          mockNode.id,
          mockNode.name,
          mockNode.nodeType,
          mockNode.config,
          mockNode.ipAddress,
          mockNode.region,
          mockNode.location,
          mockNode.metadata,
          mockNode.owner
        );
    });

    it("Should create checkpoint for a node", async () => {
      const checkpointData = "checkpoint-data-hash";

      await expect(
        erebrus.connect(operator).createCheckpoint(mockNode.id, checkpointData)
      )
        .to.emit(erebrus, "CheckpointCreated")
        .withArgs(mockNode.id, checkpointData);

      expect(await erebrus.checkpoint(mockNode.id)).to.equal(checkpointData);
    });

    it("Should not create checkpoint for non-existent node", async () => {
      await expect(
        erebrus.connect(operator).createCheckpoint("non-existent-node", "data")
      ).to.be.revertedWith("Erebrus: Node does not exist");
    });

    it("Should not allow non-operators to create checkpoints", async () => {
      await expect(erebrus.connect(user1).createCheckpoint(mockNode.id, "data"))
        .to.be.reverted;
    });
  });
});
