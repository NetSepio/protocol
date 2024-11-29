import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ErebrusRegistry } from "../target/types/erebrus_registry";
import { PublicKey, SystemProgram, Keypair } from "@solana/web3.js";
import { assert } from "chai";

describe("erebrus_registry", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.ErebrusRegistry as Program<ErebrusRegistry>;

  // Initialize test accounts and variables
  let stateAccount: PublicKey;
  let authority: Keypair;
  let user: Keypair;
  let vpnNodePda: PublicKey;
  const userNodeNum = new anchor.BN(1);

  before(async () => {
    // Generate new keypairs for testing
    authority = anchor.web3.Keypair.generate();
    user = anchor.web3.Keypair.generate();

    // Airdrop SOL to test accounts
    await provider.connection.requestAirdrop(
      authority.publicKey,
      10 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.requestAirdrop(
      user.publicKey,
      10 * anchor.web3.LAMPORTS_PER_SOL
    );

    // Derive state account PDA
    const [statePda] = await PublicKey.findProgramAddress(
      [Buffer.from("state")],
      program.programId
    );
    stateAccount = statePda;

    // Derive VPN node PDA
    const [vpnPda] = await PublicKey.findProgramAddress(
      [
        Buffer.from("vpn"),
        user.publicKey.toBuffer(),
        userNodeNum.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );
    vpnNodePda = vpnPda;
  });

  describe("Initialize Tests", () => {
    it("Successfully initializes the registry", async () => {
      // Initialize registry
      const tx = await program.methods
        .initialize()
        .accounts({
          state: stateAccount,
          authority: authority.publicKey,
        })
        .signers([authority])
        .rpc();

      // Fetch the state account and verify initialization
      const state = await program.account.state.fetch(stateAccount);

      assert.ok(
        state.authority.equals(authority.publicKey),
        "Authority not set correctly"
      );
      assert.equal(
        state.currentWifiNode.toString(),
        "0",
        "WiFi node counter not initialized to 0"
      );
      assert.equal(
        state.currentVpnNode.toString(),
        "0",
        "VPN node counter not initialized to 0"
      );
    });

    it("Fails to initialize registry twice", async () => {
      try {
        await program.methods
          .initialize()
          .accounts({
            state: stateAccount,
            authority: authority.publicKey,
          })
          .signers([authority])
          .rpc();
        assert.fail("Should not allow second initialization");
      } catch (err) {
        assert.ok(err.toString().includes("Error"));
      }
    });

    it("Fails to initialize with wrong signer", async () => {
      const wrongAuthority = anchor.web3.Keypair.generate();
      try {
        await program.methods
          .initialize()
          .accounts({
            state: stateAccount,
            authority: wrongAuthority.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([wrongAuthority])
          .rpc();
        assert.fail("Should not allow initialization from wrong authority");
      } catch (err) {
        assert.ok(err.toString().includes("Error"));
      }
    });
  });

  describe("Register VPN Node Tests", () => {
    it("Successfully registers a VPN node", async () => {
      // Test data for VPN node
      const testData = {
        peaqDid: "did:peaq:test123",
        nodename: "test-vpn-1",
        ipaddress: "192.168.1.100",
        ispinfo: "Test ISP",
        region: "US-East",
        location: "New York",
      };

      // Register VPN node
      const tx = await program.methods
        .registerVpnNode(
          userNodeNum,
          testData.peaqDid,
          testData.nodename,
          testData.ipaddress,
          testData.ispinfo,
          testData.region,
          testData.location
        )
        .accounts({
          state: stateAccount,
          vpnNode: vpnNodePda,
          user: user.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      // Fetch and verify VPN node account
      const vpnNode = await program.account.vpnNode.fetch(vpnNodePda);

      assert.equal(vpnNode.peaqDid, testData.peaqDid, "Incorrect peaqDid");
      assert.equal(vpnNode.nodename, testData.nodename, "Incorrect nodename");
      assert.equal(
        vpnNode.ipaddress,
        testData.ipaddress,
        "Incorrect IP address"
      );
      assert.equal(vpnNode.ispinfo, testData.ispinfo, "Incorrect ISP info");
      assert.equal(vpnNode.region, testData.region, "Incorrect region");
      assert.equal(vpnNode.location, testData.location, "Incorrect location");
      assert.equal(vpnNode.status, 0, "Initial status should be 0");
      assert.equal(
        vpnNode.canClose,
        false,
        "Node should not be closeable initially"
      );
      assert.ok(vpnNode.user.equals(user.publicKey), "Incorrect user pubkey");
    });

    it("Fails to register VPN node with invalid data lengths", async () => {
      // Test data with invalid lengths
      const invalidData = {
        peaqDid: "d".repeat(51), // Exceeds max length of 50
        nodename: "test-vpn-1",
        ipaddress: "192.168.1.100",
        ispinfo: "Test ISP",
        region: "US-East",
        location: "New York",
      };

      try {
        await program.methods
          .registerVpnNode(
            new anchor.BN(2), // Different node number
            invalidData.peaqDid,
            invalidData.nodename,
            invalidData.ipaddress,
            invalidData.ispinfo,
            invalidData.region,
            invalidData.location
          )
          .accounts({
            state: stateAccount,
            vpnNode: vpnNodePda,
            user: user.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([user])
          .rpc();
        assert.fail("Should not allow registration with invalid data lengths");
      } catch (err) {
        assert.ok(err.toString().includes("Error"));
      }
    });

    it("Fails to register same VPN node twice", async () => {
      const testData = {
        peaqDid: "did:peaq:test123",
        nodename: "test-vpn-1",
        ipaddress: "192.168.1.100",
        ispinfo: "Test ISP",
        region: "US-East",
        location: "New York",
      };

      try {
        await program.methods
          .registerVpnNode(
            userNodeNum, // Same node number as first registration
            testData.peaqDid,
            testData.nodename,
            testData.ipaddress,
            testData.ispinfo,
            testData.region,
            testData.location
          )
          .accounts({
            state: stateAccount,
            vpnNode: vpnNodePda,
            user: user.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([user])
          .rpc();
        assert.fail("Should not allow duplicate registration");
      } catch (err) {
        assert.ok(err.toString().includes("Error"));
      }
    });

    it("Verifies VPN node counter increment", async () => {
      const state = await program.account.state.fetch(stateAccount);
      assert.equal(
        state.currentVpnNode.toString(),
        "1",
        "VPN node counter should be incremented"
      );
    });
  });
});
