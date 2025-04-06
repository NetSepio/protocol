import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import { assert } from "chai";
import { Erebrus } from "../target/types/erebrus";
import { Netsepio } from "../target/types/netsepio";

describe("erebrus_v1", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const user = provider.wallet;

  const program = anchor.workspace.Erebrus as Program<Erebrus>;
  const netsepio = anchor.workspace.Netsepio as Program<Netsepio>;

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
  // // Test for creating a collection
  // it("Create Collection", async () => {
  //   // Generate a new keypair for the collection
  //   const collectionKeypair = Keypair.generate();

  //   // Collection metadata
  //   const collectionName = "Netsepio Nodes Collection";
  //   const collectionUri = "https://netsepio.com/metadata/collection.json";

  //   // Get the MPL Core Program ID from the constant in lib.rs
  //   const mplCoreProgramId = new PublicKey(
  //     "CoreEVNodXXLqRRk7D3wrhh7NFc1LchQiGJ5rPFtEMvY"
  //   );
  //   // Admin key from the program
  //   const adminKey = new PublicKey(
  //     "FG75GTSYMimybJUBEcu6LkcNqm7fkga1iMp3v4nKnDQS"
  //   );
  //   // Since we're testing and not actually an admin, we need to skip this test if we're not the admin
  //   if (!user.publicKey.equals(adminKey)) {
  //     console.log(
  //       "Skipping collection creation test as current wallet is not admin"
  //     );
  //     return;
  //   }
  //   try {
  //     // Create the collection using the netsepio program - we'll use a more basic approach
  //     // to avoid account naming issues
  //     const tx = await netsepio.rpc.createCollection(
  //       collectionName,
  //       collectionUri,
  //       {
  //         accounts: {
  //           authority: user.publicKey,
  //           payer: user.publicKey,
  //           collection: collectionKeypair.publicKey,
  //           // Use the constant for MPL_CORE_ID from lib.rs
  //           mplCoreProgram: mplCoreProgramId,
  //           systemProgram: anchor.web3.SystemProgram.programId,
  //         },
  //         signers: [collectionKeypair],
  //       }
  //     );
  //     console.log("Collection created with transaction signature:", tx);
  //     // We could add assertions here if we had a way to fetch the collection data
  //     // from the MPL Core program
  //   } catch (error) {
  //     console.error("Error creating collection:", error);
  //     throw error;
  //   }
  // });

  it("Register Node", async () => {
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
    // Find PDA for the node
    const [nodePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("erebrus"), Buffer.from(testNodeId)],
      program.programId
    );

    // Fetch the created node account
    const nodeAccount = await program.account.node.fetch(nodePda);

    // Assert that all fields match the input
    assert.equal(nodeAccount.id, testNodeId);
    assert.equal(
      nodeAccount.user.toBase58(),
      provider.wallet.publicKey.toBase58()
    );
    assert.equal(nodeAccount.name, testNodeData.name);
    assert.equal(nodeAccount.nodeType, testNodeData.nodeType);
    assert.equal(nodeAccount.config, testNodeData.config);
    assert.equal(nodeAccount.ipaddress, testNodeData.ipaddress);
    assert.equal(nodeAccount.region, testNodeData.region);
    assert.equal(nodeAccount.location, testNodeData.location);
    assert.equal(nodeAccount.metadata, testNodeData.metadata);
    assert.equal(nodeAccount.owner.toBase58(), testNodeData.owner.toBase58());
    assert.equal(nodeAccount.status, 1); // Check if status is set to ONLINE
  });

  // it("Update Node Status", async () => {
  //   const [nodePda] = PublicKey.findProgramAddressSync(
  //     [
  //       Buffer.from("erebrus"),
  //       user.publicKey.toBuffer(),
  //       Buffer.from(testNodeId),
  //     ],
  //     program.programId
  //   );

  //   // Update status to maintenance (2)
  //   await program.methods.updateNodeStatus(testNodeId, 2).rpc();

  //   // Fetch the updated node account
  //   const nodeAccount = await program.account.node.fetch(nodePda);
  //   assert.equal(nodeAccount.status, 2);
  // });

  // it("Create Checkpoint", async () => {
  //   const checkpointData = JSON.stringify({
  //     timestamp: new Date().toISOString(),
  //     metrics: {
  //       cpu: "45%",
  //       memory: "60%",
  //       uptime: "99.99%",
  //     },
  //   });

  //   // Create checkpoint keypair
  //   const checkpoint = anchor.web3.Keypair.generate();

  //   try {
  //     const tx = await program.methods
  //       .createCheckpoint(testNodeId, checkpointData)
  //       .accounts({
  //         checkpoint: checkpoint.publicKey,
  //         user: user.publicKey,
  //       })
  //       .signers([checkpoint])
  //       .rpc();

  //     // Fetch the created checkpoint
  //     const checkpointAccount = await program.account.checkpoint.fetch(
  //       checkpoint.publicKey
  //     );

  //     assert.equal(checkpointAccount.nodeId, testNodeId);
  //     assert.equal(checkpointAccount.data, checkpointData);
  //   } catch (error) {
  //     console.error("Error creating checkpoint:", error);
  //     throw error;
  //   }
  // });

  // it("Deactivate Node", async () => {
  //   const [nodePda] = await PublicKey.findProgramAddressSync(
  //     [
  //       Buffer.from("erebrus"),
  //       user.publicKey.toBuffer(),
  //       Buffer.from(testNodeId),
  //     ],
  //     program.programId
  //   );

  //   // Deactivate the node
  //   await program.methods.deactivateNode(testNodeId).rpc();

  //   // Try to fetch the deactivated node account - should fail
  //   try {
  //     await program.account.node.fetch(nodePda);
  //     assert.fail("Expected error when fetching deactivated node");
  //   } catch (error) {
  //     // Expected error when trying to fetch closed account
  //     assert.ok(error);
  //   }
  // });
});
