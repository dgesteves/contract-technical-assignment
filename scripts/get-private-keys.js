const { ethers } = require("hardhat");

async function main() {
  console.log("🔑 Hardhat Test Accounts with Private Keys:");
  console.log("=".repeat(80));

  // These are the standard Hardhat test account private keys
  const accounts = [
    {
      address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      privateKey:
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    },
    {
      address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      privateKey:
        "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
    },
    {
      address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      privateKey:
        "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
    },
    {
      address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
      privateKey:
        "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
    },
    {
      address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
      privateKey:
        "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a",
    },
  ];

  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i];
    console.log(`Account ${i}:`);
    console.log(`  Address: ${account.address}`);
    console.log(`  Private Key: ${account.privateKey}`);

    // Get balance
    try {
      const balance = await ethers.provider.getBalance(account.address);
      console.log(`  Balance: ${ethers.formatEther(balance)} ETH`);
    } catch (error) {
      console.log(`  Balance: Unable to fetch`);
    }
    console.log("-".repeat(80));
  }

  // Show network info
  const network = await ethers.provider.getNetwork();
  console.log(`\n🌐 Network: ${network.name || "localhost"}`);
  console.log(
    `Chain ID: ${network.chainId} (0x${network.chainId.toString(16)})`
  );

  console.log("\n📋 MetaMask Setup Instructions:");
  console.log("1. Add Custom Network in MetaMask:");
  console.log("   - Network Name: Localhost 8545");
  console.log("   - RPC URL: http://127.0.0.1:8545");
  console.log(`   - Chain ID: ${network.chainId}`);
  console.log("   - Currency Symbol: ETH");
  console.log("\n2. Import Account using Private Key:");
  console.log(`   - Use Account 0 Private Key: ${accounts[0].privateKey}`);
  console.log(`   - This will give you access to: ${accounts[0].address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
