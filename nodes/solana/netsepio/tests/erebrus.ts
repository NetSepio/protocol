import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
<<<<<<< HEAD:Solana/erebrus_v1/tests/erebrus_v1.ts
import { PublicKey } from "@solana/web3.js";
import { assert } from "chai";
import { Erebrus } from "../target/types/erebrus";

describe("erebrus_v1", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const user = provider.wallet;

  const program = anchor.workspace.Erebrus as Program<Erebrus>;
  // Test data for node registration
  const testNodeId = "node-1";
  const testNodeData = {
    name: "Test Node",
    nodeType: "validator",
    config: JSON.stringify({
      cpu: "4 cores",
      memory: "16GB",
      storage: "1TB",
    }),
    ipaddress: "192.168.1.100",
    region: "us-west",
    location: "San Francisco, CA",
    metadata: JSON.stringify({
      version: "1.0.0",
      lastUpdate: new Date().toISOString(),
    }),
    owner: user.publicKey,
  };
=======
import { Erebrus } from "../target/types/erebrus";

describe("erebrus", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Erebrus as Program<Erebrus>;
>>>>>>> main:Solana/erebrus/tests/erebrus.ts

  it("Register Node", async () => {
    // Find PDA for the node
    const [nodePda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("erebrus"),
        user.publicKey.toBuffer(),
        Buffer.from(testNodeId),
      ],
      program.programId
    );

    // Register the node
    const tx = await program.methods
      .registerNode(
        testNodeId,
        testNodeData.name,
        testNodeData.nodeType,
        testNodeData.config,
        testNodeData.ipaddress,
        testNodeData.region,
        testNodeData.location,
        testNodeData.metadata,
        testNodeData.owner
      )
      .rpc();

    // Fetch the created node account
    const nodeAccount = await program.account.node.fetch(nodePda);

    // Assert that all fields match the input
    // assert.equal(nodeAccount.id, testNodeId);
    assert.equal(nodeAccount.name, testNodeData.name);
    assert.equal(nodeAccount.nodeType, testNodeData.nodeType);
    assert.equal(nodeAccount.config, testNodeData.config);
    assert.equal(nodeAccount.ipaddress, testNodeData.ipaddress);
    assert.equal(nodeAccount.region, testNodeData.region);
    assert.equal(nodeAccount.location, testNodeData.location);
    assert.equal(nodeAccount.metadata, testNodeData.metadata);
    assert.equal(nodeAccount.owner.toBase58(), testNodeData.owner.toBase58());
    assert.equal(nodeAccount.status, 1); // Check if status is set to active
  });

  it("Update Node Status", async () => {
    const [nodePda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("erebrus"),
        user.publicKey.toBuffer(),
        Buffer.from(testNodeId),
      ],
      program.programId
    );

    // Update status to maintenance (2)
    await program.methods.updateNodeStatus(testNodeId, 2).rpc();

    // Fetch the updated node account
    const nodeAccount = await program.account.node.fetch(nodePda);
    assert.equal(nodeAccount.status, 2);
  });

  it("Create Checkpoint", async () => {
    const checkpointData = JSON.stringify({
      timestamp: new Date().toISOString(),
      metrics: {
        cpu: "45%",
        memory: "60%",
        uptime: "99.99%",
      },
    });

    // Create checkpoint keypair
    const checkpoint = anchor.web3.Keypair.generate();

    try {
      const tx = await program.methods
        .createCheckpoint(testNodeId, checkpointData)
        .accounts({
          checkpoint: checkpoint.publicKey,
          user: user.publicKey,
        })
        .signers([checkpoint])
        .rpc();

      // Fetch the created checkpoint
      const checkpointAccount = await program.account.checkpoint.fetch(
        checkpoint.publicKey
      );

      assert.equal(checkpointAccount.nodeId, testNodeId);
      assert.equal(checkpointAccount.data, checkpointData);
    } catch (error) {
      console.error("Error creating checkpoint:", error);
      throw error;
    }
  });

  it("Deactivate Node", async () => {
    const [nodePda] = await PublicKey.findProgramAddressSync(
      [
        Buffer.from("erebrus"),
        user.publicKey.toBuffer(),
        Buffer.from(testNodeId),
      ],
      program.programId
    );

    // Deactivate the node
    await program.methods.deactivateNode(testNodeId).rpc();

    // Try to fetch the deactivated node account - should fail
    try {
      await program.account.node.fetch(nodePda);
      assert.fail("Expected error when fetching deactivated node");
    } catch (error) {
      // Expected error when trying to fetch closed account
      assert.ok(error);
    }
  });
});
