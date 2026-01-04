const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";

export const STACKS_API_URL =
  process.env.NEXT_PUBLIC_STACKS_API_URL || "https://api.testnet.hiro.so";

export const CONTRACTS = {
  strategyEngine: {
    address: CONTRACT_ADDRESS,
    name: "strategy-engine",
  },
  riskManager: {
    address: CONTRACT_ADDRESS,
    name: "risk-manager",
  },
  protocolRegistry: {
    address: CONTRACT_ADDRESS,
    name: "protocol-registry",
  },
  aiOracle: {
    address: CONTRACT_ADDRESS,
    name: "ai-oracle",
  },
  strategyOptimizer: {
    address: CONTRACT_ADDRESS,
    name: "strategy-optimizer",
  },
  auditTrail: {
    address: CONTRACT_ADDRESS,
    name: "audit-trail",
  },
  complianceMonitor: {
    address: CONTRACT_ADDRESS,
    name: "compliance-monitor",
  },
} as const;

export const CONTRACT_FUNCTIONS = {
  strategyEngine: {
    createStrategy: "create-strategy",
    invest: "invest",
    withdraw: "withdraw",
    getStrategy: "get-strategy",
    getUserPosition: "get-user-position",
    deactivateStrategy: "deactivate-strategy",
  },
  riskManager: {
    setRiskProfile: "set-risk-profile",
    getRiskProfile: "get-risk-profile",
    validateRisk: "validate-risk",
    getPortfolioRisk: "get-portfolio-risk",
    assessStrategyRisk: "assess-strategy-risk",
  },
  protocolRegistry: {
    registerProtocol: "register-protocol",
    whitelistProtocol: "whitelist-protocol",
    getProtocol: "get-protocol",
    isWhitelisted: "is-whitelisted",
    deactivateProtocol: "deactivate-protocol",
  },
  aiOracle: {
    submitSignal: "submit-signal",
    getLatestSignal: "get-latest-signal",
    submitPrediction: "submit-prediction",
    getPrediction: "get-prediction",
    getRecommendation: "get-recommendation",
  },
  strategyOptimizer: {
    optimizePortfolio: "optimize-portfolio",
    rebalance: "rebalance",
    getOptimization: "get-optimization",
    setAllocation: "set-allocation",
    getAllocation: "get-allocation",
  },
  auditTrail: {
    logAction: "log-action",
    getLog: "get-log",
    getUserLogs: "get-user-logs",
    getActionCount: "get-action-count",
  },
  complianceMonitor: {
    verifyKyc: "verify-kyc",
    getKycStatus: "get-kyc-status",
    checkCompliance: "check-compliance",
    setJurisdiction: "set-jurisdiction",
    getComplianceStatus: "get-compliance-status",
  },
} as const;

export function parseContractId(
  contract: { address: string; name: string }
): string {
  return `${contract.address}.${contract.name}`;
}

export function getContractCallParams(
  contractKey: keyof typeof CONTRACTS,
  functionName: string
) {
  const contract = CONTRACTS[contractKey];
  return {
    contractAddress: contract.address,
    contractName: contract.name,
    functionName,
  };
}
