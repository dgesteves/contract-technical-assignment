const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🌱 Starting comprehensive data seeding...");

  // Get contract factory and signers
  const FinancialPlatform = await ethers.getContractFactory(
    "FinancialPlatform"
  );
  const [deployer, user1, user2, user3, user4, user5] =
    await ethers.getSigners();

  // Read deployment info to get contract address
  const deploymentPath = path.join(__dirname, "../deployment-info.json");
  let contractAddress;

  try {
    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
    contractAddress = deploymentInfo.contractAddress;
    console.log("📋 Using existing contract at:", contractAddress);
  } catch (error) {
    console.error(
      "❌ Could not read deployment info. Please run start-dev.js first."
    );
    process.exit(1);
  }

  // Connect to existing contract
  const financialPlatform = FinancialPlatform.attach(contractAddress);

  try {
    // Register additional users for more diverse data
    console.log("👥 Registering additional users...");

    await financialPlatform.connect(deployer).registerUser(
      await user4.getAddress(),
      "Carol Finance",
      "carol.finance@company.com",
      1 // Manager role
    );
    console.log("✅ Registered Manager user:", await user4.getAddress());

    await financialPlatform.connect(deployer).registerUser(
      await user5.getAddress(),
      "Dave Operations",
      "dave.ops@company.com",
      0 // Regular role
    );
    console.log("✅ Registered Regular user:", await user5.getAddress());

    // Create multiple transactions for different users
    console.log("💰 Creating multiple transactions...");

    const transactions = [
      // Admin transactions
      {
        from: deployer,
        to: await user1.getAddress(),
        amount: ethers.parseEther("1.5"),
        description: "Monthly salary payment",
      },
      {
        from: deployer,
        to: await user2.getAddress(),
        amount: ethers.parseEther("0.8"),
        description: "Project bonus payment",
      },
      {
        from: deployer,
        to: await user4.getAddress(),
        amount: ethers.parseEther("2.0"),
        description: "Manager quarterly bonus",
      },

      // Manager transactions
      {
        from: user1,
        to: await user2.getAddress(),
        amount: ethers.parseEther("0.3"),
        description: "Team lunch reimbursement",
      },
      {
        from: user1,
        to: await user5.getAddress(),
        amount: ethers.parseEther("0.5"),
        description: "Training course fee",
      },
      {
        from: user4,
        to: await user3.getAddress(),
        amount: ethers.parseEther("0.7"),
        description: "Equipment purchase",
      },

      // Regular user transactions
      {
        from: user2,
        to: await user3.getAddress(),
        amount: ethers.parseEther("0.2"),
        description: "Office supplies split",
      },
      {
        from: user3,
        to: await user5.getAddress(),
        amount: ethers.parseEther("0.15"),
        description: "Coffee fund contribution",
      },
      {
        from: user5,
        to: await user2.getAddress(),
        amount: ethers.parseEther("0.25"),
        description: "Parking fee share",
      },
    ];

    let transactionId = 2; // Start from 2 since 1 already exists from start-dev.js

    for (const txData of transactions) {
      const tx = await financialPlatform
        .connect(txData.from)
        .createTransaction(txData.to, txData.amount, txData.description);
      await tx.wait();
      console.log(
        `✅ Created transaction ${transactionId}: ${txData.description}`
      );
      transactionId++;
    }

    // Create approval requests for various transactions
    console.log("📋 Creating approval requests...");

    const approvalRequests = [
      {
        transactionId: 2,
        requester: deployer,
        reason: "Monthly salary approval needed",
      },
      {
        transactionId: 3,
        requester: deployer,
        reason: "Bonus payment approval",
      },
      {
        transactionId: 4,
        requester: deployer,
        reason: "Manager bonus approval required",
      },
      { transactionId: 5, requester: user1, reason: "Team expense approval" },
      {
        transactionId: 6,
        requester: user1,
        reason: "Training budget approval",
      },
      {
        transactionId: 7,
        requester: user4,
        reason: "Equipment purchase approval",
      },
      { transactionId: 8, requester: user2, reason: "Small expense approval" },
    ];

    for (const approval of approvalRequests) {
      try {
        const approvalTx = await financialPlatform
          .connect(approval.requester)
          .requestApproval(approval.transactionId, approval.reason);
        await approvalTx.wait();
        console.log(
          `✅ Created approval request for transaction ${approval.transactionId}`
        );
      } catch (error) {
        console.log(
          `⚠️  Could not create approval for transaction ${approval.transactionId}:`,
          error.message
        );
      }
    }

    // Process some approvals (approve some, reject others for variety)
    console.log("⚖️  Processing some approvals...");

    const approvalProcessing = [
      {
        approvalId: 2,
        approved: true,
        reason: "Approved - valid salary payment",
      },
      {
        approvalId: 3,
        approved: true,
        reason: "Approved - performance bonus justified",
      },
      {
        approvalId: 4,
        approved: false,
        reason: "Rejected - exceeds quarterly budget",
      },
      {
        approvalId: 5,
        approved: true,
        reason: "Approved - team building expense",
      },
      {
        approvalId: 6,
        approved: true,
        reason: "Approved - professional development",
      },
      // Leave some pending for dashboard display
    ];

    for (const processing of approvalProcessing) {
      try {
        const processTx = await financialPlatform
          .connect(deployer) // Admin processes approvals
          .processApproval(
            processing.approvalId,
            processing.approved,
            processing.reason
          );
        await processTx.wait();
        const status = processing.approved ? "approved" : "rejected";
        console.log(
          `✅ ${status.toUpperCase()} approval ${processing.approvalId}`
        );
      } catch (error) {
        console.log(
          `⚠️  Could not process approval ${processing.approvalId}:`,
          error.message
        );
      }
    }

    // Complete some approved transactions
    console.log("✅ Completing approved transactions...");

    const transactionsToComplete = [2, 3, 5, 6]; // These were approved

    for (const txId of transactionsToComplete) {
      try {
        const completeTx = await financialPlatform
          .connect(deployer) // Admin completes transactions
          .completeTransaction(txId);
        await completeTx.wait();
        console.log(`✅ Completed transaction ${txId}`);
      } catch (error) {
        console.log(
          `⚠️  Could not complete transaction ${txId}:`,
          error.message
        );
      }
    }

    console.log("\n🎉 Comprehensive data seeding completed!");
    console.log("📊 Summary of seeded data:");

    // Get final counts
    const transactionCount = await financialPlatform.getTransactionCount();
    const approvalCount = await financialPlatform.getApprovalCount();
    const userCount = await financialPlatform.getUserCount();

    console.log(`   - Total Users: ${userCount}`);
    console.log(`   - Total Transactions: ${transactionCount}`);
    console.log(`   - Total Approvals: ${approvalCount}`);

    console.log("\n👥 User Accounts:");
    console.log(`   - Admin: ${await deployer.getAddress()}`);
    console.log(`   - Manager 1: ${await user1.getAddress()}`);
    console.log(`   - Manager 2: ${await user4.getAddress()}`);
    console.log(`   - Regular 1: ${await user2.getAddress()}`);
    console.log(`   - Regular 2: ${await user3.getAddress()}`);
    console.log(`   - Regular 3: ${await user5.getAddress()}`);

    console.log(
      "\n🚀 You can now test the dashboard with rich data for all account types!"
    );
  } catch (error) {
    console.error("❌ Error during comprehensive seeding:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
