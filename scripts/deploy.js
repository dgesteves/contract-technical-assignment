const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("Deploying contracts to Sepolia...");

  // Get the contract factories
  const FinancialPlatform = await ethers.getContractFactory(
    "FinancialPlatform"
  );
  const MockToken = await ethers.getContractFactory("MockToken");

  // Deploy FinancialPlatform
  console.log("Deploying FinancialPlatform...");
  const financialPlatform = await FinancialPlatform.deploy();
  await financialPlatform.waitForDeployment();
  const platformAddress = await financialPlatform.getAddress();
  console.log("✅ FinancialPlatform deployed to:", platformAddress);

  // Deploy MockToken
  console.log("Deploying MockToken...");
  // Note: You can adjust initial supply as needed for your live deployment
  const mockToken = await MockToken.deploy(
    "Platform Token",
    "PLT",
    ethers.parseEther("1000000")
  );
  await mockToken.waitForDeployment();
  const tokenAddress = await mockToken.getAddress();
  console.log("✅ MockToken deployed to:", tokenAddress);

  console.log("\nDeployment to Sepolia complete!");
  console.log("You can now verify the contracts on Etherscan if needed.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
