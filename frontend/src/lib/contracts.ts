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
    investInStrategy: "invest-in-strategy",
    withdrawFromStrategy: "withdraw-from-strategy",
    toggleStrategyStatus: "toggle-strategy-status",
    getStrategy: "get-strategy",
    getUserBalance: "get-user-balance",
    getStrategyCounter: "get-strategy-counter",
    isStrategyActive: "is-strategy-active",
  },
  riskManager: {
    initRiskParameters: "init-risk-parameters",
    setUserRiskProfile: "set-user-risk-profile",
    updateStrategyRiskMetrics: "update-strategy-risk-metrics",
    validateInvestment: "validate-investment",
    setGlobalRiskMultiplier: "set-global-risk-multiplier",
    updatePortfolioRisk: "update-portfolio-risk",
    getUserRiskProfile: "get-user-risk-profile",
    getPortfolioRisk: "get-portfolio-risk",
    getMaxPortfolioRisk: "get-max-portfolio-risk",
  },
  protocolRegistry: {
    registerProtocol: "register-protocol",
    whitelistProtocol: "whitelist-protocol",
    updateProtocolStatus: "update-protocol-status",
    updateProtocolTvl: "update-protocol-tvl",
    pauseRegistry: "pause-registry",
    unpauseRegistry: "unpause-registry",
    getProtocol: "get-protocol",
    isProtocolWhitelisted: "is-protocol-whitelisted",
  },
  aiOracle: {
    registerOracle: "register-oracle",
    updateOracleData: "update-oracle-data",
    generateMarketSignal: "generate-market-signal",
    createAiPrediction: "create-ai-prediction",
    getAiRecommendation: "get-ai-recommendation",
    toggleOracleStatus: "toggle-oracle-status",
    setConfidenceThreshold: "set-confidence-threshold",
    getOracle: "get-oracle",
    getOracleData: "get-oracle-data",
  },
  strategyOptimizer: {
    createOptimizationConfig: "create-optimization-config",
    optimizeStrategy: "optimize-strategy",
    executeRebalance: "execute-rebalance",
    updateStrategyPerformance: "update-strategy-performance",
    toggleOptimizationConfig: "toggle-optimization-config",
    setRebalanceInterval: "set-rebalance-interval",
    getOptimizationConfig: "get-optimization-config",
    getOptimizationRecommendation: "get-optimization-recommendation",
  },
  auditTrail: {
    logAction: "log-action",
    authorizeLogger: "authorize-logger",
    revokeLogger: "revoke-logger",
    toggleAudit: "toggle-audit",
    getAuditEntry: "get-audit-entry",
    getEntryCounter: "get-entry-counter",
  },
  complianceMonitor: {
    registerUser: "register-user",
    verifyUser: "verify-user",
    suspendUser: "suspend-user",
    checkTransactionCompliance: "check-transaction-compliance",
    appointComplianceOfficer: "appoint-compliance-officer",
    setComplianceRule: "set-compliance-rule",
    setMaxTransactionAmount: "set-max-transaction-amount",
    isUserCompliant: "is-user-compliant",
    getUserCompliance: "get-user-compliance",
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
