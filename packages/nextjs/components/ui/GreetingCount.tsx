import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useAccount } from "wagmi";

export const GreetingsCount = () => {
  const { address: connectedAddress } = useAccount();
  const { data: totalCounter, isLoading: isTotalCounterLoading } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "totalCounter",
  });
  const { data: connectedAddressCounter, isLoading: isConnectedAddressCounterLoading } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "userGreetingCounter",
    args: [connectedAddress],
  });

  return (
    <div>
      <h2>Total Greetings count:</h2>
      {isTotalCounterLoading ? (
        <span className="loading loading-spinner"></span>
      ) : (
        <p className="m-0">{totalCounter ? totalCounter.toString() : 0}</p>
      )}
      <h2>Your Greetings count:</h2>
      {isConnectedAddressCounterLoading ? (
        <span className="loading loading-spinner"></span>
      ) : (
        <p className="m-0">{connectedAddressCounter ? connectedAddressCounter.toString() : 0}</p>
      )}
    </div>
  );
};
