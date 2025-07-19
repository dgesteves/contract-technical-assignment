# Development Setup Guide

## The Problem: Hardhat Node State Reset

**Why registration issues keep happening:**

- Hardhat's local node is **ephemeral** - it resets completely when restarted
- All deployed contracts are **lost** on restart
- All user registrations are **wiped**
- Contract addresses **change** on each deployment
- Frontend still points to **old addresses** causing decode errors

## Permanent Solution

### Option 1: Automated Setup (Recommended)

Use the automated setup script that handles everything:

```bash
# Terminal 1: Start Hardhat node
npm run node

# Terminal 2: Run complete setup (in a new terminal)
npm run dev:setup
```

This script will:

- ✅ Deploy the contract
- ✅ Register the admin account (0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266)
- ✅ Register test users
- ✅ Create sample data
- ✅ Update frontend .env.local automatically
- ✅ Save deployment info

### Option 2: Manual Steps

If you prefer manual control:

```bash
# 1. Start Hardhat node
npm run node

# 2. Deploy contract (in new terminal)
npm run deploy:localhost

# 3. Register admin account
node scripts/register-wallet.js 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 2 "Admin User" "admin@example.com"

# 4. Update frontend .env.local with the new contract address
# (Copy the address from deployment output)
```

## Important Notes

### Every Time You Restart Development:

1. **Stop the Hardhat node** (Ctrl+C)
2. **Restart the node**: `npm run node`
3. **Run setup**: `npm run dev:setup` (this is the key step!)
4. **Start frontend**: `cd ../financial-dashboard && npm run dev`

### Why This Happens

Hardhat's local development node is designed to be **stateless** for testing purposes. This is normal behavior, not a bug. In production, you would deploy to a persistent network (testnet/mainnet).

### Alternative: Persistent Local Node

If you want persistence, you can use Hardhat's forking feature:

```bash
# Fork mainnet (persistent across restarts)
npx hardhat node --fork https://eth-mainnet.alchemyapi.io/v2/YOUR-API-KEY

# Or use a local database (experimental)
npx hardhat node --hostname 0.0.0.0 --port 8545 --fork-block-number 18000000
```

## Quick Reference

### Account Addresses (Hardhat Default)

- **Admin**: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- **Manager**: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
- **User 1**: `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
- **User 2**: `0x90F79bf6EB2c4f870365E785982E1f101E93b906`

### Private Keys (for MetaMask import)

- **Admin**: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
- **Manager**: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`

## Troubleshooting

### "User is not registered" error

- ✅ Run `npm run dev:setup` after restarting the node
- ✅ Check that frontend .env.local has the correct contract address
- ✅ Verify MetaMask is connected to localhost:8545

### "Could not decode result data" error

- ✅ This means no contract at the configured address
- ✅ Run `npm run dev:setup` to deploy and configure everything

### Contract address mismatch

- ✅ Check `deployment-info.json` for the latest address
- ✅ Ensure frontend .env.local matches the deployed address
