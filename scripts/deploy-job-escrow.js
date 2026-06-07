const path = require('path');
const fs = require('fs');
const solc = require('solc');
const { createWalletClient, createPublicClient, http } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { defineChain } = require('viem');

// Load environment configuration
const privateKey = '0x0000000000000000000000000000000000000000000000000000000000000000';
const rpcUrl = 'https://rpc.testnet.arc.network';
const usdc = '0x3600000000000000000000000000000000000000';
const agentRegistry = '0xb4a614a597280888D3EEAB8a44562EAB59871270';

const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
  rpcUrls: {
    default: { http: [rpcUrl] },
  },
});

async function main() {
  console.log('Compiling JobEscrow.sol...');
  const contractPath = path.resolve(__dirname, '../contracts/JobEscrow.sol');
  const source = fs.readFileSync(contractPath, 'utf8');

  const input = {
    language: 'Solidity',
    sources: {
      'JobEscrow.sol': {
        content: source,
      },
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode.object'],
        },
      },
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors) {
    let hasError = false;
    for (const error of output.errors) {
      console.error(error.formattedMessage);
      if (error.severity === 'error') {
        hasError = true;
      }
    }
    if (hasError) {
      process.exit(1);
    }
  }

  const contract = output.contracts['JobEscrow.sol']['JobEscrow'];
  const abi = contract.abi;
  const bytecode = '0x' + contract.evm.bytecode.object;

  console.log('Deploying to Arc Testnet...');
  const account = privateKeyToAccount(privateKey);
  const walletClient = createWalletClient({
    account,
    chain: arcTestnet,
    transport: http(),
  });
  const publicClient = createPublicClient({
    chain: arcTestnet,
    transport: http(),
  });

  const hash = await walletClient.deployContract({
    abi,
    bytecode,
    args: [usdc, agentRegistry],
  });

  console.log('Transaction hash:', hash);
  console.log('Waiting for transaction confirmation...');
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log('JobEscrow deployed successfully!');
  console.log('Contract Address:', receipt.contractAddress);

  // Write ABI and address configuration
  const libConfigDir = path.resolve(__dirname, '../lib');
  if (!fs.existsSync(libConfigDir)) {
    fs.mkdirSync(libConfigDir, { recursive: true });
  }

  // Save the ABI and address configuration to lib/job-escrow.ts
  const jobEscrowTsContent = `export const JOB_ESCROW_ADDRESS = "${receipt.contractAddress}" as const;

export const jobEscrowAbi = ${JSON.stringify(abi, null, 2)} as const;
`;
  fs.writeFileSync(path.resolve(libConfigDir, 'job-escrow.ts'), jobEscrowTsContent, 'utf8');
  console.log('Saved ABI and Address configuration to lib/job-escrow.ts');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
