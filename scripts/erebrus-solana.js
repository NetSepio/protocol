const {
  Connection,
  PublicKey,
  Keypair,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} = require("@solana/web3.js");
const { Buffer } = require("buffer");
const { createHash } = require("crypto");
const fs = require("fs");
const path = require("path");

// Program ID from your deployment
const PROGRAM_ID = new PublicKey(
  "Bhvt1zhb14KRwXyan3cMZ52qwyyJP7Cji5HJrQrdmkAk"
);

// Custom RPC URL
const RPC_URL = "https://rpc.devnet.soo.network/rpc";

// Keypair path
const KEYPAIR_PATH = path.join(
  process.env.HOME,
  ".config",
  "solana",
  "id.json"
);

// Load keypair from file
function loadKeypair(path) {
  try {
    const keypairData = JSON.parse(fs.readFileSync(path, "utf8"));
    return Keypair.fromSecretKey(new Uint8Array(keypairData));
  } catch (error) {
    console.error("Error loading keypair:", error);
    throw new Error(`Failed to load keypair from ${path}`);
  }
}

function getInstructionDiscriminator(name) {
  return Buffer.from(
    createHash("sha256").update(`global:${name}`).digest().slice(0, 8)
  );
}

async function getStatePDA() {
  const [statePDA] = await PublicKey.findProgramAddress(
    [Buffer.from("state")],
    PROGRAM_ID
  );
  return statePDA;
}

async function checkAccount(connection, publicKey) {
  try {
    const account = await connection.getAccountInfo(publicKey);
    return account !== null;
  } catch (error) {
    console.error("Error checking account:", error);
    return false;
  }
}

async function initializeErebrusRegistry() {
  try {
    // Load authority keypair from config file
    console.log("Loading keypair from:", KEYPAIR_PATH);
    const authority = loadKeypair(KEYPAIR_PATH);
    console.log("Using authority address:", authority.publicKey.toBase58());

    // Connect to specified RPC
    const connection = new Connection(RPC_URL, "confirmed");
    console.log("Connected to:", RPC_URL);

    // Get state account PDA
    const statePDA = await getStatePDA();
    console.log("State PDA:", statePDA.toBase58());

    // Check if state account already exists
    const stateAccountExists = await checkAccount(connection, statePDA);
    if (stateAccountExists) {
      console.log("State account already initialized!");
      return {
        success: false,
        error: "State account already exists",
      };
    }

    // Get the correct discriminator for 'initialize'
    const discriminator = getInstructionDiscriminator("initialize");
    console.log("Initialize discriminator:", Array.from(discriminator));

    const initializeIx = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        {
          pubkey: statePDA,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: authority.publicKey,
          isSigner: true,
          isWritable: true,
        },
        {
          pubkey: SystemProgram.programId,
          isSigner: false,
          isWritable: false,
        },
      ],
      data: discriminator,
    });

    // Create and send transaction
    const transaction = new Transaction().add(initializeIx);

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = authority.publicKey;

    console.log("Sending initialize transaction...");
    const txSignature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [authority],
      {
        commitment: "confirmed",
        skipPreflight: false, // Enable preflight checks
      }
    );

    console.log("Transaction successful!");
    console.log("Signature:", txSignature);

    return {
      success: true,
      signature: txSignature,
      statePDA: statePDA.toBase58(),
    };
  } catch (error) {
    if (error.logs) {
      console.error("Detailed error logs:", error.logs);
    }
    console.error("Error initializing Erebrus Registry:", error);
    return {
      success: false,
      error: error.message,
      logs: error.logs,
    };
  }
}

// Execute the initialization
console.log("Starting Erebrus Registry initialization...");
initializeErebrusRegistry()
  .then((result) => {
    console.log("Initialization result:", result);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
