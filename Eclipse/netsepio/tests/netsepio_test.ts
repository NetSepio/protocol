import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Netsepio } from "../target/types/netsepio";
import fs from "fs";
import os from "os";
import path from "path";

import {
  PublicKey,
  Connection,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import { assert } from "chai";

describe("netsepio", async () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Netsepio as Program<Netsepio>;

  // Test data
  const testNode = {
    id: "test-node-1",
    name: "Test Node",
    nodeType: "validator",
    config: "test-config",
    ipaddress: "192.168.1.1",
    region: "US-East",
    location: "New York",
    metadata: "test-metadata",
  };

  // Test data 2
  const testNode2 = {
    id: "test-node-2",
    name: "Test Node 2",
    nodeType: "validator 2",
    config: "test-config-2",
    ipaddress: "192.168.1.2",
    region: "US-East",
    location: "New York",
    metadata: "test-metadata",
  };

  /// Set the SOLANA_CONNECTION to the local validator
  const TEST_VALIDATOR_RPC_URL = "http://127.0.0.1:8899";
  const SOLANA_CONNECTION = new Connection(TEST_VALIDATOR_RPC_URL);

  const homeDir = os.homedir();
  const keypairPath = path.join(homeDir, ".config", "solana", "id.json");
  let keypairJson;

  try {
    // Read the keypair file
    const keypairData = fs.readFileSync(keypairPath, "utf-8");
    keypairJson = JSON.parse(keypairData);
    console.log("Keypair loaded successfully!");
  } catch (error) {
    console.error("Error reading keypair:", error.message);
  }

  const transferSol = async (to: PublicKey) => {
    const adminWallet = anchor.web3.Keypair.fromSecretKey(
      new Uint8Array(keypairJson)
    );
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: adminWallet.publicKey,
        toPubkey: to,
        lamports: 10 * LAMPORTS_PER_SOL,
      })
    );
    return await sendAndConfirmTransaction(SOLANA_CONNECTION, tx, [
      adminWallet,
    ]);
  };

  // Store some test accounts
  const admin = provider.wallet;
  const operator = anchor.web3.Keypair.generate();
  const user = anchor.web3.Keypair.generate();

  const [authorityPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("erebrus"), admin.publicKey.toBuffer()],
    program.programId
  );

  it("Should not allow non-admin to initialize authority", async () => {
    console.log("Transferring SOL to user ..... 🚚🚚");
    await transferSol(user.publicKey);
    console.log("Initializing authority");
    try {
      await program.methods
        .intializeAuthority()
        .accounts({
          user: user.publicKey,
        })
        .signers([user])
        .rpc();
      assert(false, "should've failed but didn't ");
    } catch (error) {
      console.log("Message: ", error.message);
    }
  });

  it("Should successfully initialize authority when called by admin", async () => {
    // Initialize authority
    const tx = await program.methods
      .intializeAuthority()
      .accounts({
        user: admin.publicKey,
      })
      .rpc();
    console.log("Transaction Signature", tx);

    // Fetch the created authority account
    const authorityAccount = await program.account.authority.fetch(
      authorityPDA
    );
    // Verify the authority was set correctly
    assert.equal(authorityAccount.admin.toBase58(), admin.publicKey.toBase58());
    assert.equal(
      authorityAccount.operator.toBase58(),
      admin.publicKey.toBase58()
    );

    console.log("✅ Authority initialized successfully by admin");
  });

  it("Should update authority", async () => {
    await program.methods.updateAuthority(operator.publicKey).rpc();
    console.log("Successfully updated authority 🎉");
    const [authorityPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("erebrus"), admin.publicKey.toBuffer()],
      program.programId
    );
    const authorityAccount = await program.account.authority.fetch(
      authorityPDA
    );
    assert.equal(
      authorityAccount.operator.toBase58(),
      operator.publicKey.toBase58()
    );
  });

  it("Violate Update Authority", async () => {
    try {
      await program.methods
        .updateAuthority(user.publicKey)
        .accounts({
          user: user.publicKey,
        })
        .rpc();
      console.log("It should have failed but didn't");
    } catch (error) {
      console.log("Message : ", error.message);
    }
  });

  // Add these to your existing test file
  it("Should register node when called by operator", async () => {
    console.log("Transferring SOL to user ..... 🚚🚚");
    await transferSol(operator.publicKey);
    console.log("SOL transferred successfully");

    console.log("Registering node by operator...");
    let id = Math.floor(Math.random() * 1000000).toString();
    console.log("Id: ", id);

    const [authorityPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("erebrus"), admin.publicKey.toBuffer()],
      program.programId
    );
    const [nodePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("erebrus"), Buffer.from(id)],
      program.programId
    );

    const nodeAddress = anchor.web3.Keypair.generate().publicKey;
    const tx = await program.methods
      .registerNode(
        id,
        nodeAddress, // address
        testNode.name,
        testNode.nodeType,
        testNode.config,
        testNode.ipaddress,
        testNode.region,
        testNode.location,
        testNode.metadata,
        user.publicKey // owner
      )
      .accounts({
        user: operator.publicKey,
        authority: authorityPDA,
      })
      .signers([operator])
      .rpc();
    console.log("Transaction signature:", tx);
    const nodeAccount = await program.account.node.fetch(nodePDA);

    // Verify the authority was set correctly
    assert.equal(nodeAccount.id, id);
    assert.equal(nodeAccount.address.toBase58(), nodeAddress.toBase58());
    assert.equal(nodeAccount.name, testNode.name);
    assert.equal(nodeAccount.nodeType, testNode.nodeType);
    assert.equal(nodeAccount.config, testNode.config);
    assert.equal(nodeAccount.ipaddress, testNode.ipaddress);
    assert.equal(nodeAccount.region, testNode.region);
    assert.equal(nodeAccount.location, testNode.location);
    assert.equal(nodeAccount.metadata, testNode.metadata);
    assert.equal(nodeAccount.owner.toBase58(), user.publicKey.toBase58());
    assert.equal(nodeAccount.status, 0);
  });
  it("Should not allow duplicate node registration", async () => {
    const [authorityPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("erebrus"), admin.publicKey.toBuffer()],
      program.programId
    );
    const nodeAddress = anchor.web3.Keypair.generate().publicKey;
    try {
      await program.methods
        .registerNode(
          testNode.id,
          nodeAddress,
          testNode.name,
          testNode.nodeType,
          testNode.config,
          testNode.ipaddress,
          testNode.region,
          testNode.location,
          testNode.metadata,
          user.publicKey
        )
        .accounts({
          user: operator.publicKey,
          authority: authorityPDA,
        })
        .signers([operator])
        .rpc();
      console.log("It should have failed but didn't");
    } catch (error) {
      console.log("Already Intialized before");
    }
  });
  it("Should not allow non-operator node registration", async () => {
    const [authorityPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("erebrus"), admin.publicKey.toBuffer()],
      program.programId
    );
    const nodeAddress = anchor.web3.Keypair.generate().publicKey;

    try {
      await program.methods
        .registerNode(
          testNode2.id,
          nodeAddress,
          testNode2.name,
          testNode2.nodeType,
          testNode2.config,
          testNode2.ipaddress,
          testNode2.region,
          testNode2.location,
          testNode2.metadata,
          user.publicKey
        )
        .accounts({
          user: user.publicKey,
          authority: authorityPDA,
        })
        .signers([user])
        .rpc();
      console.log("It should have failed but didn't");
    } catch (error) {
      console.log("Non Operator cannot register node");
    }
  });
  it("Should update node status", async () => {
    await program.methods
      .updateNodeStatus(testNode.id, 1)
      .accounts({
        user: operator.publicKey,
      })
      .signers([operator])
      .rpc();
    console.log("Node status updated successfully");
    const [nodePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("erebrus"), Buffer.from(testNode.id)],
      program.programId
    );
    const nodeAccount = await program.account.node.fetch(nodePDA);
    assert.equal(nodeAccount.status, 1);
  });

  it("Should not allow invalid status update", async () => {
    try {
      await program.methods
        .updateNodeStatus(testNode.id, 10)
        .accounts({
          user: operator.publicKey,
        })
        .signers([operator])
        .rpc();
      console.log("It should have failed but didn't");
    } catch (error) {
      console.log("Invalid status update");
    }
  });

  it(" Should create checkpoint", async () => {
    const data = "test-data";
    await program.methods
      .createCheckpoint(user.publicKey, testNode.id, data)
      .accounts({
        user: operator.publicKey,
        authority: authorityPDA,
      })
      .signers([operator])
      .rpc();
    console.log("Checkpoint 1 created successfully");
    const [checkpointPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("erebrus"),
        user.publicKey.toBuffer(),
        Buffer.from(testNode.id),
      ],
      program.programId
    );
    const checkpointAccount = await program.account.checkpoint.fetch(
      checkpointPDA
    );
    assert.equal(checkpointAccount.data, data);
    console.log("Again giving data");
    const data2 = "test-data2";
    await program.methods
      .createCheckpoint(user.publicKey, testNode.id, data2)
      .accounts({
        user: operator.publicKey,
        authority: authorityPDA,
      })
      .signers([operator])
      .rpc();
    console.log("Checkpoint 2 created successfully");
    const checkpointAccount2 = await program.account.checkpoint.fetch(
      checkpointPDA
    );
    assert.equal(checkpointAccount2.data, data2);
  });
  it("Should not allow non-owner to create checkpoint", async () => {
    const data = "test-data1";
    try {
      await program.methods
        .createCheckpoint(user.publicKey, testNode.id, data)
        .signers([user])
        .rpc();
      console.log("It should have failed but didn't");
    } catch (error) {
      console.log("Non Owner cannot create checkpoint");
    }
  });
  it("Deactivate Node", async () => {
    const nodeAddress = anchor.web3.Keypair.generate().publicKey;
    let id = Math.floor(Math.random() * 1000000).toString();
    console.log("Id: ", id);
    await program.methods
      .registerNode(
        id,
        nodeAddress,
        testNode2.name,
        testNode2.nodeType,
        testNode2.config,
        testNode2.ipaddress,
        testNode2.region,
        testNode2.location,
        testNode2.metadata,
        user.publicKey
      )
      .accounts({
        user: operator.publicKey,
        authority: authorityPDA,
      })
      .signers([operator])
      .rpc();
    console.log("New Node registered successfully");
    const [nodePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("erebrus"), Buffer.from(id)],
      program.programId
    );
    const nodeAccount = await program.account.node.fetch(nodePDA);
    assert.equal(nodeAccount.id, id);

    /// DEACTIVATE NODE
    await program.methods
      .deactivateNode(id)
      .accounts({
        user: operator.publicKey,
      })
      .signers([operator])
      .rpc();
    console.log("Node deactivated successfully");
    try {
      await program.account.node.fetch(nodePDA);
      console.log("It should have failed but didn't");
    } catch (error) {
      console.log("Node already deactivated");
    }
  });
});
