const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Debugging contract data...");

  // Get the deployed contract address from deployment info
  const fs = require("fs");
  let contractAddress;

  try {
    const deploymentInfo = JSON.parse(
      fs.readFileSync("deployment-info.json", "utf8")
    );
    contractAddress = deploymentInfo.contractAddress;
    console.log(
      "📋 Using contract address from deployment-info.json:",
      contractAddress
    );
  } catch (error) {
    // Fallback to reading from frontend env
    const envPath = "../financial-dashboard/.env.local";
    const envContent = fs.readFileSync(envPath, "utf8");
    const match = envContent.match(/NEXT_PUBLIC_CONTRACT_ADDRESS=(.+)/);
    contractAddress = match ? match[1].trim() : null;
    console.log(
      "📋 Using contract address from frontend .env.local:",
      contractAddress
    );
  }

  if (!contractAddress) {
    console.error("❌ Could not find contract address");
    return;
  }

  // Connect to the contract
  const FinancialPlatform = await ethers.getContractFactory(
    "FinancialPlatform"
  );
  const contract = FinancialPlatform.attach(contractAddress);

  // Get signers
  const [deployer] = await ethers.getSigners();
  const adminAddress = await deployer.getAddress();

  console.log("👤 Admin address:", adminAddress);
  console.log("📍 Contract address:", contractAddress);

  try {
    // Test basic contract calls
    console.log("\n📊 Testing contract method calls...");

    // 1. Check transaction count
    const transactionCount = await contract.getTransactionCount();
    console.log("✅ Total transactions:", transactionCount.toString());

    // 2. Check user count
    const userCount = await contract.getUserCount();
    console.log("✅ Total users:", userCount.toString());

    // 3. Check approval count
    const approvalCount = await contract.getApprovalCount();
    console.log("✅ Total approvals:", approvalCount.toString());

    // 4. Check admin user details
    const adminUser = await contract.getUser(adminAddress);
    console.log("✅ Admin user details:", {
      id: adminUser[0].toString(),
      address: adminUser[1],
      name: adminUser[2],
      email: adminUser[3],
      role: adminUser[4].toString(),
      isActive: adminUser[5],
      registeredAt: adminUser[6].toString(),
    });

    // 5. Check pending approvals for admin
    try {
      const pendingApprovals = await contract.getPendingApprovals(adminAddress);
      console.log("✅ Pending approvals for admin:", pendingApprovals.length);
    } catch (error) {
      console.log("⚠️  Error getting pending approvals:", error.message);
    }

    // 6. Check if there are any transactions
    if (transactionCount > 0) {
      console.log("\n📋 Transaction details:");
      const maxTransactions = Math.min(Number(transactionCount), 5);
      for (let i = 1; i <= maxTransactions; i++) {
        try {
          const tx = await contract.getTransaction(i);
          console.log(`Transaction ${i}:`, {
            id: tx[0].toString(),
            from: tx[1],
            to: tx[2],
            amount: ethers.formatEther(tx[3]),
            status: tx[4].toString(),
            createdAt: tx[5].toString(),
          });
        } catch (error) {
          console.log(`❌ Error getting transaction ${i}:`, error.message);
        }
      }
    }

    // 7. Check all registered users
    console.log("\n👥 All registered users:");
    try {
      const allUsers = await contract.getAllRegisteredUsers();
      console.log("Total users found:", allUsers.length);
      allUsers.forEach((userAddr, index) => {
        console.log(`User ${index + 1}: ${userAddr}`);
      });
    } catch (error) {
      console.log("⚠️  Error getting all users:", error.message);
    }
  } catch (error) {
    console.error("❌ Error calling contract methods:", error);
  }

  console.log("\n🏁 Debug complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Debug failed:", error);
    process.exit(1);
  });
