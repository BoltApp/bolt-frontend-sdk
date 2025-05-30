import { BoltSDK } from "@/index";

const boltChargeButton = document.getElementById("bolt-charge-button");

boltChargeButton?.addEventListener("click", () => {
  BoltSDK.charge
    .checkout(
      "https://gregs-guava-myshopify.c-staging.bolt.com/c?u=7oLxSjeYAcfTFpKsK2o43r&publishable_key=zQVb4QDUzwJD.GOxcEQV1ZNbW.bb17ba147d91e23de2647182d1381b60b281a2cd47092642a2fa214229cc43de"
    )
    .then(transaction => {
      console.log("Transaction Successful:", transaction);
    });
});
