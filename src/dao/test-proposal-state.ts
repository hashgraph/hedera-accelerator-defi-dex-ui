// Diagnostic script to test proposal state
// Run this in the browser console on your DAO page

import { DexService } from "@dex/services";
import { ethers } from "ethers";
import HederaGovernorJSON from "../../dex/services/abi/HederaGovernor.json";

const GOVERNOR_ADDRESS = "0.0.7116763";
const PROPOSAL_ID = "93627782243919611494315141068768409461670338957620492016886327214731039111093";

export async function testProposalState() {
  console.log("=== DIAGNOSTIC: Testing Proposal State ===");
  console.log("Governor Contract:", GOVERNOR_ADDRESS);
  console.log("Proposal ID:", PROPOSAL_ID);
  console.log("---");

  try {
    // Get contract EVM address
    const contractEVMAddress = await DexService.fetchContractEVMAddress(GOVERNOR_ADDRESS);
    console.log("Contract EVM Address:", contractEVMAddress);
    console.log("---");

    const contractInterface = new ethers.utils.Interface(HederaGovernorJSON.abi);

    // Test 1: Get voting period
    console.log("TEST 1: Query votingPeriod()");
    const votingPeriodData = contractInterface.encodeFunctionData("votingPeriod");
    const votingPeriodResponse = await DexService.callContract({
      to: contractEVMAddress,
      data: votingPeriodData,
      block: "latest",
    });
    const votingPeriod = contractInterface.decodeFunctionResult(
      "votingPeriod",
      ethers.utils.arrayify(votingPeriodResponse.data.result)
    )[0];
    console.log(`Voting Period: ${votingPeriod.toString()} seconds (${votingPeriod.toNumber() / 60} minutes)`);
    console.log("---");

    // Test 2: Get contract's current clock (timestamp)
    console.log("TEST 2: Query clock() - what the contract thinks current time is");
    const clockData = contractInterface.encodeFunctionData("clock");
    const clockResponse = await DexService.callContract({
      to: contractEVMAddress,
      data: clockData,
      block: "latest",
    });
    const contractClock = contractInterface.decodeFunctionResult(
      "clock",
      ethers.utils.arrayify(clockResponse.data.result)
    )[0];
    console.log(`Contract clock(): ${contractClock.toString()}`);
    console.log(`  → As date: ${new Date(contractClock.toNumber() * 1000).toLocaleString()}`);
    console.log("---");

    // Test 3: Get proposal snapshot (start time)
    console.log("TEST 3: Query proposalSnapshot() - voting start time");
    const snapshotData = contractInterface.encodeFunctionData("proposalSnapshot", [PROPOSAL_ID]);
    const snapshotResponse = await DexService.callContract({
      to: contractEVMAddress,
      data: snapshotData,
      block: "latest",
    });
    const snapshot = contractInterface.decodeFunctionResult(
      "proposalSnapshot",
      ethers.utils.arrayify(snapshotResponse.data.result)
    )[0];
    console.log(`Proposal Snapshot: ${snapshot.toString()}`);
    console.log(`  → As date: ${new Date(snapshot.toNumber() * 1000).toLocaleString()}`);
    console.log("---");

    // Test 4: Get proposal deadline (end time)
    console.log("TEST 4: Query proposalDeadline() - voting end time");
    const deadlineData = contractInterface.encodeFunctionData("proposalDeadline", [PROPOSAL_ID]);
    const deadlineResponse = await DexService.callContract({
      to: contractEVMAddress,
      data: deadlineData,
      block: "latest",
    });
    const deadline = contractInterface.decodeFunctionResult(
      "proposalDeadline",
      ethers.utils.arrayify(deadlineResponse.data.result)
    )[0];
    console.log(`Proposal Deadline: ${deadline.toString()}`);
    console.log(`  → As date: ${new Date(deadline.toNumber() * 1000).toLocaleString()}`);
    console.log("---");

    // Test 5: Get proposal state
    console.log("TEST 5: Query state() - current proposal state");
    const stateData = contractInterface.encodeFunctionData("state", [PROPOSAL_ID]);
    const stateResponse = await DexService.callContract({
      to: contractEVMAddress,
      data: stateData,
      block: "latest",
    });
    const state = contractInterface.decodeFunctionResult("state", ethers.utils.arrayify(stateResponse.data.result))[0];
    const stateNames = ["Pending", "Active", "Canceled", "Defeated", "Succeeded", "Queued", "Expired", "Executed"];
    console.log(`Current State: ${state} → ${stateNames[state]}`);
    console.log("---");

    // Analysis
    const currentRealTime = Math.floor(Date.now() / 1000);
    console.log("=== ANALYSIS ===");
    console.log(`Real current time: ${currentRealTime} → ${new Date(currentRealTime * 1000).toLocaleString()}`);
    console.log(
      `Contract clock: ${contractClock.toString()} → ${new Date(contractClock.toNumber() * 1000).toLocaleString()}`
    );
    console.log(`Proposal deadline: ${deadline.toString()} → ${new Date(deadline.toNumber() * 1000).toLocaleString()}`);
    console.log("---");
    console.log(`Time difference (real - contract clock): ${currentRealTime - contractClock.toNumber()} seconds`);
    console.log(`Voting ended (real time): ${currentRealTime >= deadline.toNumber()}`);
    console.log(`Voting ended (contract clock): ${contractClock.toNumber() >= deadline.toNumber()}`);
    console.log("---");

    if (contractClock.toNumber() < deadline.toNumber()) {
      console.error("🚨 PROBLEM FOUND:");
      const timeDiff = deadline.toNumber() - contractClock.toNumber();
      const minutesDiff = Math.floor(timeDiff / 60);
      console.error(`The contract's clock() is ${timeDiff} seconds (${minutesDiff} minutes) behind the deadline!`);
      console.error("This is why the state is still Pending/Active.");
      console.error("The Mirror Node may be simulating contract calls at a stale block timestamp.");
    } else {
      console.log("✅ Contract clock has passed the deadline.");
      console.log("The state should transition on the next call or block.");
    }

    console.log("=== END DIAGNOSTIC ===");
  } catch (error) {
    console.error("Error running diagnostic:", error);
  }
}

// Auto-run if imported
// testProposalState();
