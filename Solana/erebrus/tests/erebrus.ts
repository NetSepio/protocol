import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ErebrusRegistry } from "../target/types/erebrus_registry";
import { PublicKey, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { assert, expect } from "chai";

describe("erebrus_registry", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.ErebrusRegistry as Program<ErebrusRegistry>;

  // Test accounts
  const authority = Keypair.generate();
  const user = Keypair.generate();
  let statePDA: PublicKey;
  let wifiNodePDA: PublicKey;

  // Test data
  const testWifiNode = {
    deviceId: "device123",
    peaqDid: "did:peaq:123",
    ssid: "TestWiFi",
    location: "Test Location",
    pricePerMinute: new anchor.BN(1000), // 1000 lamports per minute
  };

  before(async () => {
    // Airdrop SOL to authority and user for transactions
    const authorityAirdrop = await provider.connection.requestAirdrop(
      authority.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(authorityAirdrop);

    const userAirdrop = await provider.connection.requestAirdrop(
      user.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(userAirdrop);

    // Find PDA for state account
    [statePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("state")],
      program.programId
    );

    // Find PDA for wifi node
    [wifiNodePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("wifi_node"), user.publicKey.toBuffer()],
      program.programId
    );
  });

  it("Initialize program state", async () => {
    try {
      await program.methods
        .initialize()
        .accounts({
          state: statePDA,
          authority: authority.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([authority])
        .rpc();

      // Fetch the state account and verify initialization
      const stateAccount = await program.account.state.fetch(statePDA);
      expect(stateAccount.authority.toString()).to.equal(
        authority.publicKey.toString()
      );
      expect(stateAccount.currentWifiNode.toString()).to.equal("0");
      expect(stateAccount.currentVpnNode.toString()).to.equal("0");
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  });

  it("Register WiFi node", async () => {
    try {
      await program.methods
        .registerWifiNode(
          testWifiNode.deviceId,
          testWifiNode.peaqDid,
          testWifiNode.ssid,
          testWifiNode.location,
          testWifiNode.pricePerMinute
        )
        .accounts({
          state: statePDA,
          wifiNode: wifiNodePDA,
          user: user.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      // Fetch and verify the registered node
      const wifiNode = await program.account.wifiNode.fetch(wifiNodePDA);
      expect(wifiNode.user.toString()).to.equal(user.publicKey.toString());
      expect(wifiNode.deviceId).to.equal(testWifiNode.deviceId);
      expect(wifiNode.ssid).to.equal(testWifiNode.ssid);
      expect(wifiNode.isActive).to.be.true;
      expect(wifiNode.canClose).to.be.false;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  });

  it("Deactivate WiFi node", async () => {
    try {
      await program.methods
        .deactivateNode()
        .accounts({
          wifiNode: wifiNodePDA,
          authority: authority.publicKey,
          state: statePDA,
        })
        .signers([authority])
        .rpc();

      // Verify node is deactivated
      const wifiNode = await program.account.wifiNode.fetch(wifiNodePDA);
      expect(wifiNode.isActive).to.be.false;
      expect(wifiNode.canClose).to.be.true;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  });

  it("Close WiFi node and recover lamports", async () => {
    try {
      // Get user's balance before closing node
      const balanceBefore = await provider.connection.getBalance(
        user.publicKey
      );

      await program.methods
        .closeNode()
        .accounts({
          wifiNode: wifiNodePDA,
          user: user.publicKey,
        })
        .signers([user])
        .rpc();

      // Get user's balance after closing node
      const balanceAfter = await provider.connection.getBalance(user.publicKey);

      // Verify the account is closed by attempting to fetch it
      try {
        await program.account.wifiNode.fetch(wifiNodePDA);
        assert.fail("Account should be closed");
      } catch (error) {
        expect(error.toString()).to.include("Account does not exist");
      }

      // Verify user received lamports back
      expect(balanceAfter).to.be.greaterThan(balanceBefore);
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  });

  it("Fail to close active node", async () => {
    // First register a new node
    const newNodePDA = PublicKey.findProgramAddressSync(
      [Buffer.from("wifi_node"), user.publicKey.toBuffer(), Buffer.from("2")],
      program.programId
    )[0];

    await program.methods
      .registerWifiNode(
        testWifiNode.deviceId,
        testWifiNode.peaqDid,
        testWifiNode.ssid,
        testWifiNode.location,
        testWifiNode.pricePerMinute
      )
      .accounts({
        state: statePDA,
        wifiNode: newNodePDA,
        user: user.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    // Try to close without deactivating
    try {
      await program.methods
        .closeNode()
        .accounts({
          wifiNode: newNodePDA,
          user: user.publicKey,
        })
        .signers([user])
        .rpc();

      assert.fail("Should not be able to close active node");
    } catch (error) {
      expect(error.toString()).to.include("NodeStillActive");
    }
  });

  it("Unauthorized user cannot deactivate node", async () => {
    const unauthorized = Keypair.generate();

    // Airdrop some SOL to unauthorized user
    const airdrop = await provider.connection.requestAirdrop(
      unauthorized.publicKey,
      LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdrop);

    try {
      await program.methods
        .deactivateNode()
        .accounts({
          wifiNode: wifiNodePDA,
          authority: unauthorized.publicKey,
          state: statePDA,
        })
        .signers([unauthorized])
        .rpc();

      assert.fail("Unauthorized user should not be able to deactivate node");
    } catch (error) {
      expect(error.toString()).to.include("Unauthorized");
    }
  });
});
