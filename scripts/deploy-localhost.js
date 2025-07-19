const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying FinancialPlatform to localhost...");

  // Get the contract factory
  const FinancialPlatform = await ethers.getContractFactory(
    "FinancialPlatform"
  );

  // Deploy the contract
  console.log("📦 Deploying FinancialPlatform contract...");
  const financialPlatform = await FinancialPlatform.deploy();
  await financialPlatform.waitForDeployment();

  const platformAddress = await financialPlatform.getAddress();
  console.log("✅ FinancialPlatform deployed to:", platformAddress);

  // Get signers for testing
  const [deployer, user1, user2, user3] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();

  console.log("👤 Deployed by:", deployerAddress);
  console.log("🧪 Setting up test data...");

  // Register test users for development
  try {
    // Register user1 as Manager
    await financialPlatform.registerUser(
      await user1.getAddress(),
      "John Manager",
      "john.manager@company.com",
      1 // Manager role
    );
    console.log("✅ Registered user1 as Manager:", await user1.getAddress());

    // Register user2 as Regular user
    await financialPlatform.registerUser(
      await user2.getAddress(),
      "Alice User",
      "alice.user@company.com",
      0 // Regular role
    );
    console.log(
      "✅ Registered user2 as Regular user:",
      await user2.getAddress()
    );

    // Register user3 as Regular user
    await financialPlatform.registerUser(
      await user3.getAddress(),
      "Bob Developer",
      "bob.dev@company.com",
      0 // Regular role
    );
    console.log(
      "✅ Registered user3 as Regular user:",
      await user3.getAddress()
    );

    // Create a sample transaction
    const tx = await financialPlatform
      .connect(user2)
      .createTransaction(
        await user1.getAddress(),
        ethers.parseEther("0.1"),
        "Sample transaction for testing"
      );
    await tx.wait();
    console.log("✅ Created sample transaction");

    // Request approval for the transaction
    const approvalTx = await financialPlatform.connect(user2).requestApproval(
      1, // Transaction ID
      "Please approve this test transaction"
    );
    await approvalTx.wait();
    console.log("✅ Requested approval for sample transaction");
  } catch (error) {
    console.log("⚠️  Warning: Could not set up test data:", error.message);
  }

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log(
    "🌐 Network:",
    network.name || "localhost",
    "Chain ID:",
    network.chainId.toString()
  );

  console.log("\n📋 Deployment Summary:");
  console.log("=".repeat(60));
  console.log(`Contract Address: ${platformAddress}`);
  console.log(`Network: localhost (${network.chainId})`);
  console.log(`Deployer (Admin): ${deployerAddress}`);
  console.log(`Test Manager: ${await user1.getAddress()}`);
  console.log(`Test User 1: ${await user2.getAddress()}`);
  console.log(`Test User 2: ${await user3.getAddress()}`);
  console.log("=".repeat(60));

  console.log("\n🔧 Next Steps:");
  console.log("1. Update your frontend .env.local file:");
  console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS=${platformAddress}`);
  console.log("2. Start your frontend development server:");
  console.log("   cd ../financial-dashboard && npm run dev");
  console.log("3. Connect MetaMask to localhost:8545");
  console.log("4. Import test accounts using the private keys from Hardhat");

  return platformAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
