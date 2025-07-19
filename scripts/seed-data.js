#!/usr/bin/env node

/**
 * Data Seeding Script for Financial Dashboard
 *
 * This script seeds the smart contract with sample data including:
 * - Sample users with different roles
 * - Sample transactions with various statuses
 * - Sample approval requests
 *
 * Usage: node scripts/seed-data.js
 */

const { ethers } = require("hardhat");
const readline = require("readline");

// Sample data
const SAMPLE_USERS = [
  {
    address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Hardhat account 1
    role: 0, // Regular
    name: "Alice Johnson",
  },
  {
    address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // Hardhat account 2
    role: 1, // Manager
    name: "Bob Smith",
  },
  {
    address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906", // Hardhat account 3
    role: 0, // Regular
    name: "Carol Davis",
  },
  {
    address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", // Hardhat account 4
    role: 1, // Manager
    name: "David Wilson",
  },
];

const SAMPLE_TRANSACTIONS = [
  {
    to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    amount: ethers.parseEther("1.5"),
    description: "Payment for consulting services",
  },
  {
    to: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    amount: ethers.parseEther("0.8"),
    description: "Reimbursement for travel expenses",
  },
  {
    to: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    amount: ethers.parseEther("2.3"),
    description: "Quarterly bonus payment",
  },
  {
    to: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    amount: ethers.parseEther("0.5"),
    description: "Office supplies purchase",
  },
  {
    to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    amount: ethers.parseEther("3.2"),
    description: "Project milestone payment",
  },
];

const APPROVAL_REASONS = [
  "Amount exceeds standard limit",
  "New vendor payment requires approval",
  "Monthly budget review needed",
  "Large expense requires manager approval",
];

