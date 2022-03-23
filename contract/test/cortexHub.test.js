require('dotenv').config();
const { solidity } = require("ethereum-waffle");
const chai = require("chai");
const { ethers } = require("hardhat");
chai.use(solidity);
const {
  expect,
  assert
} = chai;
const { BigNumber } = ethers;

describe("CortexHub", () => {
  let ch;

  beforeEach(async () => {
    const CortexHub = await ethers.getContractFactory("CortexHub");

    ch = await CortexHub.deploy(...Arguments);
  });
});
