import { useState } from "react";
import { parseEther } from "viem";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export const Greetings = () => {
  const [newGreeting, setNewGreeting] = useState("");
  const { writeContractAsync, isPending } = useScaffoldWriteContract("YourContract");

  const handleSetGreeting = async () => {
    try {
      await writeContractAsync(
        {
          functionName: "setGreeting",
          args: [newGreeting],
          value: parseEther("0.01"), // Optional: send 0.01 ETH
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("📦 Transaction blockHash", txnReceipt.blockHash);
          },
        },
      );
    } catch (e) {
      console.error("Error setting greeting", e);
    }
  };

  return (
    <>
      <input
        type="text"
        placeholder="Write your greeting"
        className="input border border-primary"
        onChange={e => setNewGreeting(e.target.value)}
      />
      <button className="btn btn-primary" onClick={handleSetGreeting} disabled={isPending}>
        {isPending ? <span className="loading loading-spinner loading-sm"></span> : "Send"}
      </button>
    </>
  );
};
