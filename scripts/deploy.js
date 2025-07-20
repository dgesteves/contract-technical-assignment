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

  // Create realistic sample transactions with varied participation and statuses
  console.log("Creating realistic sample transactions...");

  // Get platform connections for different users
  const user1Platform = financialPlatform.connect(user1);
  const user2Platform = financialPlatform.connect(user2);
  const user3Platform = financialPlatform.connect(user3);
  const approver1Platform = financialPlatform.connect(approver1);

  // Track approval IDs as they are created sequentially
  let currentApprovalId = 0;

  // === COMPLETED TRANSACTIONS (approved and executed) ===
  console.log("\n1. Creating completed transactions...");

  // Transaction 1: Alice -> Bob (completed)
  await user2Platform.createTransaction(
    await user3.getAddress(),
    ethers.parseEther("750"),
    "Website development payment"
  );
  await user2Platform.requestApproval(
    1,
    "Payment for completed website project"
  );
  currentApprovalId++; // Approval ID 1
  await approver1Platform.processApproval(
    currentApprovalId,
    true,
    "Project delivered successfully"
  );
  await user2Platform.completeTransaction(1);
  console.log("✅ Transaction 1: Alice -> Bob (750 PLT) - COMPLETED");

  // Transaction 2: John -> Alice (completed)
  await user1Platform.createTransaction(
    await user2.getAddress(),
    ethers.parseEther("1200"),
    "Marketing campaign bonus"
  );
  currentApprovalId++; // Approval ID 2
  await user1Platform.requestApproval(2, "Team lunch expense");
  await approver1Platform.processApproval(currentApprovalId, true, "Approved");
  await user1Platform.completeTransaction(2);
  console.log("✅ Transaction 2: John -> Alice (1200 PLT) - COMPLETED");

  // === APPROVED BUT NOT COMPLETED ===
  console.log("\n2. Creating approved pending transactions...");

  // Transaction 3: Bob -> Sarah (approved, waiting for completion)
  await user3Platform.createTransaction(
    await approver1.getAddress(),
    ethers.parseEther("2000"),
    "Equipment purchase reimbursement"
  );
  currentApprovalId++; // Approval ID 3
  await user3Platform.requestApproval(
    3,
    "Office equipment for remote work setup"
  );
  await user1Platform.processApproval(
    currentApprovalId,
    true,
    "Approved for remote work support"
  );
  console.log(
    "⏳ Transaction 3: Bob -> Sarah (2000 PLT) - APPROVED, pending completion"
  );

  // Transaction 4: Sarah -> John (approved, waiting for completion)
  await approver1Platform.createTransaction(
    await user1.getAddress(),
    ethers.parseEther("800"),
    "Training course reimbursement"
  );
  currentApprovalId++; // Approval ID 4
  await approver1Platform.requestApproval(4, "Monthly subscription");
  await user1Platform.processApproval(currentApprovalId, true, "Approved");
  console.log(
    "⏳ Transaction 4: Sarah -> John (800 PLT) - APPROVED, pending completion"
  );

  // === PENDING APPROVAL ===
  console.log("\n3. Creating transactions pending approval...");

  // Transaction 5: Alice -> John (waiting for approval)
  await user2Platform.createTransaction(
    await user1.getAddress(),
    ethers.parseEther("1500"),
    "Client entertainment expenses"
  );
  currentApprovalId++; // Approval ID 5
  await user2Platform.requestApproval(
    5,
    "Dinner with potential enterprise client"
  );
  console.log("⏳ Transaction 5: Alice -> John (1500 PLT) - PENDING APPROVAL");

  // Transaction 6: Bob -> Alice (waiting for approval)
  await user3Platform.createTransaction(
    await user2.getAddress(),
    ethers.parseEther("650"),
    "Graphic design services"
  );
  currentApprovalId++; // Approval ID 6
  await user3Platform.requestApproval(6, "Logo and branding materials");
  console.log("⏳ Transaction 6: Bob -> Alice (650 PLT) - PENDING APPROVAL");

  // Transaction 7: John -> Sarah (waiting for approval - high amount)
  await user1Platform.createTransaction(
    await approver1.getAddress(),
    ethers.parseEther("5000"),
    "Software licensing annual fee"
  );
  currentApprovalId++; // Approval ID 7
  await user1Platform.requestApproval(
    7,
    "Enterprise software renewal for team"
  );
  console.log(
    "⏳ Transaction 7: John -> Sarah (5000 PLT) - PENDING APPROVAL (high amount)"
  );

  // === REJECTED TRANSACTIONS ===
  console.log("\n4. Creating rejected transactions...");

  // Transaction 8: Alice -> Sarah (will be rejected)
  await user2Platform.createTransaction(
    await approver1.getAddress(),
    ethers.parseEther("3500"),
    "Premium software subscription"
  );
  currentApprovalId++; // Approval ID 8
  await user2Platform.requestApproval(
    8,
    "Annual subscription for design software"
  );
  await approver1Platform.processApproval(
    currentApprovalId,
    false,
    "Budget exceeded - please find alternative solution"
  );
  console.log(
    "❌ Transaction 8: Alice -> Sarah (3500 PLT) - REJECTED (budget constraints)"
  );

  // Transaction 9: Bob -> John (will be rejected)
  await user3Platform.createTransaction(
    await user1.getAddress(),
    ethers.parseEther("2800"),
    "Conference travel expenses"
  );
  currentApprovalId++; // Approval ID 9
  await user3Platform.requestApproval(9, "International conference attendance");
  await user1Platform.processApproval(
    currentApprovalId,
    false,
    "Travel budget frozen due to company policy"
  );
  console.log(
    "❌ Transaction 9: Bob -> John (2800 PLT) - REJECTED (policy violation)"
  );

  // === DRAFT TRANSACTIONS (no approval requested) ===
  console.log("\n5. Creating draft transactions (no approval requested)...");

  // Transaction 10: John -> Bob (draft)
  await user1Platform.createTransaction(
    await user3.getAddress(),
    ethers.parseEther("450"),
    "Team lunch celebration"
  );
  console.log(
    "📝 Transaction 10: John -> Bob (450 PLT) - DRAFT (no approval requested)"
  );

  // Transaction 11: Sarah -> Alice (draft)
  await approver1Platform.createTransaction(
    await user2.getAddress(),
    ethers.parseEther("1800"),
    "Project milestone payment"
  );
  console.log(
    "📝 Transaction 11: Sarah -> Alice (1800 PLT) - DRAFT (no approval requested)"
  );

  // Transaction 12: Alice -> Bob (draft - small amount)
  await user2Platform.createTransaction(
    await user3.getAddress(),
    ethers.parseEther("75"),
    "Shared taxi fare"
  );
  console.log(
    "📝 Transaction 12: Alice -> Bob (75 PLT) - DRAFT (small expense)"
  );

  // === HIGH-VALUE TRANSACTIONS ===
  console.log("\n6. Creating high-value transactions...");

  // Transaction 13: John -> Sarah (high value, completed)
  await user1Platform.createTransaction(
    await approver1.getAddress(),
    ethers.parseEther("7500"),
    "Annual software licensing renewal"
  );
  currentApprovalId++; // Approval ID 10
  await user1Platform.requestApproval(
    13,
    "Critical business software renewal - expires soon"
  );
  await approver1Platform.processApproval(
    currentApprovalId,
    true,
    "Essential for operations - approved"
  );
  // Leave transaction 13 approved but not completed for now
  console.log(
    "⏳ Transaction 13: John -> Sarah (7500 PLT) - HIGH VALUE APPROVED"
  );

  // Transaction 14: Sarah -> John (high value, pending approval)
  await approver1Platform.createTransaction(
    await user1.getAddress(),
    ethers.parseEther("6200"),
    "Emergency equipment replacement"
  );
  currentApprovalId++; // Approval ID 11
  await approver1Platform.requestApproval(
    14,
    "Server crashed - need immediate replacement"
  );
  console.log(
    "⏳ Transaction 14: Sarah -> John (6200 PLT) - HIGH VALUE PENDING APPROVAL"
  );

  // === MICRO TRANSACTIONS ===
  console.log("\n7. Creating micro transactions...");

  // Transaction 15: Bob -> Alice (micro, completed)
  await user3Platform.createTransaction(
    await user2.getAddress(),
    ethers.parseEther("25"),
    "Coffee for late night work session"
  );
  currentApprovalId++; // Approval ID 12
  await user3Platform.requestApproval(15, "Small expense for team morale");
  await user1Platform.processApproval(
    currentApprovalId,
    true,
    "Team welfare approved"
  );
  await user3Platform.completeTransaction(15);
  console.log(
    "✅ Transaction 15: Bob -> Alice (25 PLT) - MICRO TRANSACTION COMPLETED"
  );

  // Transaction 16: Alice -> John (micro, draft)
  await user2Platform.createTransaction(
    await user1.getAddress(),
    ethers.parseEther("15"),
    "Parking fee reimbursement"
  );
  console.log(
    "📝 Transaction 16: Alice -> John (15 PLT) - MICRO TRANSACTION DRAFT"
  );

  // === DIVERSE SCENARIOS FOR TESTING ===
  console.log("\n8. Creating diverse test scenarios...");

  // Same-day multiple transactions from one user
  await user2Platform.createTransaction(
    await user3.getAddress(),
    ethers.parseEther("300"),
    "Morning: Client breakfast meeting"
  );
  await user2Platform.createTransaction(
    await user1.getAddress(),
    ethers.parseEther("150"),
    "Afternoon: Office supplies"
  );
  await user2Platform.createTransaction(
    await approver1.getAddress(),
    ethers.parseEther("500"),
    "Evening: Client dinner"
  );
  console.log(
    "📝 Transactions 17-19: Alice's busy day (multiple transactions)"
  );

  // Cross-approval scenario (different approvers)
  await user3Platform.createTransaction(
    await user2.getAddress(),
    ethers.parseEther("1100"),
    "Freelancer payment for design work"
  );
  currentApprovalId++; // Approval ID 13
  await user3Platform.requestApproval(20, "External contractor payment");
  await user1Platform.processApproval(
    currentApprovalId,
    true,
    "Quality work delivered - approved"
  );
  console.log(
    "⏳ Transaction 20: Bob -> Alice (1100 PLT) - APPROVED by different manager"
  );

  // === FINAL PROCESSING FOR REALISTIC STATUS DISTRIBUTION ===
  console.log("\n9. Final processing for realistic status distribution...");

  // Approve the high-value emergency transaction (using approval ID 11 from earlier)
  await user1Platform.processApproval(
    11, // This is the approval ID created when transaction 14 requested approval
    true,
    "Emergency approved - business continuity priority"
  );
  // Transaction 14 is created by Sarah, so Sarah completes it
  await approver1Platform.completeTransaction(14);
  console.log("✅ Completed high-value emergency transaction 14");

  // Complete the cross-approved transaction
  await user3Platform.completeTransaction(20);
  console.log("✅ Completed cross-approved transaction 20");

  // Now complete transaction 13 (should be active after approval)
  await user1Platform.completeTransaction(13);
  console.log("✅ Completed high-value transaction 13");

  // Request approval for one of Alice's busy day transactions
  currentApprovalId++; // Approval ID 13 (for transaction 19, but not processed)
  await user2Platform.requestApproval(
    19,
    "Important client dinner - relationship building"
  );
  console.log("⏳ Requested approval for transaction 19");

  // === ROLE TESTING ===
  console.log("\n10. Testing role management scenarios...");

  // Temporarily promote user2 to Manager for testing
  await financialPlatform.updateUserRole(await user2.getAddress(), 1);
  console.log("🔄 Promoted Alice (user2) to Manager role temporarily");

  // Create a high-value transaction as manager
  await user2Platform.createTransaction(
    await user3.getAddress(),
    ethers.parseEther("4500"),
    "Manager-level budget allocation"
  );
  currentApprovalId++; // Approval ID 15 (13=tx19, 14=tx20, 15=tx21)
  await user2Platform.requestApproval(
    21,
    "Department budget reallocation as manager"
  );
  console.log(
    `🔍 Processing approval ID ${currentApprovalId} for transaction 21`
  );
  await approver1Platform.processApproval(
    currentApprovalId,
    true,
    "Manager authority confirmed - approved"
  );
  console.log(
    `🔍 Approval ${currentApprovalId} processed, attempting to complete transaction 21`
  );
  await user2Platform.completeTransaction(21);
  console.log(
    "✅ Transaction 21: Alice -> Bob (4500 PLT) - COMPLETED as manager"
  );

  // Demote back to Regular
  await financialPlatform.updateUserRole(await user2.getAddress(), 0);
  console.log("🔄 Demoted Alice (user2) back to Regular role");

  console.log("\n=== FINAL TRANSACTION STATUS SUMMARY ===");
  console.log("✅ COMPLETED TRANSACTIONS:");
  console.log(
    "  - Transaction 1: Alice -> Bob (750 PLT) - Website development"
  );
  console.log("  - Transaction 2: John -> Alice (1200 PLT) - Marketing bonus");
  console.log(
    "  - Transaction 13: John -> Sarah (7500 PLT) - Software licensing"
  );
  console.log(
    "  - Transaction 14: Sarah -> John (6200 PLT) - Emergency equipment"
  );
  console.log("  - Transaction 15: Bob -> Alice (25 PLT) - Coffee expense");
  console.log(
    "  - Transaction 20: Bob -> Alice (1100 PLT) - Freelancer payment"
  );
  console.log(
    "  - Transaction 21: Alice -> Bob (4500 PLT) - Manager allocation"
  );

  console.log("\n⏳ APPROVED (pending completion):");
  console.log(
    "  - Transaction 3: Bob -> Sarah (2000 PLT) - Equipment reimbursement"
  );
  console.log(
    "  - Transaction 4: Sarah -> John (800 PLT) - Training reimbursement"
  );

  console.log("\n⏳ PENDING APPROVAL:");
  console.log(
    "  - Transaction 5: Alice -> John (1500 PLT) - Client entertainment"
  );
  console.log("  - Transaction 6: Bob -> Alice (650 PLT) - Graphic design");
  console.log(
    "  - Transaction 7: John -> Sarah (5000 PLT) - Software licensing"
  );
  console.log("  - Transaction 19: Alice -> Sarah (500 PLT) - Client dinner");

  console.log("\n❌ REJECTED TRANSACTIONS:");
  console.log("  - Transaction 8: Alice -> Sarah (3500 PLT) - Budget exceeded");
  console.log("  - Transaction 9: Bob -> John (2800 PLT) - Policy violation");

  console.log("\n📝 DRAFT TRANSACTIONS (no approval requested):");
  console.log("  - Transaction 10: John -> Bob (450 PLT) - Team lunch");
  console.log(
    "  - Transaction 11: Sarah -> Alice (1800 PLT) - Milestone payment"
  );
  console.log("  - Transaction 12: Alice -> Bob (75 PLT) - Taxi fare");
  console.log("  - Transaction 16: Alice -> John (15 PLT) - Parking fee");
  console.log("  - Transaction 17: Alice -> Bob (300 PLT) - Breakfast meeting");
  console.log("  - Transaction 18: Alice -> John (150 PLT) - Office supplies");

  console.log("\n📊 TRANSACTION STATISTICS:");
  console.log("  Total Transactions: 21");
  console.log("  Completed: 7 (33%)");
  console.log("  Approved Pending: 2 (10%)");
  console.log("  Pending Approval: 4 (19%)");
  console.log("  Rejected: 2 (10%)");
  console.log("  Draft: 6 (28%)");

  console.log("\n👥 USER PARTICIPATION DISTRIBUTION:");
  console.log("  Alice (user2): 9 transactions as sender");
  console.log("  John (user1): 4 transactions as sender");
  console.log("  Bob (user3): 4 transactions as sender");
  console.log("  Sarah (approver1): 4 transactions as sender");

  console.log("\n💰 AMOUNT RANGES:");
  console.log("  Micro (< 100 PLT): 4 transactions");
  console.log("  Small (100-1000 PLT): 8 transactions");
  console.log("  Medium (1000-3000 PLT): 6 transactions");
  console.log("  Large (> 3000 PLT): 3 transactions");

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
  const path = require("path");

  // Save deployment info JSON
  fs.writeFileSync(
    "deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\nDeployment info saved to deployment-info.json");

  // Update .env.local in financial-dashboard
  const envPath = path.join(__dirname, "../../financial-dashboard/.env.local");

  try {
    // Read current .env.local file
    let envContent = fs.readFileSync(envPath, "utf8");

    // Update the NEXT_PUBLIC_CONTRACT_ADDRESS line
    const contractAddressRegex = /^NEXT_PUBLIC_CONTRACT_ADDRESS=.*$/m;
    const newContractAddressLine = `NEXT_PUBLIC_CONTRACT_ADDRESS=${platformAddress}`;

    if (contractAddressRegex.test(envContent)) {
      // Replace existing line
      envContent = envContent.replace(
        contractAddressRegex,
        newContractAddressLine
      );
    } else {
      // Add new line if it doesn't exist
      envContent += `\n${newContractAddressLine}\n`;
    }

    // Write back to .env.local
    fs.writeFileSync(envPath, envContent);
    console.log(
      `Updated NEXT_PUBLIC_CONTRACT_ADDRESS in financial-dashboard/.env.local to: ${platformAddress}`
    );
  } catch (error) {
    console.warn("Warning: Could not update .env.local file:", error.message);
    console.log(
      "Please manually update NEXT_PUBLIC_CONTRACT_ADDRESS in financial-dashboard/.env.local to:",
      platformAddress
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