// Utility functions
function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function askQuestion(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function waitForConfirmation(message) {
  const rl = createInterface();
  console.log(`\n${message}`);
  const answer = await askQuestion(rl, "Continue? (y/N): ");
  rl.close();
  return answer.toLowerCase() === "y" || answer.toLowerCase() === "yes";
}

async function waitForTransaction(tx, description) {
  console.log(`⏳ ${description}...`);
  console.log(`   Transaction hash: ${tx.hash}`);
  const receipt = await tx.wait();
  console.log(`✅ ${description} completed (Block: ${receipt.blockNumber})`);
  return receipt;
}

async function main() {
  console.log("🌱 Financial Dashboard Data Seeding Script");
  console.log("==========================================\n");

  // Get contract factory and deploy if needed
  const FinancialPlatform = await ethers.getContractFactory(
    "FinancialPlatform"
  );

  // Get signers
  const [admin, ...otherSigners] = await ethers.getSigners();
  console.log(`✅ Using admin account: ${admin.address}`);

  // Try to get deployed contract address
  let contract;
  try {
    // You might need to update this address based on your deployment
    const contractAddress =
      process.env.CONTRACT_ADDRESS ||
      "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    contract = FinancialPlatform.attach(contractAddress);
    console.log(`✅ Connected to contract: ${contractAddress}\n`);
  } catch (error) {
    console.error("❌ Failed to connect to contract. Make sure it's deployed.");
    console.error(
      "   You can deploy it with: npx hardhat run scripts/deploy.js --network localhost"
    );
    process.exit(1);
  }

  // Check current state
  try {
    const userCount = await contract.getUserCount();
    const transactionCount = await contract.getTransactionCount();
    const approvalCount = await contract.getApprovalCount();

    console.log("📊 Current Contract State:");
    console.log(`   Users: ${userCount.toString()}`);
    console.log(`   Transactions: ${transactionCount.toString()}`);
    console.log(`   Approvals: ${approvalCount.toString()}\n`);

    if (userCount > 0n || transactionCount > 0n || approvalCount > 0n) {
      const shouldContinue = await waitForConfirmation(
        "⚠️  Contract already contains data. This will add more sample data."
      );
      if (!shouldContinue) {
        console.log("❌ Seeding cancelled by user");
        process.exit(0);
      }
    }
  } catch (error) {
    console.error("❌ Failed to check contract state:", error.message);
    process.exit(1);
  }

  console.log("🚀 Starting data seeding process...\n");

  // Step 1: Register admin if not already registered
  console.log("👑 Step 1: Ensuring admin is registered...");
  try {
    const adminUser = await contract.getUser(admin.address);
    if (adminUser.walletAddress === ethers.ZeroAddress) {
      const tx = await contract.registerUser(admin.address, 2); // Admin role
      await waitForTransaction(tx, "Registering admin user");
    } else {
      console.log("✅ Admin already registered");
    }
  } catch (error) {
    if (error.message.includes("User already registered")) {
      console.log("✅ Admin already registered");
    } else {
      console.error("❌ Failed to register admin:", error.message);
    }
  }

  // Step 2: Register sample users
  console.log("\n👥 Step 2: Registering sample users...");
  for (const user of SAMPLE_USERS) {
    try {
      const tx = await contract.registerUser(user.address, user.role);
      await waitForTransaction(
        tx,
        `Registering ${user.name} (${user.address})`
      );
    } catch (error) {
      if (error.message.includes("User already registered")) {
        console.log(`⚠️  User ${user.name} already registered, skipping...`);
      } else {
        console.error(`❌ Failed to register ${user.name}:`, error.message);
      }
    }
  }

  // Step 3: Create sample transactions
  console.log("\n💸 Step 3: Creating sample transactions...");
  const createdTransactionIds = [];

  for (let i = 0; i < SAMPLE_TRANSACTIONS.length; i++) {
    const transaction = SAMPLE_TRANSACTIONS[i];
    try {
      const tx = await contract.createTransaction(
        transaction.to,
        transaction.amount,
        transaction.description
      );
      const receipt = await waitForTransaction(
        tx,
        `Creating transaction: ${transaction.description}`
      );

      // Extract transaction ID from events
      const event = receipt.logs.find((log) => {
        try {
          const parsedLog = contract.interface.parseLog(log);
          return parsedLog.name === "TransactionCreated";
        } catch {
          return false;
        }
      });

      if (event) {
        const parsedLog = contract.interface.parseLog(event);
        createdTransactionIds.push(parsedLog.args.transactionId);
      }
    } catch (error) {
      console.error(`❌ Failed to create transaction ${i + 1}:`, error.message);
    }
  }

  // Step 4: Create approval requests for some transactions
  console.log("\n📋 Step 4: Creating approval requests...");
  const transactionsToApprove = createdTransactionIds.slice(0, 3); // First 3 transactions

  for (let i = 0; i < transactionsToApprove.length; i++) {
    const transactionId = transactionsToApprove[i];
    const reason = APPROVAL_REASONS[i % APPROVAL_REASONS.length];

    try {
      const tx = await contract.requestApproval(transactionId, reason);
      await waitForTransaction(
        tx,
        `Requesting approval for transaction ${transactionId}`
      );
    } catch (error) {
      console.error(
        `❌ Failed to request approval for transaction ${transactionId}:`,
        error.message
      );
    }
  }

  // Step 5: Process some approvals (approve some, reject others)
  console.log("\n✅ Step 5: Processing some approval requests...");
  try {
    const pendingApprovals = await contract.getPendingApprovals();

    for (let i = 0; i < Math.min(pendingApprovals.length, 2); i++) {
      const approvalId = pendingApprovals[i];
      const shouldApprove = i % 2 === 0; // Approve every other one
      const comments = shouldApprove
        ? "Approved - meets requirements"
        : "Rejected - insufficient documentation";

      try {
        const tx = await contract.processApproval(
          approvalId,
          shouldApprove,
          comments
        );
        await waitForTransaction(
          tx,
          `${
            shouldApprove ? "Approving" : "Rejecting"
          } approval request ${approvalId}`
        );
      } catch (error) {
        console.error(
          `❌ Failed to process approval ${approvalId}:`,
          error.message
        );
      }
    }
  } catch (error) {
    console.error("❌ Failed to process approvals:", error.message);
  }

  // Step 6: Complete some transactions
  console.log("\n🏁 Step 6: Completing some transactions...");
  const transactionsToComplete = createdTransactionIds.slice(-2); // Last 2 transactions

  for (const transactionId of transactionsToComplete) {
    try {
      const tx = await contract.completeTransaction(transactionId);
      await waitForTransaction(tx, `Completing transaction ${transactionId}`);
    } catch (error) {
      console.error(
        `❌ Failed to complete transaction ${transactionId}:`,
        error.message
      );
    }
  }

  // Final summary
  console.log("\n🎉 Data seeding completed successfully!");
  console.log("=====================================\n");

  try {
    const finalUserCount = await contract.getUserCount();
    const finalTransactionCount = await contract.getTransactionCount();
    const finalApprovalCount = await contract.getApprovalCount();
    const pendingApprovals = await contract.getPendingApprovals();

    console.log("📊 Final Contract State:");
    console.log(`   Users: ${finalUserCount.toString()}`);
    console.log(`   Transactions: ${finalTransactionCount.toString()}`);
    console.log(`   Approvals: ${finalApprovalCount.toString()}`);
    console.log(`   Pending Approvals: ${pendingApprovals.length}`);
    console.log("\n✨ Your dashboard should now show populated data!");
    console.log("   Refresh your browser to see the updated information.");
  } catch (error) {
    console.error("❌ Failed to get final state:", error.message);
  }
}

// Handle script execution
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("💥 Script failed:", error);
      process.exit(1);
    });
}

module.exports = { main };
