// scripts/post-deploy.js
const { ethers } = require("hardhat");

// --- IMPORTANT ---
// Paste the address of your deployed contract here
const PLATFORM_ADDRESS = "0x8e32dc74a1cf2cCCb56B0A6C709E981528C30Df6";

async function main() {
  console.log("Performing post-deployment setup...");

  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  console.log(`Using account: ${deployerAddress}`);

  // Get an instance of the deployed contract
  const financialPlatform = await ethers.getContractAt(
    "FinancialPlatform",
    PLATFORM_ADDRESS
  );

  // Register the deployer account as a Manager (role 1)
  console.log("Registering deployer as a Manager...");
  const tx = await financialPlatform.registerUser(
    deployerAddress,
    "Platform Admin",
    "admin@example.com",
    1 // Manager role
  );
  await tx.wait(); // Wait for the transaction to be mined

  console.log("✅ Deployer successfully registered as a Manager.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
