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
import { json } from "stream/consumers";

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
  const keypairPath = './Keypair.json';
  
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


  async function getNodeData(program, nodeId) {
    try {
      console.log("Getting Node Data for ", nodeId)
      const [nodePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("erebrus"), Buffer.from(nodeId)],
        program.programId
      );
     
      const nodeAccount = await program.account.node.fetch(nodePda);
      console.log("The node details of ",nodeId," :");
      const summary = {
        action: "getNodeData",
        success: true,
        message: "Node data fetched successfully",
        data: nodeAccount,
      };
      console.log(JSON.stringify(summary, null, 2));
      
    }catch(error){
      const summary = {
        action: "getNodeData",
        success: false,
        message: "Failed to fetch node data",
        error: error.message,
      };
      console.log(JSON.stringify(summary, null, 2))
    }
  } 

  async function registerNode(program,wallet, args) {
        try {
          if (args.length !== 9) {
            throw new Error(
              "Usage: node netsepiov1.js registerNode <nodeId> <name> <nodeType> <config> <ipaddress> <region> <location> <metadata> <owner>"
            );
          }

        const [
          nodeId,
          name,
          nodeType,
          config,
          ipaddress,
          region,
          location,
          metadata,
          owner
        ] = args;

        // Validate arguments
        if (!nodeId || !name || !nodeType || !ipaddress || !region || !location || !metadata || !owner) {
          throw new Error("All required node parameters must be provided.");
        }

        const ownerString = new PublicKey(owner)

        const nodeData = {
          id: nodeId,
          name,
          nodeType,
          config,
          ipaddress,
          region,
          location,
          metadata,
          owner: ownerString
        };

        console.log("Node Registration Intialization....");
        // Register the node
        const tx = await program.methods
          .registerNode(
            nodeId,
            nodeData.name,
            nodeData.nodeType,
            nodeData.config,
            nodeData.ipaddress,
            nodeData.region,
            nodeData.location,
            nodeData.metadata,
            nodeData.owner // Pass owner as string
          )
          .accounts({
            payer: wallet.publicKey,
          })
          .rpc();
          console.log("Node Registration Completed for ", nodeId)

          const summary = {
            action: "registerNode",
            success: true,
            message: "Node registered successfully",
            data: {
              nodeId,
              nodeData: {
                ...nodeData,
                owner: nodeData.owner.toString(),
              },
              transaction: tx,
            },
          };
        // Log the summary as JSON
        console.log(JSON.stringify(summary, null, 2));

      }catch(error){
        const summary =  {
          action: "registerNode",
          success: false,
          message: "Failed to register node",
          error: error.message,
        };
        console.log(JSON.stringify(summary, null, 2))
      }
  }

  async function createCheckpoint(program, wallet, nodeId, checkpointData) {
    const [nodePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("erebrus"), Buffer.from(nodeId)],
        program.programId
      );

    try {
      console.log("Creating checkpoint ...");
      const tx = await program.methods
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
          nodeId,
          checkpointData: checkpointData,
          transaction: tx,
        },
      };
      console.log(JSON.stringify(summary, null, 2));
      
    } catch (error) {
          const summary =  {
          action: "createCheckpoint",
          success: false,
          message: "Failed to create checkpoint",
          error: error.message,
        };
        console.log(JSON.stringify(summary, null, 2))
    }
  }

  async function deactivateNode(program, wallet, nodeId , collectionKey) {
    const [nodePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("erebrus"), Buffer.from(nodeId)],
        program.programId
      );
      /// Fetching Nft Asset Public Key from the node
      const asset = nodePda.asset

    try {
      console.log("Deactivating node...");    
       const tx = await program.methods
        .deactivateNode(nodeId)
        .accountsPartial({
          node: nodePda,
          payer: wallet.publicKey,
          asset: asset,
          collection: collectionKey,
          mplCoreProgram: new PublicKey(
            "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
          ),
          systemProgram: SystemProgram.programId,
        })
        .signers([wallet])
        .rpc();

      await provider.connection.confirmTransaction(tx);

      const summary = {
        action: "deactivateNode",
        success: true,
        message: "Node deactivated successfully",
        data: {
          nodeId,
          assetInfo: {
            collectionKey: collectionKey,
            asset: asset,
          },
          transaction: tx,
        },
      };
      console.log(JSON.stringify(summary, null, 2));

      } catch (error) {
      const summary =  {
        action: "deactivateNode",
        success: false,
        message: "Failed to deactivate node",
        error: error.message,
      };
      console.log(JSON.stringify(summary, null, 2))
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
      console.log("Using wallet address:", wallet.publicKey.toString());

      const balance = await checkBalance(connection, wallet.publicKey);
      console.log("Wallet balance:", balance, "SOL");
  
      
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
        case "registerNode":
          await registerNode(program, wallet ,args);
          break;
        case "get":
          await getNodeData(program, args[0]);
          break;
        case "createCheckpoint":
          await createCheckpoint(program, wallet, args[0] , args[1]);
          break;
        case "deactivateNode":
          await deactivateNode(program, wallet, args[0]);
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