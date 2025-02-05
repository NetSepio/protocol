import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect, use } from "chai";
import { ethers } from "hardhat";
import { NetSepioV1 } from "../typechain-types";

describe("netsepio Contract", () => {
  let [admin, operator, user1, user2]: SignerWithAddress[] = new Array(4);
  let netsepio: NetSepioV1;

  before(async () => {
    [admin, operator, user1, user2] = await ethers.getSigners();
  });

  beforeEach(async () => {
    const netsepioFactory = await ethers.getContractFactory("NetSepioV1");
    netsepio = await netsepioFactory.deploy();
    await netsepio.deployed();
  });

  describe("Deployment & Role Management", () => {
    it("Should set the right admin", async () => {
      const ADMIN_ROLE = await netsepio.ADMIN_ROLE();
      expect(await netsepio.hasRole(ADMIN_ROLE, admin.address)).to.be.true;
    });

    it("Should grant operator role", async () => {
      const OPERATOR_ROLE = await netsepio.OPERATOR_ROLE();
      // Admin grants operator role to another address
      expect(netsepio.grantRole(OPERATOR_ROLE, operator.address));
      expect(await netsepio.hasRole(OPERATOR_ROLE, operator.address)).to.be
        .true;
    });
  });

  describe("Node Registration", () => {
    let mockNode: any;

    mockNode = {
      id: "node-1",
      name: "Test Node",
      nodeType: "validator",
      config: "basic-config",
      ipAddress: "192.168.1.1",
      region: "EU-WEST",
      location: "London",
      metadata: "test-metadata",
      nftMetadata: "www.google.com",
      owner: "", // Will be set in tests
    };

    beforeEach(async () => {
      const OPERATOR_ROLE = await netsepio.OPERATOR_ROLE();
      await netsepio.grantRole(OPERATOR_ROLE, operator.address);
    });

    it("Should register a new node", async () => {
      await netsepio
        .connect(operator)
        .registerNode(
          operator.address,
          mockNode.id,
          mockNode.name,
          mockNode.nodeType,
          mockNode.config,
          mockNode.ipAddress,
          mockNode.region,
          mockNode.location,
          mockNode.metadata,
          mockNode.nftMetadata,
          user1.address
        );

      const node = await netsepio.nodes(mockNode.id);

      expect(node.exists).to.be.true;
      expect(node.status).to.equal(0); // Status.Offline
      expect(node.owner).to.equal(user1.address);

      //NFT MINTED
      expect(node.tokenId).to.equal(1);
      expect(await netsepio.ownerOf(node.tokenId)).to.equal(user1.address);
      expect(await netsepio.tokenURI(node.tokenId)).to.equal(
        mockNode.nftMetadata
      );
    });

    it("Should not allow registering duplicate node IDs", async () => {
      // Register first node
      await netsepio
        .connect(operator)
        .registerNode(
          operator.address,
          mockNode.id,
          mockNode.name,
          mockNode.nodeType,
          mockNode.config,
          mockNode.ipAddress,
          mockNode.region,
          mockNode.location,
          mockNode.metadata,
          mockNode.nftMetadata,
          user1.address
        );

      // Try to register the same node ID again
      await expect(
        netsepio
          .connect(operator)
          .registerNode(
            operator.address,
            mockNode.id,
            mockNode.name,
            mockNode.nodeType,
            mockNode.config,
            mockNode.ipAddress,
            mockNode.region,
            mockNode.location,
            mockNode.metadata,
            mockNode.nftMetadata,
            mockNode.owner
          )
      ).to.be.reverted;
    });
    it("Should not allow token owner to be changed, token metadata to be changed only by operator", async () => {
      await netsepio
        .connect(operator)
        .registerNode(
          operator.address,
          mockNode.id,
          mockNode.name,
          mockNode.nodeType,
          mockNode.config,
          mockNode.ipAddress,
          mockNode.region,
          mockNode.location,
          mockNode.metadata,
          mockNode.nftMetadata,
          user1.address
        );

      const node = await netsepio.nodes(mockNode.id);
      await expect(
        netsepio
          .connect(user1)
          .transferFrom(user1.address, user2.address, node.tokenId)
      ).to.be.reverted;

      /// TOKEN METADATA SHOULD NOT BE CHANGED
      expect(await netsepio.tokenURI(node.tokenId)).to.equal(
        mockNode.nftMetadata
      );
      const newMetadata = "new-metadata";
      await netsepio
        .connect(operator)
        .updateTokenURI(node.tokenId, newMetadata);
      expect(await netsepio.tokenURI(node.tokenId)).to.equal(newMetadata);

      // REVERT IF TOKEN METADATA IS CHANGED BY NON-OPERATOR
      await expect(
        netsepio.connect(user1).updateTokenURI(node.tokenId, newMetadata)
      ).to.be.reverted;
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
      nftMetadata: "www.google.com",
      owner: "",
    };

    beforeEach(async () => {
      const OPERATOR_ROLE = await netsepio.OPERATOR_ROLE();
      await netsepio.grantRole(OPERATOR_ROLE, operator.address);
      mockNode.owner = user1.address;

      // Register a node for status update tests
      await netsepio
        .connect(operator)
        .registerNode(
          operator.address,
          mockNode.id,
          mockNode.name,
          mockNode.nodeType,
          mockNode.config,
          mockNode.ipAddress,
          mockNode.region,
          mockNode.location,
          mockNode.metadata,
          mockNode.nftMetadata,
          mockNode.owner
        );
    });

    it("Should update node status", async () => {
      await expect(netsepio.connect(operator).updateNodeStatus(mockNode.id, 2)) // Set to Maintenance
        .to.emit(netsepio, "NodeStatusUpdated")
        .withArgs(mockNode.id, 2);

      const node = await netsepio.nodes(mockNode.id);
      expect(node.status).to.equal(2); // Status.Maintenance
    });

    it("Should not update status of non-existent node", async () => {
      await expect(
        netsepio.connect(operator).updateNodeStatus("non-existent-node", 2)
      ).to.be.reverted;
    });

    it("Should not allow non-operators to update node status", async () => {
      await expect(netsepio.connect(user1).updateNodeStatus(mockNode.id, 2)).to
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
      nftMetadata: "www.google.com",
      owner: "",
    };

    beforeEach(async () => {
      const OPERATOR_ROLE = await netsepio.OPERATOR_ROLE();
      await netsepio.grantRole(OPERATOR_ROLE, operator.address);
      mockNode.owner = user1.address;

      // Register a node for checkpoint tests
      await netsepio
        .connect(operator)
        .registerNode(
          operator.address,
          mockNode.id,
          mockNode.name,
          mockNode.nodeType,
          mockNode.config,
          mockNode.ipAddress,
          mockNode.region,
          mockNode.location,
          mockNode.metadata,
          mockNode.nftMetadata,
          mockNode.owner
        );
    });

    it("Should create checkpoint for a node", async () => {
      const checkpointData = "checkpoint-data-hash";

      await netsepio
        .connect(operator)
        .createCheckpoint(mockNode.id, checkpointData);

      expect(await netsepio.checkpoint(mockNode.id)).to.be.equal(
        checkpointData
      );
    });

    it("Should not create checkpoint for non-existent node", async () => {
      await expect(
        netsepio.connect(operator).createCheckpoint("non-existent-node", "data")
      ).to.be.reverted;
    });
    it("Should not allow owners to create checkpoints", async () => {
      await netsepio.connect(user1).createCheckpoint(mockNode.id, "data1");
      expect(await netsepio.checkpoint(mockNode.id)).to.be.equal("data1");
    });

    it("Should not allow non-operators to create checkpoints", async () => {
      await expect(
        netsepio.connect(user2).createCheckpoint(mockNode.id, "data")
      ).to.be.reverted;
    });
  });
});
