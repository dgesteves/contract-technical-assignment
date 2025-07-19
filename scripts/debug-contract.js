const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Debugging contract state...");

  // The address from frontend .env.local
  const contractAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";

  console.log("📍 Contract address:", contractAddress);

  try {
    // Check if there's code at this address
    const code = await ethers.provider.getCode(contractAddress);
    console.log("📄 Contract code length:", code.length);

    if (code === "0x") {
      console.log("❌ No contract deployed at this address!");
      return;
    }

    // Get the contract factory and attach to the address
    const FinancialPlatform = await ethers.getContractFactory(
      "FinancialPlatform"
    );
    const contract = FinancialPlatform.attach(contractAddress);

    // Get signers
    const [deployer] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();

    console.log("👤 Deployer address:", deployerAddress);

    // Test basic contract functions
    try {
      const userCount = await contract.getUserCount();
      console.log("👥 Total registered users:", userCount.toString());

      const transactionCount = await contract.getTransactionCount();
      console.log("💸 Total transactions:", transactionCount.toString());

      const approvalCount = await contract.getApprovalCount();
      console.log("✅ Total approvals:", approvalCount.toString());
    } catch (error) {
      console.log("❌ Error calling basic functions:", error.message);
    }

    // Test getUser for the admin account
    const adminAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    console.log("\n🔍 Checking admin account registration:", adminAddress);

    try {
      const user = await contract.getUser(adminAddress);
      console.log("✅ User found:");
      console.log("  ID:", user.id.toString());
      console.log("  Address:", user.walletAddress);
      console.log("  Name:", user.name);
      console.log("  Email:", user.email);
      console.log("  Role:", user.role.toString());
      console.log("  Active:", user.isActive);
      console.log(
        "  Created:",
        new Date(Number(user.createdAt) * 1000).toISOString()
      );
    } catch (error) {
      console.log("❌ Error getting user:", error.message);
      console.log("Error code:", error.code);
      console.log("Error data:", error.data);

      // This is the expected error for unregistered users
      if (error.code === "BAD_DATA" && error.value === "0x") {
        console.log(
          "💡 This confirms the user is NOT registered in the contract"
        );
      }
    }

    // List all registered users
    try {
      const allUsers = await contract.getAllRegisteredUsers();
      console.log("\n👥 All registered users:");
      for (let i = 0; i < allUsers.length; i++) {
        console.log(`  ${i + 1}. ${allUsers[i]}`);
        try {
          const userData = await contract.getUser(allUsers[i]);
          console.log(`     Name: ${userData.name}, Role: ${userData.role}`);
        } catch (e) {
          console.log(`     Error getting user data: ${e.message}`);
        }
      }
    } catch (error) {
      console.log("❌ Error getting all users:", error.message);
    }
  } catch (error) {
    console.log("❌ Critical error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Debug failed:", error);
    process.exit(1);
  });
