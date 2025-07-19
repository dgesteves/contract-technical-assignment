const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting complete development setup...");

  // Deploy the contract
  console.log("📦 Deploying FinancialPlatform contract...");
  const FinancialPlatform = await ethers.getContractFactory(
    "FinancialPlatform"
  );
  const financialPlatform = await FinancialPlatform.deploy();
  await financialPlatform.waitForDeployment();

  const platformAddress = await financialPlatform.getAddress();
  console.log("✅ FinancialPlatform deployed to:", platformAddress);

  // Get signers
  const [deployer, user1, user2, user3] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();

  console.log("👤 Deployer (Admin):", deployerAddress);

  // Register the admin account (deployer) - THIS WAS MISSING BEFORE!
  console.log("🔐 Registering admin account...");
  try {
    await financialPlatform.registerUser(
      deployerAddress,
      "Admin User",
      "admin@company.com",
      2 // Admin role
    );
    console.log("✅ Admin account registered successfully!");
  } catch (error) {
    console.log("⚠️  Warning: Could not register admin:", error.message);
  }

  // Set up comprehensive test data
  try {
    // Register test users with different roles
    await financialPlatform.registerUser(
      await user1.getAddress(),
      "Alice Manager",
      "alice.manager@company.com",
      1 // Manager role
    );
    console.log("✅ Registered Manager user:", await user1.getAddress());

    await financialPlatform.registerUser(
      await user2.getAddress(),
      "Charlie User",
      "charlie.user@company.com",
      0 // Regular role
    );
    console.log("✅ Registered Regular user:", await user2.getAddress());

    await financialPlatform.registerUser(
      await user3.getAddress(),
      "Bob Developer",
      "bob.dev@company.com",
      0 // Regular role
    );
    console.log("✅ Registered Regular user:", await user3.getAddress());

    // Get additional signers for more comprehensive data
    const [, , , , user4, user5] = await ethers.getSigners();

    // Register additional users for more diverse data
    await financialPlatform.registerUser(
      await user4.getAddress(),
      "Carol Finance",
      "carol.finance@company.com",
      1 // Manager role
    );
    console.log("✅ Registered Manager user:", await user4.getAddress());

    await financialPlatform.registerUser(
      await user5.getAddress(),
      "Dave Operations",
      "dave.ops@company.com",
      0 // Regular role
    );
    console.log("✅ Registered Regular user:", await user5.getAddress());

    // Create multiple transactions for different users
    console.log("💰 Creating comprehensive transaction data...");

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

    let transactionId = 1;

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
        transactionId: 1,
        requester: deployer,
        reason: "Monthly salary approval needed",
      },
      {
        transactionId: 2,
        requester: deployer,
        reason: "Bonus payment approval",
      },
      {
        transactionId: 3,
        requester: deployer,
        reason: "Manager bonus approval required",
      },
      { transactionId: 4, requester: user1, reason: "Team expense approval" },
      {
        transactionId: 5,
        requester: user1,
        reason: "Training budget approval",
      },
      {
        transactionId: 6,
        requester: user4,
        reason: "Equipment purchase approval",
      },
      { transactionId: 7, requester: user2, reason: "Small expense approval" },
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
        approvalId: 1,
        approved: true,
        reason: "Approved - valid salary payment",
      },
      {
        approvalId: 2,
        approved: true,
        reason: "Approved - performance bonus justified",
      },
      {
        approvalId: 3,
        approved: false,
        reason: "Rejected - exceeds quarterly budget",
      },
      {
        approvalId: 4,
        approved: true,
        reason: "Approved - team building expense",
      },
      {
        approvalId: 5,
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

    const transactionsToComplete = [1, 2, 4, 5]; // These were approved

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

    console.log("\n🎉 Comprehensive test data setup completed!");

    // Get final counts
    const transactionCount = await financialPlatform.getTransactionCount();
    const approvalCount = await financialPlatform.getApprovalCount();
    const userCount = await financialPlatform.getUserCount();

    console.log(
      `📊 Data Summary: ${userCount} users, ${transactionCount} transactions, ${approvalCount} approvals`
    );
  } catch (error) {
    console.log(
      "⚠️  Warning: Could not set up comprehensive test data:",
      error.message
    );
  }

  // Update frontend .env.local file automatically
  const frontendEnvPath = path.join(
    __dirname,
    "../../financial-dashboard/.env.local"
  );
  const envContent = `# Smart Contract Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=${platformAddress}
NEXT_PUBLIC_NETWORK=localhost
`;

  try {
    fs.writeFileSync(frontendEnvPath, envContent);
    console.log("✅ Updated frontend .env.local with new contract address");
  } catch (error) {
    console.log("⚠️  Could not update frontend .env.local:", error.message);
    console.log("📝 Please manually update your frontend .env.local:");
    console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS=${platformAddress}`);
  }

  // Save deployment info for reference
  const deploymentInfo = {
    contractAddress: platformAddress,
    network: "localhost",
    chainId: 31337,
    deployedAt: new Date().toISOString(),
    accounts: {
      admin: deployerAddress,
      manager: await user1.getAddress(),
      user1: await user2.getAddress(),
      user2: await user3.getAddress(),
    },
  };

  const deploymentPath = path.join(__dirname, "../deployment-info.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("✅ Saved deployment info to deployment-info.json");

  console.log("\n📋 Development Setup Complete!");
  console.log("=".repeat(60));
  console.log(`Contract Address: ${platformAddress}`);
  console.log(`Admin Account: ${deployerAddress} (REGISTERED)`);
  console.log(`Manager Account: ${await user1.getAddress()}`);
  console.log(
    `Test Users: ${await user2.getAddress()}, ${await user3.getAddress()}`
  );
  console.log("=".repeat(60));

  console.log("\n🎯 Next Steps:");
  console.log("1. Your frontend is already configured!");
  console.log(
    "2. Start your frontend: cd ../financial-dashboard && npm run dev"
  );
  console.log("3. Connect MetaMask to localhost:8545");
  console.log("4. Your admin account should now work immediately!");

  return platformAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  });
