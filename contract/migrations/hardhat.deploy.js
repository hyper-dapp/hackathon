require('dotenv').config();
const { ethers } = require("hardhat");

const main = async () => {
  try {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    const CortexHub = await ethers.getContractFactory("CortexHub");
    const ch = await CortexHub.deploy();
    await ch.deployed();
    console.log(`deployed to ${ch.address}`);

    return console.log('SUCCESS: Deployment completed');
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

main();
