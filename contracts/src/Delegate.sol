// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Delegate Contract (Custodial Batch Executor)
 * @notice This contract serves as an on-chain utility for the custodial backend.
 * It allows the backend, which signs transactions with the user's private key,
 * to execute multiple actions (like approvals and swaps) in a single, atomic transaction.
 * This is more gas-efficient than sending one transaction per action.
 */
contract Delegate {

    // Defines a single action to be executed. The `to` is the target contract
    // (e.g., a USDT contract), and `data` is the ABI-encoded function call
    // (e.g., the `approve` function with its parameters).
    struct Action {
        address to;
        uint256 value;
        bytes data;
    }

    event BatchExecuted(address indexed executor, uint256 actionCount);

    /**
     * @notice Executes a batch of arbitrary transactions.
     * @dev This function is intended to be called by your backend. The backend will
     * sign the transaction to call this function using the user's private key, making
     * the user the `msg.sender`.
     * @param actions An array of actions to execute sequentially.
     */
    function executeBatch(Action[] calldata actions) external {
        uint256 numActions = actions.length;
        for (uint256 i = 0; i < numActions; i++) {
            Action calldata action = actions[i];
            
            // The generic `call` function executes the provided calldata on the target contract.
            // This is how it can perform an `approve` on a token contract or a swap on a router.
            (bool success, ) = action.to.call{value: action.value}(action.data);
            require(success, "Chimera: Underlying batch action failed");
        }

        emit BatchExecuted(msg.sender, numActions);
    }
}