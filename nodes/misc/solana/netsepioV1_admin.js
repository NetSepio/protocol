import {
  Connection,
  PublicKey,
  Keypair,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import fs from "fs";
import path from "path";
import idl from "./idl.json" with { type: "json" };


  // Helper function to check wallet balance
  async function checkBalance(connection, publicKey) {
    try {
      const balance = await connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error("Error checking balance:", error.message);
      return 0;
    }
  }

  // Add this function at the top of your file
function loadOrCreateKeypair() {
  const keypairPath = './AdminKeypair.json';
  
  try {
    // Check if Keypair.json exists
    if (fs.existsSync(keypairPath)) {
      const keypairData = JSON.parse(fs.readFileSync(keypairPath));
      return Keypair.fromSecretKey(new Uint8Array(keypairData));
    }
    
    // If file doesn't exist, create new keypair
    const newKeypair = Keypair.generate();
    
    // Save the new keypair to file
    fs.writeFileSync(keypairPath, JSON.stringify(Array.from(newKeypair.secretKey)));
    console.log("New keypair created and saved to Keypair.json");
    
    return newKeypair;
  } catch (error) {
    console.error("Error handling keypair:", error);
    throw error;
  }
}

async function loadorCreateKeypairCollection(program, wallet) {
const keypairPath = './CollectionKeypair.json';
  try {
    // Check if Keypair.json exists
    if (fs.existsSync(keypairPath)) {
      const keypairData = JSON.parse(fs.readFileSync(keypairPath));
      return Keypair.fromSecretKey(new Uint8Array(keypairData));
    }
    
    // If file doesn't exist, create new keypair
    const newKeypair = Keypair.generate();
    
    // Save the new keypair to file
    fs.writeFileSync(keypairPath, JSON.stringify(Array.from(newKeypair.secretKey)));
    console.log("New keypair created and saved to Keypair.json");
    
    return newKeypair;
  } catch (error) {
    console.error("Error handling keypair:", error);
    throw error;
  }  
  
}

  // Load or create asset keypair and save to AssetsKeypair.json
async function loadOrCreateAssetKeypair(nodeId) {
  const keypairPath = "./AssetsKeypair.json";
  try {
    let keypairJson = { assets: {} };
    if (fs.existsSync(keypairPath)) {
      keypairJson = JSON.parse(fs.readFileSync(keypairPath));
    }

    let assetKeypair;
    if (keypairJson.assets[nodeId]) {
      assetKeypair = Keypair.fromSecretKey(new Uint8Array(keypairJson.assets[nodeId]));
      console.log(`Loaded asset keypair for node ${nodeId}:`, assetKeypair.publicKey.toString());
    } else {
      assetKeypair = Keypair.generate();
      console.log(`Generated new asset keypair for node ${nodeId}:`, assetKeypair.publicKey.toString());

      // Save to AssetsKeypair.json
      keypairJson.assets[nodeId] = Array.from(assetKeypair.secretKey);
      fs.writeFileSync(keypairPath, JSON.stringify(keypairJson, null, 2));
      console.log(`Saved asset keypair for node ${nodeId} to AssetsKeypair.json`);
    }
    
    return assetKeypair;
  } catch (error) {
    console.error(`Error handling asset keypair for node ${nodeId}:`, error);
    throw error;
  }
}


  async function createCollection(program, wallet, collectionName, collectionUri) {
    // Generate a keypair for the collection account
    const collectionKeypair = loadorCreateKeypairCollection(program, wallet);

    // TEST CASE 1: Calling Collection through admin
    console.log("Creating collection...");
    try {
      // Call the create_collection function
      const tx = await program.methods
        .createCollection(collectionName, collectionUri)
        .accountsPartial({
          authority: wallet.publicKey, // Admin account
          payer: wallet.publicKey, // Payer for transaction
          collection: collectionKeypair.publicKey, // Collection account
          mplCoreProgram: new PublicKey(
            "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
          ),
          systemProgram: SystemProgram.programId, // System Program
        })
        .signers([collectionKeypair]) // Sign with collection keypair
        .rpc();

        const summary = {
        action: "createCollection",
        success: true,
        message: "Collection created successfully",
        data: {
          collectionName: collectionName,
          collectionUri: collectionUri,
          collectionKey: collectionKeypair.publicKey,
          transaction: tx,
        },
      };
      console.log(JSON.stringify(summary, null, 2));
      
    } catch (error) {
      const summary = {
        action: "createCollection",
        success: false,
        message: "Error creating collection",
        error: error.message,
      };
      console.log(JSON.stringify(summary, null, 2));
    }
  }

  async function mintNFT(program, wallet, args) {
    try {
        if (args.length !== 5) {
          throw new Error(
              "Usage: node netsepiov1.js mintNFT <nodeId> <nftName> <nftUri> <owner> <collectionKey>"
            );
          }
        const [
          nodeId,
          name,
          uri,
          owner,
          collectionKey
        ] = args;

        const ownerPubkey = new PublicKey(owner);
        const assetKeypair = await loadOrCreateAssetKeypair(nodeId);

        console.log("The minting nft starts now...");
        const tx = await program.methods
          .mintNft(nodeId, name, uri)
          .accountsPartial({
            authority: wallet.publicKey,
            payer: wallet.publicKey,
            asset: assetKeypair.publicKey,
            owner: ownerPubkey,
            collection: new PublicKey(collectionKey),
            mplCoreProgram: new PublicKey("CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"),
            systemProgram: SystemProgram.programId,
          })
          .signers([assetKeypair])
          .rpc();

      const summary = {
          action: "mintNFT",
          success: true,
          message: "NFT minted successfully",
          data: {
            nodeId: nodeId,
            nftName: name,
            nftUri: uri,
            owner: owner,
            transaction: tx,
          },
        };
        console.log(JSON.stringify(summary, null, 2));  
      } catch(error) {
        const summary = {
          action: "mintNFT",
          success: false,
          message: "Error minting NFT",
          error: error.message,
        };
        console.log(JSON.stringify(summary, null, 2));
      }
  }

  async function createCheckpoint(program, wallet, nodeId, checkpointData) {
    const [nodePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("erebrus"), Buffer.from(nodeId)],
        program.programId
      );

    try {
      console.log("Creating checkpoint for node:", nodeId);

     await program.methods
      .createCheckpoint(nodeId, checkpointData)
      .accounts({
        payer: wallet.publicKey,
        node: nodePda,
      })
      .signers([wallet])
      .rpc();

      const summary = {
        action: "createCheckpoint",
        success: true,
        message: "Checkpoint created successfully",
        data: {
          nodeId: nodeId,
          checkpointData: checkpointData,
          transaction: tx,
        },
      };
      console.log(JSON.stringify(summary, null, 2));
    } catch (error) {
      const summary = {
        action: "createCheckpoint",
        success: false,
        message: "Error creating checkpoint",
        error: error.message,
      };
      console.log(JSON.stringify(summary, null, 2));
    }
  }

  async function updateMetadata(program, wallet, assetKeypair,collectionKey, newNftUri) {
    console.log("Updating NFT metadata ...");
    try {
      const updateTx = await program.methods
        .updateNodeMetadata(newNftUri)
        .accountsPartial({
          authority: wallet.publicKey,
          payer: wallet.publicKey,
          asset: assetKeypair.publicKey,
          collection: new PublicKey(collectionKey)  ,
          mplCoreProgram: new PublicKey(
            "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
          ),
          systemProgram: SystemProgram.programId,
        })
        .signers([assetKeypair]) // Add assetKeypair and collectionKeypair as signers
        .rpc();

        const summary = {
          action: "updateMetadata",
          success: true,
          message: "Metadata updated successfully",
          data: {
            transaction: updateTx,
            newNftUri: newNftUri,
          },
        };
      console.log(JSON.stringify(summary, null, 2));

    } catch (error) {
      const summary = {
        action: "updateMetadata",
        success: false,
        message: "Error updating metadata",
        error: error.message,
      };
      console.log(JSON.stringify(summary, null, 2));
    }
  }
  
  async function updateNodeStatus(program, wallet, nodeId, newStatus) {
    console.log("Updating node status ...");
    try {
     await program.methods
        .updateNodeStatus(nodeId, newStatus) // Try to set status to ONLINE
        .accounts({ payer: wallet.publicKey })
        .signers([wallet])
        .rpc();

      const summary = {
        action: "updateNodeStatus",
        success: true,
        message: "Node status updated successfully",
        data: { 
          nodeId: nodeId,
          newStatus: newStatus,
          transaction: updateTx,
        },
      };
      console.log(JSON.stringify(summary, null, 2));
    } catch (error) {
      const summary = {
        action: "updateNodeStatus",
        success: false,
        message: "Error updating node status",
        error: error.message,
      };  
      console.log(JSON.stringify(summary, null, 2));
    }
  }
  

  async function main() {
    try {
      // Connect to devnet
      const connection = new Connection(
        "https://api.devnet.solana.com",
        "confirmed"
      );
      console.log("Connected to Solana devnet");

      // Load or create keypair
      const wallet = loadOrCreateKeypair();
      // Check wallet balance
      const balance = await checkBalance(connection, wallet.publicKey);
      console.log("Wallet balance:", balance, "SOL");
  
      if ((balance < 1) && (connection.rpcEndpoint.includes("devnet") || connection.rpcEndpoint.includes("testnet"))) {
         // Fund the keypair with SOL
        const airdropAmount = 1 * LAMPORTS_PER_SOL;
        const airdropTx = await connection.requestAirdrop(
          wallet.publicKey,
          airdropAmount
        );
        await connection.confirmTransaction(airdropTx);

        // Check and log the balance
        const balanceInLamports = await connection.getBalance(
          wallet.publicKey
        );
        const balanceInSol = balanceInLamports / LAMPORTS_PER_SOL;
        console.log(
          `Keypair balance: ${balanceInSol} SOL (${balanceInLamports} lamports)`
        );
      }

      // Setup provider
      const provider = new AnchorProvider(
        connection,
        {
          publicKey: wallet.publicKey,
          signTransaction: async (tx) => {
            tx.partialSign(wallet);
            return tx;
          },
          signAllTransactions: async (txs) => {
            return txs.map((t) => {
              t.partialSign(wallet);
              return t;
            });
          },
        },
        { commitment: "confirmed" }
      );

      const program = new Program(idl, provider);

      const action = process.argv[2];
      console.log("Action: ", action);
      // Parse command-line arguments
      const args = process.argv.slice(3);

      switch(action){
        case "createCollection":
          await createCollection(program, wallet ,args[0], args[1]);
          break;
        case "mintNFT":
          await mintNFT(program, wallet, args);
          break;
        case "createCheckpoint":
          await createCheckpoint(program, wallet, args[0] , args[1]);
          break;
        case "updateMetadata":
          await updateMetadata(program, wallet, args[0], args[1]);
          break;
        case "updateNodeStatus":
          await updateNodeStatus(program, wallet, args[0], args[1]);
          break;
        default:
          throw new Error(`Invalid action:   ${action}`);
      }
    
    } catch (error) {
      console.error("Error:", error);
      if (error.logs) {
        console.error("Program logs:", error.logs);
      }
      
    }
  }

main();
