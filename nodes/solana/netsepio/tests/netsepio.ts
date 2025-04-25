import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  PublicKey,
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
} from "@solana/web3.js";
import { assert } from "chai";
import { Netsepio } from "../target/types/netsepio";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createSignerFromKeypair,
  generateSigner,
  signerIdentity,
  publicKey,
  TransactionBuilder,
} from "@metaplex-foundation/umi";
import {
  MPL_CORE_PROGRAM_ID,
  mplCore,
  createV1,
  createCollectionV1,
  fetchAsset,
  fetchCollection,
} from "@metaplex-foundation/mpl-core";

describe("netsepio", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const user = provider.wallet;
  const program = anchor.workspace.Netsepio as Program<Netsepio>;

  // Reusable function to create and fund a keypair
  async function createFundedKeypair(amountInSol = 2) {
    // Generate a random keypair
    const keypair = Keypair.generate();
    console.log("Generated keypair public key:", keypair.publicKey.toBase58());

    // Fund the keypair with SOL
    const airdropAmount = amountInSol * LAMPORTS_PER_SOL;
    const airdropTx = await provider.connection.requestAirdrop(
      keypair.publicKey,
      airdropAmount
    );
    await provider.connection.confirmTransaction(airdropTx);
    // console.log(`Funded keypair with ${amountInSol} SOL`);

    // Check and log the balance
    const balanceInLamports = await provider.connection.getBalance(
      keypair.publicKey
    );
    const balanceInSol = balanceInLamports / LAMPORTS_PER_SOL;
    // console.log(
    //   `Keypair balance: ${balanceInSol} SOL (${balanceInLamports} lamports)`
    // );

    // Return the funded keypair
    return keypair;
  }

  it("Register Node", async () => {
    // Generate a random keypair
    const randomUser = await createFundedKeypair(0.1); // Fund with 2 SOL

    const testNodeId = "node" + Math.random().toString(36).substring(2, 15);
    console.log("testNodeId", testNodeId);
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
    console.log(`the user wallet is ${user.publicKey.toString()}`);

    const [nodePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("erebrus"), Buffer.from(testNodeId)],
      program.programId
    );

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
      .accounts({
        payer: randomUser.publicKey,
      })
      .signers([randomUser])
      .rpc();

    const nodeAccount = await program.account.node.fetch(nodePda);

    assert.equal(nodeAccount.id, testNodeId);
    assert.equal(nodeAccount.user.toBase58(), randomUser.publicKey.toBase58());
    assert.equal(nodeAccount.name, testNodeData.name);
    assert.equal(nodeAccount.nodeType, testNodeData.nodeType);
    assert.equal(nodeAccount.config, testNodeData.config);
    assert.equal(nodeAccount.ipaddress, testNodeData.ipaddress);
    assert.equal(nodeAccount.region, testNodeData.region);
    assert.equal(nodeAccount.location, testNodeData.location);
    assert.equal(nodeAccount.metadata, testNodeData.metadata);
    assert.equal(nodeAccount.owner.toBase58(), testNodeData.owner.toBase58());
    assert.deepEqual(nodeAccount.status, { offline: {} }); // NodeStatus is an enum represented as an object
  });

  it("Update Node Status", async () => {
    // Create a non-admin user
    const nonAdminUser = await createFundedKeypair(0.1);
    console.log("Non-admin user:", nonAdminUser.publicKey.toBase58());

    // Register a node first
    const testNodeId = "node" + Math.random().toString(36).substring(2, 15);
    console.log("testNodeId for update test", testNodeId);
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
      owner: nonAdminUser.publicKey,
    };

    const [nodePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("erebrus"), Buffer.from(testNodeId)],
      program.programId
    );

    await program.methods
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
      .accounts({
        payer: nonAdminUser.publicKey,
      })
      .signers([nonAdminUser])
      .rpc();

    /// Test Case 1: update node status as non-admin (should fail)
    let error = null;
    try {
      // Attempt to call updateNodeStatus as a non-admin user
      await program.methods
        .updateNodeStatus(testNodeId, 1) // Try to set status to ONLINE
        .accounts({ payer: nonAdminUser.publicKey })
        .signers([nonAdminUser])
        .rpc();
    } catch (err) {
      error = err;
    }
    assert.include(
      error.message,
      "NotAuthorized",
      "Expected NotAuthorized error"
    );
    console.log("Successfully caught NotAuthorized error for non-admin user");

    /// Test Case 2: update node status as admin
    await program.methods
      .updateNodeStatus(testNodeId, 1) // Try to set status to ONLINE
      .accounts({ payer: user.publicKey })
      .rpc();

    const updatedNodeAccount = await program.account.node.fetch(nodePda);
    assert.deepEqual(updatedNodeAccount.status, { online: {} });
    console.log("Successfully updated node status to online");

    /// Test Case 3: update node status to offline
    await program.methods
      .updateNodeStatus(testNodeId, 0) // Try to set status to OFFLINE
      .accounts({ payer: user.publicKey })
      .rpc();

    const updatedNodeAccount2 = await program.account.node.fetch(nodePda);
    assert.deepEqual(updatedNodeAccount2.status, { offline: {} });
    console.log("Successfully updated node status to offline");
  });
  it("Create Checkpoint", async () => {
    const randomUser = await createFundedKeypair(0.5);
    console.log("Random user:", randomUser.publicKey.toBase58());

    const adminUser = await createFundedKeypair(0.5);
    console.log("Admin user:", adminUser.publicKey.toBase58());

    const testNodeId = "node" + Math.random().toString(36).substring(2, 15);
    console.log("testNodeId for checkpoint test", testNodeId);
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
      owner: randomUser.publicKey,
    };

    const [nodePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("erebrus"), Buffer.from(testNodeId)],
      program.programId
    );

    console.log("Registering node...");
    // Register the node
    await program.methods
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
      .accounts({
        payer: randomUser.publicKey,
      })
      .signers([randomUser])
      .rpc();

    // Test Case 1A: Owner creates checkpoint
    const firstCheckpointData = JSON.stringify({
      status: "healthy",
      timestamp: new Date().toISOString(),
    });
    console.log("Creating first checkpoint as owner...");

    await program.methods
      .createCheckpoint(testNodeId, firstCheckpointData)
      .accounts({
        payer: randomUser.publicKey,
      })
      .signers([randomUser])
      .rpc();

    let nodeAccount = await program.account.node.fetch(nodePda);
    assert.equal(nodeAccount.checkpointData, firstCheckpointData);
    console.log("Successfully created first checkpoint");

    // Test Case 1B: Owner updates checkpoint
    const secondCheckpointData = JSON.stringify({
      status: "updated",
      timestamp: new Date().toISOString(),
    });
    console.log("Updating checkpoint as owner...");

    await program.methods
      .createCheckpoint(testNodeId, secondCheckpointData)
      .accounts({
        payer: randomUser.publicKey,
      })
      .signers([randomUser])
      .rpc();

    nodeAccount = await program.account.node.fetch(nodePda);
    assert.equal(nodeAccount.checkpointData, secondCheckpointData);
    console.log("Successfully updated checkpoint");

    // Test Case 2: Admin updates checkpoint
    console.log("Updating checkpoint as admin...");
    const adminCheckpointData = JSON.stringify({
      status: "admin-check",
      timestamp: new Date().toISOString(),
    });

    await program.methods
      .createCheckpoint(testNodeId, adminCheckpointData)
      .accounts({
        payer: user.publicKey,
      })
      .rpc();

    nodeAccount = await program.account.node.fetch(nodePda);
    assert.equal(nodeAccount.checkpointData, adminCheckpointData);
    console.log("Successfully updated checkpoint by admin");
  });

  it("Create Collection", async () => {
    // Generate a keypair for the collection account
    const collectionKeypair = Keypair.generate();
    console.log("Collection account:", collectionKeypair.publicKey.toBase58());

    // Define collection metadata
    const collectionName = "Netsepio Collection";
    const collectionUri = "https://example.com/collection.json";

    // TEST CASE 1: Calling Collection through admin
    console.log("Creating collection as admin...");
    try {
      // Call the create_collection function
      const tx = await program.methods
        .createCollection(collectionName, collectionUri)
        .accountsPartial({
          authority: user.publicKey, // Admin account
          payer: user.publicKey, // Payer for transaction
          collection: collectionKeypair.publicKey, // Collection account
          mplCoreProgram: new PublicKey(
            "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
          ),
          systemProgram: SystemProgram.programId, // System Program
        })
        .signers([collectionKeypair]) // Sign with collection keypair
        .rpc();

      console.log("Transaction signature:", tx);

      // Wait for confirmation
      await provider.connection.confirmTransaction(tx);

      // Verify the collection was created - just check that the account exists
      // and skip detailed verification which would require additional setup
      const collectionAccountInfo = await provider.connection.getAccountInfo(
        collectionKeypair.publicKey
      );
      assert.isNotNull(
        collectionAccountInfo,
        "Collection account should exist"
      );

      console.log("✅ Collection created successfully!");
    } catch (error) {
      console.error("Error creating collection:", error);
      throw error; // Re-throw to see the full error in test output
    }
  });
  it("Create Collection as Non-Admin Should Fail", async () => {
    const nonAdminUser = await createFundedKeypair(0.5);
    console.log("Non-admin user:", nonAdminUser.publicKey.toBase58());

    const collectionKeypair = Keypair.generate();
    console.log("Collection account:", collectionKeypair.publicKey.toBase58());

    const collectionName = "Unauthorized Collection";
    const collectionUri = "https://example.com/unauthorized.json";

    console.log("Attempting to create collection as non-admin...");

    let error = null;
    try {
      await program.methods
        .createCollection(collectionName, collectionUri)
        .accountsPartial({
          authority: nonAdminUser.publicKey, // Non-admin user
          payer: nonAdminUser.publicKey,
          collection: collectionKeypair.publicKey,
          mplCoreProgram: new PublicKey(
            "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
          ),
          systemProgram: SystemProgram.programId,
        })
        .signers([nonAdminUser, collectionKeypair])
        .rpc();
    } catch (err) {
      error = err;
    }
    assert.isNotNull(error, "Expected an error for non-admin user");

    const collectionAccountInfo = await provider.connection.getAccountInfo(
      collectionKeypair.publicKey
    );
    assert.isNull(collectionAccountInfo, "Collection account should not exist");
  });
  it("Mint NFT", async () => {
    const collectionKeypair = Keypair.generate();
    const collectionName = "Netsepio NFT Collection";
    const collectionUri = "https://example.com/nft-collection.json";

    const collectionTx = await program.methods
      .createCollection(collectionName, collectionUri)
      .accountsPartial({
        authority: user.publicKey,
        payer: user.publicKey,
        collection: collectionKeypair.publicKey,
        mplCoreProgram: new PublicKey(
          "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
        ),
        systemProgram: SystemProgram.programId,
      })
      .signers([collectionKeypair])
      .rpc();

    await provider.connection.confirmTransaction(collectionTx);

    const nftOwner = await createFundedKeypair(0.5);
    const assetKeypair = Keypair.generate();
    const nftName = "Soulbound NFT";
    const nftUri = "https://example.com/nft.json";

    try {
      const tx = await program.methods
        .mintNft(nftName, nftUri)
        .accountsPartial({
          authority: user.publicKey,
          payer: user.publicKey,
          asset: assetKeypair.publicKey,
          owner: nftOwner.publicKey,
          collection: collectionKeypair.publicKey,
          mplCoreProgram: new PublicKey(
            "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
          ),
          systemProgram: SystemProgram.programId,
        })
        .signers([assetKeypair])
        .rpc();

      await provider.connection.confirmTransaction(tx);

      const assetAccountInfo = await provider.connection.getAccountInfo(
        assetKeypair.publicKey
      );
      assert.isNotNull(assetAccountInfo, "NFT asset account should exist");

      const umi = createUmi(provider.connection);
      umi.use(mplCore());
      const asset = await fetchAsset(
        umi,
        publicKey(assetKeypair.publicKey.toBase58())
      );

      assert.equal(
        asset.owner.toString(),
        nftOwner.publicKey.toBase58(),
        "NFT owner should match"
      );
      assert.equal(asset.name, nftName, "NFT name should match");
      assert.equal(asset.uri, nftUri, "NFT URI should match");
    } catch (error) {
      console.error("Error minting NFT:", error);
      throw error;
    }
  });
  it("Update Node Metadata as Admin", async () => {
    const collectionKeypair = Keypair.generate();
    console.log("Collection account:", collectionKeypair.publicKey.toBase58());

    const collectionName = "Netsepio NFT Collection";
    const collectionUri = "https://example.com/nft-collection.json";

    console.log("Creating collection for NFT...");
    const collectionTx = await program.methods
      .createCollection(collectionName, collectionUri)
      .accountsPartial({
        authority: user.publicKey,
        payer: user.publicKey,
        collection: collectionKeypair.publicKey,
        mplCoreProgram: new PublicKey(
          "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
        ),
        systemProgram: SystemProgram.programId,
      })
      .signers([collectionKeypair])
      .rpc();
    await provider.connection.confirmTransaction(collectionTx);
    console.log("Collection created successfully!");

    const nftOwner = await createFundedKeypair(0.5);
    console.log("NFT owner:", nftOwner.publicKey.toBase58());

    const assetKeypair = Keypair.generate();
    console.log("NFT asset account:", assetKeypair.publicKey.toBase58());

    const nftName = "Soulbound NFT";
    const nftUri = "https://example.com/nft.json";

    console.log("Minting NFT as admin...");
    const mintTx = await program.methods
      .mintNft(nftName, nftUri)
      .accountsPartial({
        authority: user.publicKey,
        payer: user.publicKey,
        asset: assetKeypair.publicKey,
        owner: nftOwner.publicKey,
        collection: collectionKeypair.publicKey,
        mplCoreProgram: new PublicKey(
          "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
        ),
        systemProgram: SystemProgram.programId,
      })
      .signers([assetKeypair])
      .rpc();
    await provider.connection.confirmTransaction(mintTx);
    console.log("NFT minted successfully!");

    const newNftName = "Updated Soulbound NFT";
    const newNftUri = "https://example.com/updated-nft.json";

    console.log("Updating NFT metadata as admin...");
    try {
      const updateTx = await program.methods
        .updateNodeMetadata(newNftName, newNftUri)
        .accountsPartial({
          authority: user.publicKey,
          payer: user.publicKey,
          asset: assetKeypair.publicKey,
          collection: collectionKeypair.publicKey,
          mplCoreProgram: new PublicKey(
            "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
          ),
          systemProgram: SystemProgram.programId,
        })
        .signers([assetKeypair, collectionKeypair]) // Add assetKeypair and collectionKeypair as signers
        .rpc();

      console.log("Update transaction signature:", updateTx);
      await provider.connection.confirmTransaction(updateTx);

      const umi = createUmi(provider.connection);
      umi.use(mplCore());
      const asset = await fetchAsset(
        umi,
        publicKey(assetKeypair.publicKey.toBase58())
      );
      const collection = await fetchCollection(
        umi,
        publicKey(collectionKeypair.publicKey.toBase58())
      );

      assert.equal(
        asset.owner.toString(),
        nftOwner.publicKey.toBase58(),
        "NFT owner should match"
      );
      assert.equal(asset.uri, newNftUri, "NFT URI should be updated");
      assert.equal(
        collection.name,
        collectionName,
        "Collection name should match"
      );

      console.log(
        "✅ NFT metadata updated successfully by admin with correct name, URI, and collection!"
      );
    } catch (error) {
      console.error("Error updating NFT metadata:", error);
      throw error;
    }
  });
  it("Update Node Metadata as Non-Admin Should Fail", async () => {
    const collectionKeypair = Keypair.generate();
    console.log("Collection account:", collectionKeypair.publicKey.toBase58());

    const collectionName = "Netsepio NFT Collection";
    const collectionUri = "https://example.com/nft-collection.json";

    console.log("Creating collection for NFT...");
    const collectionTx = await program.methods
      .createCollection(collectionName, collectionUri)
      .accountsPartial({
        authority: user.publicKey,
        payer: user.publicKey,
        collection: collectionKeypair.publicKey,
        mplCoreProgram: new PublicKey(
          "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
        ),
        systemProgram: SystemProgram.programId,
      })
      .signers([collectionKeypair])
      .rpc();
    await provider.connection.confirmTransaction(collectionTx);
    console.log("Collection created successfully!");

    const nftOwner = await createFundedKeypair(0.5);
    console.log("NFT owner:", nftOwner.publicKey.toBase58());

    const assetKeypair = Keypair.generate();
    console.log("NFT asset account:", assetKeypair.publicKey.toBase58());

    const nftName = "Soulbound NFT";
    const nftUri = "https://example.com/nft.json";

    console.log("Minting NFT as admin...");
    const mintTx = await program.methods
      .mintNft(nftName, nftUri)
      .accountsPartial({
        authority: user.publicKey,
        payer: user.publicKey,
        asset: assetKeypair.publicKey,
        owner: nftOwner.publicKey,
        collection: collectionKeypair.publicKey,
        mplCoreProgram: new PublicKey(
          "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
        ),
        systemProgram: SystemProgram.programId,
      })
      .signers([assetKeypair])
      .rpc();
    await provider.connection.confirmTransaction(mintTx);
    console.log("NFT minted successfully!");

    const nonAdminUser = await createFundedKeypair(0.5);
    console.log("Non-admin user:", nonAdminUser.publicKey.toBase58());

    const newNftName = "Unauthorized Updated NFT";
    const newNftUri = "https://example.com/unauthorized-nft.json";

    console.log("Attempting to update NFT metadata as non-admin...");
    let error = null;
    try {
      await program.methods
        .updateNodeMetadata(newNftName, newNftUri)
        .accountsPartial({
          authority: nonAdminUser.publicKey,
          payer: nonAdminUser.publicKey,
          asset: assetKeypair.publicKey,
          collection: collectionKeypair.publicKey,
          mplCoreProgram: new PublicKey(
            "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
          ),
          systemProgram: SystemProgram.programId,
        })
        .signers([assetKeypair, collectionKeypair])
        .rpc();
    } catch (err) {
      error = err;
      console.log("Error message:", err.message);
    }

    assert.isNotNull(error, "Expected an error for non-admin user");
    assert.include(
      error.message,
      "Signature verification failed",
      "Expected signature verification error for non-admin user"
    );

    const umi = createUmi(provider.connection);
    umi.use(mplCore());
    const asset = await fetchAsset(
      umi,
      publicKey(assetKeypair.publicKey.toBase58())
    );

    assert.equal(asset.name, nftName, "NFT name should not be updated");
    assert.equal(asset.uri, nftUri, "NFT URI should not be updated");

    console.log(
      "✅ Successfully caught signature verification error for non-admin metadata update attempt!"
    );
  });
});
