import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  const TestRegistry = await ethers.getContractFactory("TestRegistry");
  const testRegistry = await TestRegistry.deploy();

  await testRegistry.waitForDeployment();

  const address = await testRegistry.getAddress();
  console.log("TestRegistry deployed to:", address);

  // Create a sample strategy
  console.log("\nCreating sample strategy...");
  const tx = await testRegistry.createStrategy(
    "sample-strategy-1",
    "Sample Test Strategy",
    9500, // 95% minimum pass rate
    5     // Minimum 5 tests
  );
  await tx.wait();
  console.log("Sample strategy created!");

  console.log("\nDeployment complete!");
  console.log("Contract address:", address);
  console.log("\nNext steps:");
  console.log("1. Update .env file with the contract address");
  console.log("2. Update frontend configuration with the contract address");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

