import {
  Connection,
  PublicKey,
  Keypair,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import dotenv from "dotenv";
dotenv.config();

import idl from "./idl.json" with { type: "json" };

  function getClusterUrl(cluster) {
    switch(cluster){
      case "DEVNET":
        return "https://api.devnet.solana.com"
      case "TESTNET":
        return "https://api.testnet.solana.com"
      case  "LOCALNET":
        return "http://127.0.0.1:8899"
      case "CUSTOM":
        return process.env.CUSTOM_RPC
      default:
        throw new Error("Invalid cluster");
    }
  }


  /************ GETTER FUNCTIONS ************/
  async function checkBalance(connection, publicKey) {
    try {
      const balance = await connection.getBalance(publicKey);
      const summary = {
        action: "checkBalance",
        success: true,
        message: "Balance checked successfully",
        data:{
          balance: balance,
          balanceInSol: balance / LAMPORTS_PER_SOL,
        },
      };
      console.log(JSON.stringify(summary, null, 2));
    } catch (error) {
      console.error("Error checking balance:", error.message);
      return 0;
    }
  }

  async function getNodeData(program, nodeId) {
    try {
      const [nodePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("netsepio"), Buffer.from(nodeId)],
        program.programId
      );
     
      const nodeAccount = await program.account.node.fetch(nodePda);
      const summary = {
        action: "getNodeData",
        success: true,
        message: "Node data fetched successfully",
        data:{ 
          nodeData: nodeAccount,
        },
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

  /************ UTILITY FUNCTIONS ************/

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
        [Buffer.from("netsepio"), Buffer.from(nodeId)],
        program.programId
      );

    try {
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

  async function deactivateNode(program, wallet, nodeId, collectionKey) {
    const [nodePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("netsepio"), Buffer.from(nodeId)],
        program.programId
      );
      const pdaData = await program.account.node.fetch(nodePda);
      /// Fetching Nft Asset Public Key from the node
      const asset = pdaData.asset
    try {
       const tx = await program.methods
        .deactivateNode(nodeId)
        .accountsPartial({
          node: nodePda,
          payer: wallet.publicKey,
          asset: new PublicKey(asset),
          collection: new PublicKey(collectionKey),
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
            asset: asset,
            transaction: tx
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

  async function forceDeactivate(program, wallet, nodeId) {
    try {
      console.log(`Force Deactivating node for ${nodeId} ...`);

      const [nodePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("netsepio"), Buffer.from(nodeId)],
        program.programId
      );

      await program.methods
        .forceDeactivateNode(nodeId)
        .accountsPartial({
          node: nodePda,
          payer: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([wallet])
        .rpc();

     const summary = {
      action: "forceDeactivate",
      success: true,
      message: "Node force deactivated successfully",
      data: {
        nodeId,
        transaction: tx,
      },
    };
    console.log(JSON.stringify(summary, null, 2));

    } catch (error) {
      const summary = {
        action: "forceDeactivate",
        success: false,
        message: "Failed to force deactivate node",
        error: error.message,
      };
      console.log(JSON.stringify(summary, null, 2));
    }
  }
  
  
  async function main() {
    const CLUSTER = process.env.CLUSTER
    try {
      // Connect to a specific cluster
      const connection = new Connection(
        getClusterUrl(CLUSTER.toUpperCase()),
        "confirmed"
      );
      console.log("Connected to Solana Cluster : ", CLUSTER.toUpperCase());

      // Load or create keypair 
      const keypairData = JSON.parse(process.env.USER_KEY);
      const secretKey = Uint8Array.from(keypairData);
      const keypair = Keypair.fromSecretKey(secretKey);
      // Check wallet balance
      console.log("Using wallet address:", keypair.publicKey.toString());
      // Setup provider
      const provider = new AnchorProvider(
        connection,
        {
          publicKey: keypair.publicKey,
          signTransaction: async (tx) => {
            tx.partialSign(keypair);
            return tx;
          },
          signAllTransactions: async (txs) => {
            return txs.map((t) => {
              t.partialSign(keypair);
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
          await registerNode(program, keypair ,args);
          break;
        case "getNodeData":
          await getNodeData(program, args[0]);
          break;
        case "createCheckpoint":
          await createCheckpoint(program, keypair, args[0] , args[1]);
          break;
        case "deactivateNode":
          await deactivateNode(program, keypair, args[0],args[1],args[2]);
          break;
        case "forceDeactivate":
          await forceDeactivate(program, keypair, args[0]);
          break;
        case "checkBalance":
            await checkBalance(connection, keypair.publicKey);
            break;
        default:
          throw new Error(`Invalid action`);
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  }
  
main();