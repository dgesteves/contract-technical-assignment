const { ethers } = require("hardhat");

async function main() {
  console.log("🔑 Hardhat Test Accounts:");
  console.log("=".repeat(80));

  const signers = await ethers.getSigners();

  for (let i = 0; i < Math.min(10, signers.length); i++) {
    const address = await signers[i].getAddress();
    const balance = await ethers.provider.getBalance(address);
    console.log(`Account ${i}: ${address}`);
    console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
    console.log(
      `Private Key: ${
        signers[i].privateKey || "Available in Hardhat node output"
      }`
    );
    console.log("-".repeat(80));
  }

  // Also show network info
  const network = await ethers.provider.getNetwork();
  console.log(`\n🌐 Network: ${network.name || "localhost"}`);
  console.log(
    `Chain ID: ${network.chainId} (0x${network.chainId.toString(16)})`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
