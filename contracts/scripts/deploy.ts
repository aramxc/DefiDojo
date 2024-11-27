import { ethers } from "hardhat";

async function main() {
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const unlockTime = currentTimestampInSeconds + 60; // Lock for 1 minute

  const lock = await ethers.deployContract("Lock", [unlockTime], {
    value: ethers.parseEther("0.1"), // Deploy with 0.1 ETH
  });

  await lock.waitForDeployment();

  console.log(
    `Lock with ${ethers.formatEther(
      ethers.parseEther("0.1")
    )}ETH and unlock timestamp ${unlockTime} deployed to ${lock.target}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});