const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying contracts...");

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
  console.log("FinancialPlatform deployed to:", platformAddress);

  // Deploy MockToken
  console.log("Deploying MockToken...");
  const mockToken = await MockToken.deploy("Platform Token", "PLT", 1000000); // 1M tokens
  await mockToken.waitForDeployment();
  const tokenAddress = await mockToken.getAddress();
  console.log("MockToken deployed to:", tokenAddress);

  // Get signers for testing
  const [deployer, user1, user2, user3, approver1] = await ethers.getSigners();

  console.log("\nSetting up initial data...");

  // Register test users
  console.log("Registering test users...");

  // Register user1 as Manager
  await financialPlatform.registerUser(
    await user1.getAddress(),
    "John Manager",
    "john.manager@company.com",
    1 // Manager role
  );
  console.log("Registered user1 as Manager");

  // Register user2 as Regular user
  await financialPlatform.registerUser(
    await user2.getAddress(),
    "Alice User",
    "alice.user@company.com",
    0 // Regular role
  );
  console.log("Registered user2 as Regular user");

  // Register user3 as Regular user
  await financialPlatform.registerUser(
    await user3.getAddress(),
    "Bob User",
    "bob.user@company.com",
    0 // Regular role
  );
  console.log("Registered user3 as Regular user");

  // Register approver1 as Manager
  await financialPlatform.registerUser(
    await approver1.getAddress(),
    "Sarah Approver",
    "sarah.approver@company.com",
    1 // Manager role
  );
  console.log("Registered approver1 as Manager");

  // Mint tokens to users for testing
  console.log("Minting tokens to users...");
  const tokenAmount = ethers.parseEther("10000"); // 10,000 tokens each

  await mockToken.mint(await user1.getAddress(), tokenAmount);
  await mockToken.mint(await user2.getAddress(), tokenAmount);
  await mockToken.mint(await user3.getAddress(), tokenAmount);
  await mockToken.mint(await approver1.getAddress(), tokenAmount);

  console.log("Minted 10,000 tokens to each user");

  // Create some sample transactions
  console.log("Creating sample transactions...");

  // Connect as user2 and create transactions
  const user2Platform = financialPlatform.connect(user2);

  // Transaction 1
  await user2Platform.createTransaction(
    await user3.getAddress(),
    ethers.parseEther("1000"),
    "Payment to Bob for services"
  );
  console.log("Created transaction 1");

  // Transaction 2
  await user2Platform.createTransaction(
    await user1.getAddress(),
    ethers.parseEther("2500"),
    "Refund to John Manager"
  );
  console.log("Created transaction 2");

  // Connect as user3 and create transactions
  const user3Platform = financialPlatform.connect(user3);

  // Transaction 3
  await user3Platform.createTransaction(
    await user2.getAddress(),
    ethers.parseEther("500"),
    "Payment to Alice for consultation"
  );
  console.log("Created transaction 3");

  // Request approvals for transactions
  console.log("Requesting approvals...");

  // Request approval for transaction 1
  await user2Platform.requestApproval(1, "Need approval for payment to Bob");
  console.log("Requested approval for transaction 1");

  // Request approval for transaction 2
  await user2Platform.requestApproval(2, "Need approval for refund to John");
  console.log("Requested approval for transaction 2");

  // Request approval for transaction 3
  await user3Platform.requestApproval(
    3,
    "Need approval for consultation payment"
  );
  console.log("Requested approval for transaction 3");

  // Process some approvals
  console.log("Processing approvals...");
  const approver1Platform = financialPlatform.connect(approver1);

  // Approve transaction 1
  await approver1Platform.processApproval(
    1,
    true,
    "Approved - valid business transaction"
  );
  console.log("Approved transaction 1");

  // Reject transaction 2
  await approver1Platform.processApproval(
    2,
    false,
    "Rejected - insufficient documentation"
  );
  console.log("Rejected transaction 2");

  // Complete approved transaction
  await user2Platform.completeTransaction(1);
  console.log("Completed transaction 1");

  console.log("\nCreating comprehensive test data for existing users...");

  // Create diverse transaction scenarios for existing users
  console.log("Creating diverse transaction scenarios...");

  // User2 (Alice) creates multiple transactions
  await user2Platform.createTransaction(
    await user1.getAddress(),
    ethers.parseEther("750"),
    "Monthly consulting fee payment"
  );
  console.log("Created transaction 4: Alice -> John (consulting fee)");

  await user2Platform.createTransaction(
    await user3.getAddress(),
    ethers.parseEther("1200"),
    "Equipment purchase reimbursement"
  );
  console.log("Created transaction 5: Alice -> Bob (equipment)");

  await user2Platform.createTransaction(
    await approver1.getAddress(),
    ethers.parseEther("300"),
    "Office supplies expense"
  );
  console.log("Created transaction 6: Alice -> Sarah (supplies)");

  // User3 (Bob) creates transactions
  await user3Platform.createTransaction(
    await user2.getAddress(),
    ethers.parseEther("2000"),
    "Project collaboration payment"
  );
  console.log("Created transaction 7: Bob -> Alice (collaboration)");

  await user3Platform.createTransaction(
    await user1.getAddress(),
    ethers.parseEther("500"),
    "Training session fee"
  );
  console.log("Created transaction 8: Bob -> John (training)");

  await user3Platform.createTransaction(
    await approver1.getAddress(),
    ethers.parseEther("850"),
    "Software license reimbursement"
  );
  console.log("Created transaction 9: Bob -> Sarah (software)");

  // User1 (John - Manager) creates management-level transactions
  const user1Platform = financialPlatform.connect(user1);
  await user1Platform.createTransaction(
    await user2.getAddress(),
    ethers.parseEther("3500"),
    "Performance bonus payment"
  );
  console.log("Created transaction 10: John -> Alice (bonus)");

  await user1Platform.createTransaction(
    await user3.getAddress(),
    ethers.parseEther("4000"),
    "Project completion bonus"
  );
  console.log("Created transaction 11: John -> Bob (completion bonus)");

  // Approver1 (Sarah - Manager) creates transactions
  await approver1Platform.createTransaction(
    await user2.getAddress(),
    ethers.parseEther("1500"),
    "Department budget allocation"
  );
  console.log("Created transaction 12: Sarah -> Alice (budget)");

  await approver1Platform.createTransaction(
    await user1.getAddress(),
    ethers.parseEther("2200"),
    "Cross-department transfer"
  );
  console.log("Created transaction 13: Sarah -> John (transfer)");

  // Create some small value transactions (no approval needed)
  await user2Platform.createTransaction(
    await user3.getAddress(),
    ethers.parseEther("50"),
    "Coffee meeting expense"
  );
  console.log("Created transaction 14: Alice -> Bob (small expense)");

  await user3Platform.createTransaction(
    await user2.getAddress(),
    ethers.parseEther("75"),
    "Lunch reimbursement"
  );
  console.log("Created transaction 15: Bob -> Alice (lunch)");

  // Request approvals for transactions that need them
  console.log("\nRequesting approvals for transactions...");

  // Request approvals with detailed reasons
  await user2Platform.requestApproval(
    4,
    "Monthly consulting as per contract terms"
  );
  await user2Platform.requestApproval(
    5,
    "Equipment purchase with receipts attached"
  );
  await user2Platform.requestApproval(
    6,
    "Standard office supplies - within budget"
  );
  await user3Platform.requestApproval(
    7,
    "Collaboration on Q4 project deliverables"
  );
  await user3Platform.requestApproval(
    8,
    "Professional development training expense"
  );
  await user3Platform.requestApproval(9, "Annual software license renewal");
  await user1Platform.requestApproval(
    10,
    "Performance review bonus - exceeds targets"
  );
  await user1Platform.requestApproval(
    11,
    "Project delivered ahead of schedule"
  );
  await approver1Platform.requestApproval(12, "Quarterly budget reallocation");
  await approver1Platform.requestApproval(
    13,
    "Inter-department resource sharing"
  );

  console.log("Requested approvals for transactions 4-13");

  // Process approvals with various outcomes
  console.log("\nProcessing approvals with different outcomes...");

  // Approve transactions (different approvers)
  await approver1Platform.processApproval(
    4,
    true,
    "Approved - valid consulting contract"
  );
  await user1Platform.processApproval(
    5,
    true,
    "Approved - equipment needed for project"
  );
  await approver1Platform.processApproval(
    6,
    true,
    "Approved - routine office expense"
  );
  await user1Platform.processApproval(
    7,
    true,
    "Approved - project collaboration justified"
  );
  await approver1Platform.processApproval(
    8,
    false,
    "Rejected - training budget exhausted"
  );
  await user1Platform.processApproval(
    9,
    true,
    "Approved - essential software license"
  );

  // Leave some approvals pending for dashboard testing
  console.log("Left approvals 10-13 pending for dashboard testing");

  // Complete some approved transactions
  console.log("\nCompleting approved transactions...");
  await user2Platform.completeTransaction(4); // Alice completes consulting fee
  await user2Platform.completeTransaction(5); // Alice completes equipment purchase
  await user3Platform.completeTransaction(9); // Bob completes software license
  console.log("Completed transactions 4, 5, and 9");

  // Leave some approved but not completed for testing different states
  console.log("Left transactions 6 and 7 approved but not completed");

  // Create additional transactions without requesting approval (testing pending state)
  console.log("\nCreating additional pending transactions...");

  await user2Platform.createTransaction(
    await user1.getAddress(),
    ethers.parseEther("600"),
    "Pending: Client meeting expenses"
  );

  await user3Platform.createTransaction(
    await approver1.getAddress(),
    ethers.parseEther("900"),
    "Pending: Conference attendance fee"
  );

  await user1Platform.createTransaction(
    await user3.getAddress(),
    ethers.parseEther("1100"),
    "Pending: Team building event budget"
  );

  console.log("Created transactions 16-18 without approval requests");

  // Test role update functionality
  console.log("\nTesting role management...");
  // Temporarily promote user2 to Manager, then back to Regular
  await financialPlatform.updateUserRole(await user2.getAddress(), 1); // Promote to Manager
  console.log("Promoted Alice (user2) to Manager role");

  // Create a transaction as manager
  await user2Platform.createTransaction(
    await user3.getAddress(),
    ethers.parseEther("800"),
    "Manager-level transaction while promoted"
  );
  console.log("Created transaction 19: Alice -> Bob (as manager)");

  // Demote back to Regular
  await financialPlatform.updateUserRole(await user2.getAddress(), 0); // Back to Regular
  console.log("Demoted Alice (user2) back to Regular role");

  console.log("\nDeployment and setup completed successfully!");
  console.log("\nContract Addresses:");
  console.log("FinancialPlatform:", platformAddress);
  console.log("MockToken:", tokenAddress);
  console.log("\nTest Accounts:");
  console.log("Deployer (Admin):", await deployer.getAddress());
  console.log("User1 (Manager):", await user1.getAddress());
  console.log("User2 (Regular):", await user2.getAddress());
  console.log("User3 (Regular):", await user3.getAddress());
  console.log("Approver1 (Manager):", await approver1.getAddress());

  // Save deployment info for frontend
  const deploymentInfo = {
    network: "localhost",
    contracts: {
      FinancialPlatform: platformAddress,
      MockToken: tokenAddress,
    },
    testAccounts: {
      deployer: await deployer.getAddress(),
      user1: await user1.getAddress(),
      user2: await user2.getAddress(),
      user3: await user3.getAddress(),
      approver1: await approver1.getAddress(),
    },
  };

  const fs = require("fs");
  fs.writeFileSync(
    "deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\nDeployment info saved to deployment-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
