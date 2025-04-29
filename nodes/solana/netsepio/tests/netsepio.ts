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
import { publicKey } from "@metaplex-foundation/umi";
import {
  mplCore,
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
  // Reusable function to register a node
  async function registerNode(payer: Keypair, owner: PublicKey) {
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
      owner,
    };

    const [nodePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("erebrus"), Buffer.from(testNodeId)],
      program.programId
    );
    console.log("🔑 Registering node 🔑");
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
        payer: payer.publicKey,
      })
      .signers([payer])
      .rpc();

    console.log("🔑 Node registered successfully 🔑");
    return { testNodeId, nodePda };
  }

  // Reusable function to create a collection
  async function createCollection() {
    const collectionKeypair = Keypair.generate();
    console.log("Collection account:", collectionKeypair.publicKey.toBase58());

    const collectionName = "Netsepio NFT Collection";
    const collectionUri = "https://example.com/nft-collection.json";

    const tx = await program.methods
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

    await provider.connection.confirmTransaction(tx);

    const collectionAccountInfo = await provider.connection.getAccountInfo(
      collectionKeypair.publicKey
    );
    assert.isNotNull(collectionAccountInfo, "Collection account should exist");

    return { collectionKeypair, collectionName, collectionUri };
  }
  //Reusable NFT minting code
  async function mintNft(
    testNodeId: string,
    nftOwner: Keypair,
    authority: Keypair,
    payer: Keypair,
    collectionKeypair: Keypair
  ) {
    console.log("NFT owner:", nftOwner.publicKey.toBase58());

    const assetKeypair = Keypair.generate();
    console.log("NFT asset account:", assetKeypair.publicKey.toBase58());

    const nftName = "Soulbound NFT";
    const nftUri = "https://example.com/nft.json";

    const tx = await program.methods
      .mintNft(testNodeId, nftName, nftUri)
      .accountsPartial({
        authority: authority.publicKey,
        payer: payer.publicKey,
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

    return { assetKeypair, nftName, nftUri };
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
      owner: randomUser.publicKey,
    };

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
    const { testNodeId, nodePda } = await registerNode(
      nonAdminUser,
      nonAdminUser.publicKey
    );

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

    console.log("Registering node...");
    const { testNodeId, nodePda } = await registerNode(
      randomUser,
      randomUser.publicKey
    );

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

      // Fetch the collection using UMI and mpl-core
      const umi = createUmi(provider.connection);
      umi.use(mplCore());
      const collectionData = await fetchCollection(
        umi,
        publicKey(collectionKeypair.publicKey.toBase58())
      );

      assert.equal(
        collectionData.name,
        collectionName,
        "Collection name should match"
      );
      assert.equal(
        collectionData.uri,
        collectionUri,
        "Collection URI should match"
      );

      console.log("✅ Collection created successfully!");
      console.log(`✅ Verified: Collection name = ${collectionData.name}`);
      console.log(`✅ Verified: Collection URI = ${collectionData.uri}`);

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
  it("Mint NFT as Admin", async () => {
    const nftOwner = await createFundedKeypair(0.5);
    // const userKeypair = (provider.wallet as any).payer as Keypair; // Access the underlying Keypair
    // console.log("User keypair:", userKeypair.publicKey.toBase58());
    //STEP 1: Register a node
    const { testNodeId } = await registerNode(nftOwner, nftOwner.publicKey);
    //STEP 2: Create a collection
    const { collectionKeypair } = await createCollection();
    console.log("🔑 Collection created successfully 🔑");
    //TEST CASE 1: Creation of NFT through admin
    const assetKeypair = Keypair.generate();
    const nftName = "Soulbound NFT";
    const nftUri = "https://example.com/nft.json";

    console.log("The minting nft starts now 🚀");
    try {
      const tx = await program.methods
        .mintNft(testNodeId, nftName, nftUri)
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

      console.log("NFT Owner:", asset.owner.toString());
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
    console.log("The NFT is successfully minted 🎉");
  });
  it("Mint NFT as Non-Admin Should Fail", async () => {
    const nonAdminUser = await createFundedKeypair(0.5);
    console.log("Non-admin user:", nonAdminUser.publicKey.toBase58());
    //STEP 1: Register a node
    const { testNodeId } = await registerNode(nonAdminUser, user.publicKey);
    //STEP 2: Create a collection
    const { collectionKeypair } = await createCollection();
    let error = null;
    let nonAdminAssetKeypair: Keypair | null = null;
    try {
      const result = await mintNft(
        testNodeId,
        nonAdminUser,
        nonAdminUser,
        nonAdminUser,
        collectionKeypair
      );
      nonAdminAssetKeypair = result.assetKeypair;
    } catch (err) {
      error = err;
      console.log("Error message:", err.message);
    }

    assert.isNotNull(error, "Expected an error for non-admin user");

    if (nonAdminAssetKeypair) {
      const assetAccountInfo = await provider.connection.getAccountInfo(
        nonAdminAssetKeypair.publicKey
      );
      assert.isNull(assetAccountInfo, "NFT asset account should not exist");
    }
    console.log(
      "✅ Successfully caught NotAuthorized error for non-admin mint attempt!"
    );
  });

  it("Update Node Metadata as Admin", async () => {
    const nftOwner = await createFundedKeypair(0.5);

    //STEP 1: Register a node
    const { testNodeId } = await registerNode(nftOwner, nftOwner.publicKey);
    //STEP 2: Create a collection
    const { collectionKeypair } = await createCollection();
    console.log("Collection created successfully!");

    const userKeypair = (provider.wallet as any).payer as Keypair; // Access the underlying Keypair
    console.log("User keypair:", userKeypair.publicKey.toBase58());
    //STEP 3: Mint NFT
    console.log("Minting NFT as admin...");
    const { assetKeypair } = await mintNft(
      testNodeId,
      nftOwner,
      userKeypair,
      userKeypair,
      collectionKeypair
    );

    console.log("NFT minted successfully!");

    const newNftName = "Updated Soulbound NFT";
    const newNftUri = "https://example.com/updated-nft.json";

    //STEP 4: Update NFT metadata
    console.log("Updating NFT metadata as admin...");
    try {
      const updateTx = await program.methods
        .updateNodeMetadata(newNftUri)
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

      assert.equal(
        asset.owner.toString(),
        nftOwner.publicKey.toBase58(),
        "NFT owner should match"
      );
      assert.equal(asset.uri, newNftUri, "NFT URI should be updated");

      console.log(
        "✅ NFT metadata updated successfully by admin with correct name, URI, and collection!"
      );
    } catch (error) {
      console.error("Error updating NFT metadata:", error);
      throw error;
    }
  });
  it("Update Node Metadata as Non-Admin Should Fail", async () => {
    const nftOwner = await createFundedKeypair(0.5);

    //STEP 1: Register a node
    const { testNodeId } = await registerNode(nftOwner, nftOwner.publicKey);
    //STEP 2: Create a collection
    const { collectionKeypair } = await createCollection();
    console.log("Collection created successfully!");

    const userKeypair = (provider.wallet as any).payer as Keypair;
    /// STEP 3: Mint NFT
    const { assetKeypair } = await mintNft(
      testNodeId,
      nftOwner,
      userKeypair,
      userKeypair,
      collectionKeypair
    );
    console.log("NFT minted successfully!");

    const nftName = "Soulbound NFT";
    const nftUri = "https://example.com/nft.json";

    const newNftUri = "https://example.com/unauthorized-nft.json";

    // TEST CASE 1
    console.log("Attempting to update NFT metadata as non-admin...");
    let error = null;
    try {
      await program.methods
        .updateNodeMetadata(newNftUri)
        .accountsPartial({
          authority: nftOwner.publicKey,
          payer: nftOwner.publicKey,
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

  it("Deactivate Node as Owner", async () => {
    // Create a node owner
    const nodeOwner = await createFundedKeypair(0.5);
    console.log("Node owner:", nodeOwner.publicKey.toBase58());

    // STEP 1: Register a node
    const { testNodeId, nodePda } = await registerNode(
      nodeOwner,
      nodeOwner.publicKey
    );
    // STEP 2: Create a collection
    const { collectionKeypair } = await createCollection();
    // STEP 3: Mint NFT for the node
    const { assetKeypair } = await mintNft(
      testNodeId,
      nodeOwner,
      user as any, // admin mints the NFT
      user as any, // admin pays for the transaction
      collectionKeypair
    );

    const umi = createUmi(provider.connection);
    umi.use(mplCore());
    const asset = await fetchAsset(
      umi,
      publicKey(assetKeypair.publicKey.toBase58())
    );

    assert.equal(
      asset.owner.toString(),
      nodeOwner.publicKey.toBase58(),
      "NFT owner should match"
    );

    // Verify that the node has been updated with the asset
    let nodeAccount = await program.account.node.fetch(nodePda);
    assert.isNotNull(nodeAccount.asset, "Node should have an asset assigned");

    // STEP 4: Deactivate the node
    console.log("Deactivating node...");
    try {
      const tx = await program.methods
        .deactivateNode(testNodeId)
        .accountsPartial({
          node: nodePda,
          payer: nodeOwner.publicKey,
          asset: assetKeypair.publicKey,
          collection: collectionKeypair.publicKey,
          mplCoreProgram: new PublicKey(
            "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
          ),
          systemProgram: SystemProgram.programId,
        })
        .signers([nodeOwner])
        .rpc();

      await provider.connection.confirmTransaction(tx);
      console.log("Deactivation transaction confirmed!");

      // Verify the node account no longer exists
      const nodeAccountInfo = await provider.connection.getAccountInfo(nodePda);
      assert.isNull(
        nodeAccountInfo,
        "Node account should be closed after deactivation"
      );

      // Verify the NFT asset no longer exists
      const assetAccountInfo = await provider.connection.getAccountInfo(
        assetKeypair.publicKey
      );

      assert.equal(
        assetAccountInfo.data.toString("hex"),
        "00",
        "NFT asset data should be a single zero byte"
      );

      console.log("✅ Node successfully deactivated!");
    } catch (error) {
      console.error("Error deactivating node:", error);
      throw error;
    }
  });
  it("Deactivate Node with Matching and Non-Matching NFT Asset", async () => {
    // Create node owner and delegate
    const userKeypair = (provider.wallet as any).payer as Keypair;
    const nodeOwner = await createFundedKeypair(0.5);

    // STEP 1A: Register a node
    const { testNodeId: testNodeId1, nodePda: nodePda1 } = await registerNode(
      nodeOwner,
      nodeOwner.publicKey
    );
    //STEP 1B: Register a different node
    const { testNodeId: testNodeId2 } = await registerNode(
      nodeOwner,
      nodeOwner.publicKey
    );
    // STEP 2: Create a collection
    const { collectionKeypair } = await createCollection();

    // STEP 3B: Mint NFT for the node (correct NFT)
    const { assetKeypair: correctAssetKeypair } = await mintNft(
      testNodeId1,
      nodeOwner,
      userKeypair, // admin
      userKeypair, // admin pays
      collectionKeypair
    );
    // STEP 3C: Mint NFT for the node (incorrect NFT)
    const { assetKeypair: incorrectAssetKeypair } = await mintNft(
      testNodeId2,
      nodeOwner,
      userKeypair, // admin
      userKeypair, // admin pays
      collectionKeypair
    );
    // Verify node has the correct NFT
    const umi = createUmi(provider.connection);
    umi.use(mplCore());
    const asset = await fetchAsset(
      umi,
      publicKey(correctAssetKeypair.publicKey.toBase58())
    );

    assert.equal(
      asset.owner.toString(),
      nodeOwner.publicKey.toBase58(),
      "NFT owner should match"
    );

    let nodeAccount1 = await program.account.node.fetch(nodePda1);
    assert.isNotNull(nodeAccount1.asset, "Node should have an asset assigned");
    //Check the asset publickey matches or not
    assert.equal(
      nodeAccount1.asset.toString(),
      correctAssetKeypair.publicKey.toBase58(),
      "Node asset should match the correct NFT"
    );

    // STEP 4: Test failure with incorrect NFT
    console.log("Testing deactivation with incorrect NFT...");
    try {
      await program.methods
        .deactivateNode(testNodeId2)
        .accountsPartial({
          node: nodePda1,
          payer: nodeOwner.publicKey,
          asset: correctAssetKeypair.publicKey, // Incorrect NFT
          collection: collectionKeypair.publicKey,
          mplCoreProgram: new PublicKey(
            "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
          ),
          systemProgram: SystemProgram.programId,
        })
        .signers([nodeOwner])
        .rpc();
    } catch (error) {
      assert.isNotNull(error, "Error should be InvalidAsset for incorrect NFT");
    }
    // Validating the deactivation for correct nodeId
    const nodeAccountInfo = await provider.connection.getAccountInfo(nodePda1);
    assert.isNotNull(
      nodeAccountInfo,
      "Node account should not be closed after incorrect NFT asset"
    );
    // Validating the NFT asset is not deleted
    const assetAccountInfo = await provider.connection.getAccountInfo(
      correctAssetKeypair.publicKey
    );
    // Assert that the NFT asset is not deleted
    assert.notEqual(
      assetAccountInfo.data.toString("hex"),
      "00",
      "NFT asset data should not be a single zero byte"
    );
    console.log(
      "✅ Successfully caught error for deactivation with incorrect NFT!"
    );
  });
  it("Deactivate Node as Non-Owner Should Fail", async () => {
    // Create a node owner and a different user
    const nodeOwner = await createFundedKeypair(0.5);
    const nonOwner = await createFundedKeypair(0.5);
    // STEP 1: Register a node
    const { testNodeId, nodePda } = await registerNode(
      nodeOwner,
      nodeOwner.publicKey
    );
    // STEP 2: Create a collection
    const { collectionKeypair } = await createCollection();

    // STEP 3: Mint NFT for the node
    const { assetKeypair } = await mintNft(
      testNodeId,
      nodeOwner,
      user as any, // admin mints the NFT
      user as any, // admin pays for the transaction
      collectionKeypair
    );

    let nodeAccountBeforeDeactivation = await program.account.node.fetch(
      nodePda
    );
    assert.isNotNull(
      nodeAccountBeforeDeactivation,
      "Node should be created successfully"
    );

    // STEP 4: Attempt to deactivate the node as non-owner (should fail)
    console.log("Attempting to deactivate node as non-owner...");
    try {
      await program.methods
        .deactivateNode(testNodeId)
        .accountsPartial({
          node: nodePda,
          payer: nonOwner.publicKey,
          asset: assetKeypair.publicKey,
          collection: collectionKeypair.publicKey,
          mplCoreProgram: new PublicKey(
            "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
          ),
          systemProgram: SystemProgram.programId,
        })
        .signers([nonOwner])
        .rpc();
    } catch (error) {
      assert.isNotNull(error, "Error should be NotNodeOwner for non-owner");
    }
    // Verify the node account still exists
    const nodeAccountInfo = await provider.connection.getAccountInfo(nodePda);
    assert.isNotNull(
      nodeAccountInfo,
      "Node account should still exist after failed deactivation"
    );
    //
    console.log(
      "✅ Successfully caught NotNodeOwner error for non-owner deactivation attempt!"
    );
  });
});
