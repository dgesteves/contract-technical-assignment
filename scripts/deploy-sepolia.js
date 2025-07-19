const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying FinancialPlatform to Sepolia testnet...");

  // Get the contract factory
  const FinancialPlatform = await ethers.getContractFactory("FinancialPlatform");

  // Deploy the contract
  console.log("📦 Deploying FinancialPlatform contract...");
  const financialPlatform = await FinancialPlatform.deploy();
  await financialPlatform.waitForDeployment();
  
  const platformAddress = await financialPlatform.getAddress();
  console.log("✅ FinancialPlatform deployed to:", platformAddress);

  // Get deployer address
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  console.log("👤 Deployed by:", deployerAddress);

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("🌐 Network:", network.name, "Chain ID:", network.chainId.toString());

  console.log("\n📋 Deployment Summary:");
  console.log("=".repeat(50));
  console.log(`Contract Address: ${platformAddress}`);
  console.log(`Network: ${network.name} (${network.chainId})`);
  console.log(`Deployer: ${deployerAddress}`);
  console.log(`Block Explorer: https://sepolia.etherscan.io/address/${platformAddress}`);
  console.log("=".repeat(50));

  console.log("\n🔧 Next Steps:");
  console.log("1. Update your frontend .env.local file:");
  console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS=${platformAddress}`);
  console.log("2. Verify the contract on Etherscan (optional):");
  console.log(`   npx hardhat verify --network sepolia ${platformAddress}`);
  console.log("3. Test the contract integration with your frontend");

  return platformAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
