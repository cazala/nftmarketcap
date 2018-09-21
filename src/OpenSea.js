let contractsPromise
export async function getContracts() {
  if (!contractsPromise) {
    contractsPromise = fetch(
      'https://api.opensea.io/api/v1/asset_contracts/'
    ).then(r => r.json())
  }
  const contracts = await contractsPromise
  return contracts
}

export async function getContract(name) {
  const contracts = await getContracts()
  let contract = contracts.find(
    contract => contract.name.toLowerCase() === name.toLowerCase()
  )
  if (!contract) {
    contract = contracts.find(contract =>
      contract.name.toLowerCase().includes(name.toLowerCase())
    )
  }
  return contract
}
