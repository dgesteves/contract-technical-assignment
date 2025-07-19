const { ethers } = require("hardhat");

async function main() {
  // Get the contract address from environment or use the deployed one
  const contractAddress =
    process.env.CONTRACT_ADDRESS ||
    "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  console.log(
    "🔗 Connecting to FinancialPlatform contract at:",
    contractAddress
  );

  // Get the contract factory and attach to deployed contract
  const FinancialPlatform = await ethers.getContractFactory(
    "FinancialPlatform"
  );
  const contract = FinancialPlatform.attach(contractAddress);

  // Get the deployer (admin) account
  const [admin] = await ethers.getSigners();
  const adminAddress = await admin.getAddress();

  console.log("👤 Admin account:", adminAddress);

  // Get wallet address from command line argument
  const walletAddress = process.argv[2];

  if (!walletAddress) {
    console.log("❌ Please provide a wallet address to register.");
    console.log(
      "Usage: node scripts/register-wallet.js <wallet_address> [role] [name] [email]"
    );
    console.log("\nRoles: 0=Regular, 1=Manager, 2=Admin");
    console.log("\nExample:");
    console.log(
      'node scripts/register-wallet.js 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 1 "John Doe" "john@example.com"'
    );
    return;
  }

  // Get optional parameters
  const role = parseInt(process.argv[3]) || 0; // Default to Regular user
  const name = process.argv[4] || "Test User";
  const email = process.argv[5] || "test@example.com";

  const roleNames = ["Regular", "Manager", "Admin"];

  try {
    // Check if user is already registered
    try {
      const existingUser = await contract.getUser(walletAddress);
      if (existingUser.walletAddress !== ethers.ZeroAddress) {
        console.log("✅ User is already registered:");
        console.log(`   Address: ${existingUser.walletAddress}`);
        console.log(`   Name: ${existingUser.name}`);
        console.log(`   Email: ${existingUser.email}`);
        console.log(
          `   Role: ${roleNames[existingUser.role]} (${existingUser.role})`
        );
        console.log(`   Active: ${existingUser.isActive}`);
        return;
      }
    } catch (error) {
      // User not registered, continue with registration
      console.log("👤 User not found, proceeding with registration...");
    }

    // Register the user
    console.log("📝 Registering user...");
    console.log(`   Address: ${walletAddress}`);
    console.log(`   Name: ${name}`);
    console.log(`   Email: ${email}`);
    console.log(`   Role: ${roleNames[role]} (${role})`);

    const tx = await contract.registerUser(walletAddress, name, email, role);
    await tx.wait();

    console.log("✅ User registered successfully!");

    // Verify registration
    const user = await contract.getUser(walletAddress);
    console.log("\n🔍 Verification:");
    console.log(`   Address: ${user.walletAddress}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${roleNames[user.role]} (${user.role})`);
    console.log(`   Active: ${user.isActive}`);
  } catch (error) {
    console.error("❌ Error registering user:", error.message);

    if (error.message.includes("AccessControl")) {
      console.log(
        "\n💡 Tip: Make sure you're using the admin account that deployed the contract."
      );
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
