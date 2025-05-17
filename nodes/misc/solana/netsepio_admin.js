///  NETSEPIO ADMIN SCRIPT 

import {
  Connection,
  PublicKey,
  Keypair,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { publicKey } from "@metaplex-foundation/umi"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  mplCore,
  fetchAsset,
  fetchCollection,
} from "@metaplex-foundation/mpl-core";

import idl from "./idl.json" with { type: "json" };
import dotenv from "dotenv";
dotenv.config();

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

  /************ UTILITY FUNCTIONS ************/
  async function intializeGlobalConfig(program, keypair) {
    try {
      // Call the intialize_global_config function
       const tx = await program.methods
        .intializeGlobalConfig()
        .accounts({ payer: keypair.publicKey })
        .rpc();

      const summary = {
        action: "intializeGlobalConfig",
        success: true,
        message: "Global config initialized successfully",
        data: {
            transaction: tx
        }
      };
      console.log(JSON.stringify(summary, null, 2));

    } catch (error) {
      const summary = {
        action: "intializeGlobalConfig",
        success: false,
        message: "Error initializing global config or config already exists",
        error: error.message,
      };
      console.log(JSON.stringify(summary, null, 2));
    }
  }

  async function createCollection(program, keypair, collectionName, collectionUri) {
    // Generate a keypair for the collection account
    const collectionKeypair = Keypair.generate();
    // TEST CASE 1: Calling Collection through admin
    try {
      // Call the create_collection function
      const tx = await program.methods
        .createCollection(collectionName, collectionUri)
        .accountsPartial({
          authority: keypair.publicKey, // Admin account
          payer: keypair.publicKey, // Payer for transaction
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
          collectionKeypair: Array.from(collectionKeypair.secretKey),
          collectionKey: collectionKeypair.publicKey.toBase58(),
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

  async function mintNFT(program,keypair, args) {  
    try {
        if (args.length !== 4) {
          throw new Error(
              "Usage: node netsepiov1.js mintNFT <nodeId> <nftName> <nftUri> <owner> "
            );
          }
        const [
          nodeId,
          name,
          uri,
          owner,
        ] = args;

       const [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("netsepio"), keypair.publicKey.toBuffer()],
      program.programId);

      const configPdaData = await program.account.globalConfig.fetch(configPda);
      
        const ownerPubkey = new PublicKey(owner);
        const assetKeypair = Keypair.generate();

        const tx = await program.methods
          .mintNft(nodeId, name, uri)
          .accountsPartial({
            authority: keypair.publicKey,
            payer: keypair.publicKey,
            asset: assetKeypair.publicKey,
            owner: ownerPubkey,
            collection: new PublicKey(configPdaData.collection),
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
            assetKeypair: assetKeypair.publicKey.toBase58(),
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

  async function createCheckpoint(program, keypair, nodeId, checkpointData) {
    const [nodePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("netsepio"), Buffer.from(nodeId)],
        program.programId
      );

    try {
      const tx = await program.methods
      .createCheckpoint(nodeId, checkpointData)
      .accounts({
        payer: keypair.publicKey,
        node: nodePda,
      })
      .signers([keypair])
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

  async function updateMetadata(program, keypair, nodeId, newNftUri) {
    try {
      const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("netsepio"), Buffer.from(nodeId)],
      program.programId);
      const pdaData = await program.account.node.fetch(pda);
        
      const [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("netsepio"), keypair.publicKey.toBuffer()],
      program.programId);

      const configPdaData = await program.account.globalConfig.fetch(configPda);

      const updateTx = await program.methods
        .updateNodeMetadata(newNftUri)
        .accountsPartial({
          authority: keypair.publicKey,
          payer: keypair.publicKey,
          asset: new PublicKey(pdaData.asset),
          collection: new PublicKey(configPdaData.collection),
          mplCoreProgram: new PublicKey(
            "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
          ),
          systemProgram: SystemProgram.programId,
        })
        .rpc();

        const summary = {
          action: "updateMetadata",
          success: true,
          message: "Metadata updated successfully",
          data: {
            newNftUri: newNftUri,
            transaction: updateTx,
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
  
  async function updateNodeStatus(program, keypair, nodeId, newStatus) {
    if (![1, 2, 3].includes(Number(newStatus))) {
      throw new Error("Invalid status value. Status must be 1, 2, or 3");
    }
    try {
     const updateTx  = await program.methods
        .updateNodeStatus(nodeId, newStatus) // Try to set status to ONLINE
        .accounts({ payer: keypair.publicKey })
        .signers([keypair])
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

  async function getPdaData(program, pdaType, pdaSeed) {
    try {
        if (pdaType == null || pdaSeed == null ) {
            throw new Error("Usage: node netsepiov1.js getPdaData <pdaType> <pdaSeed>");
        }
        if (pdaType === "node") {
            const [pda] = PublicKey.findProgramAddressSync(
            [Buffer.from("netsepio"), Buffer.from(pdaSeed)],
            program.programId);

            const pdaData = await program.account.node.fetch(pda);
            const summary = {
                action: "getPdaData",
                success: true,
                message: "PDA data fetched successfully",
                data:{
                    pdaType: pdaType,
                    pdaSeed: pdaSeed,
                    pdaData: pdaData,
                } ,
            };
            console.log(JSON.stringify(summary, null, 2));
        }
        else if(pdaType == "config"){
            const [configPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("netsepio"), pdaSeed.toBuffer()],
            program.programId
            );

            const pdaData = await program.account.globalConfig.fetch(configPda);
            const summary = {
                action: "getPdaData",
                success: true,
                message: "PDA data fetched successfully",
                data:{
                    pdaType: pdaType,
                    pdaSeed: pdaSeed,
                    pdaData: pdaData,
                } ,
            };
            console.log(JSON.stringify(summary, null, 2));
        }
    } catch (error) {
      console.error("Error getting PDA data or PDA does not exist:", error.message);
    }
  }

  async function getCollectionData(provider) {
    // Load or create keypair
    const keypairData = JSON.parse(process.env.COLLECTION_KEYPAIR);
    const secretKey = Uint8Array.from(keypairData);
    const keypair = Keypair.fromSecretKey(secretKey); 
    try{
        // Fetch the collection using UMI and mpl-core
        const umi = createUmi(provider.connection);
        umi.use(mplCore());

        const collectionData = await fetchCollection(
          umi,
          publicKey(
            keypair.publicKey.toBase58()
          )
        );

        // Custom JSON replacer function to handle BigInt
        const bigIntReplacer = (key, value) => {
            // Convert BigInt to string
            if (typeof value === 'bigint') {
                return value.toString();
            }
            return value;
        };

        const summary = {
            action: "getCollectionData",
            success: true,
            message: "Collection data fetched successfully",
            data:{
                collectionKey:  keypair.publicKey.toBase58(),
                collectionData: collectionData,
            } 
        };

        console.log(JSON.stringify(summary, bigIntReplacer, 2));
    }
    catch(error){
        const summary = {
            action: "getCollectionData",
            success: false,
            message: "Error fetching collection data",
            error: error.message,
        };
        console.log(JSON.stringify(summary, null, 2));
    }
  }

  async function getNftData(provider, program , nodeId) {
    try{
        const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from("netsepio"), Buffer.from(nodeId)],
        program.programId);
        const pdaData = await program.account.node.fetch(pda);
         
        const umi = createUmi(provider.connection);
        umi.use(mplCore());
        const asset = await fetchAsset(
            umi,
            publicKey(pdaData.asset)
        );

         // Custom JSON replacer function to handle BigInt
        const bigIntReplacer = (key, value) => {
            // Convert BigInt to string
            if (typeof value === 'bigint') {
                return value.toString();
            }
            return value;
        };

        const summary = {
            action: "getNftData",
            success: true,
            message: "NFT data fetched successfully",
            data: {
                nftData: asset,
            },
        };
        console.log(JSON.stringify(summary, bigIntReplacer, 2));
    }
    catch(error){
        const summary = {
            action: "getNftData",
            success: false,
            message: "Error fetching NFT data",
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
        const keypairData = JSON.parse(process.env.ADMIN_KEY);
        const secretKey = Uint8Array.from(keypairData);
        const keypair = Keypair.fromSecretKey(secretKey);
        console.log("Using Admin Wallet address:", keypair.publicKey.toBase58());
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
            case "intializeGlobalConfig":
                await intializeGlobalConfig(program,keypair)
                break;
            case "createCollection":
                await createCollection(program, keypair ,args[0], args[1]);
                break;
            case "mintNFT":
                await mintNFT(program,keypair,args);
                break;
            case "createCheckpoint":
                await createCheckpoint(program, keypair, args[0] , args[1]);
                break;
            case "updateMetadata":
                await updateMetadata(program, keypair, args[0], args[1]);
                break;
            case "updateNodeStatus":
                await updateNodeStatus(program, keypair, args[0], args[1]);
                break;
            case "checkBalance" :
                await checkBalance(connection,keypair.publicKey);
                break;
            case "getPdaData":
                if(args[0] == "node"){
                    await getPdaData(program, args[0], args[1]);
                }
                else if(args[0] == "config"){
                    await getPdaData(program, args[0], keypair.publicKey);
                }
                else{
                    throw new Error("Invalid PDA type");
                }
                break;
            case "getCollectionData":
                await getCollectionData(provider);
                break;
            case "getNftData":
                await getNftData(provider, program, args[0]);
                break;
            default:
                throw new Error(`Invalid action:   ${action} `);
        }
    
    } catch (error) {
      console.error("Error:", error);
      if (error.logs) {
        console.error("Program logs:", error.logs);
      }
      
    }
  }

main();
