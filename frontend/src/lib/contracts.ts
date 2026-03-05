'use client';

import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  uintCV,
  stringAsciiCV,
  principalCV,
  intCV,
  boolCV,
  listCV,
  fetchCallReadOnlyFunction,
  cvToValue,
} from '@stacks/transactions';

import { getUserStxAddress as getStxAddress, network, STACKS_NETWORK_CONFIG } from './stacks';

const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';

export const CONTRACTS = {
  STRATEGY_ENGINE: `${CONTRACT_ADDRESS}.strategy-engine`,
  RISK_MANAGER: `${CONTRACT_ADDRESS}.risk-manager`,
  PROTOCOL_REGISTRY: `${CONTRACT_ADDRESS}.protocol-registry`,
  AI_ORACLE: `${CONTRACT_ADDRESS}.ai-oracle`,
  STRATEGY_OPTIMIZER: `${CONTRACT_ADDRESS}.strategy-optimizer`,
  AUDIT_TRAIL: `${CONTRACT_ADDRESS}.audit-trail`,
  COMPLIANCE_MONITOR: `${CONTRACT_ADDRESS}.compliance-monitor`,
} as const;

export const NETWORK_INFO = {
  chainId: network,
  name: STACKS_NETWORK_CONFIG.name,
  nodeUrl: STACKS_NETWORK_CONFIG.nodeUrl,
} as const;

const getUserStxAddress = () => getStxAddress();

// Helper function to deeply unwrap Clarity values
const deepUnwrapClarityValue = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return Number(obj);
  if (Array.isArray(obj)) return obj.map(item => deepUnwrapClarityValue(item));

  if (typeof obj === 'object') {
    const keys = Object.keys(obj);
    if (keys.length === 1 && keys[0] === 'value') {
      return deepUnwrapClarityValue(obj.value);
    }
    if ('type' in obj && 'value' in obj) {
      return deepUnwrapClarityValue(obj.value);
    }
    const unwrapped: any = {};
    for (const [key, val] of Object.entries(obj)) {
      unwrapped[key] = deepUnwrapClarityValue(val);
    }
    return unwrapped;
  }

  return obj;
};

const splitContract = (contractId: string) => ({
  contractAddress: contractId.split('.')[0],
  contractName: contractId.split('.')[1],
});

const defaultSender = () =>
  getUserStxAddress() || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';

// ============================================================
// Strategy Engine - Read Functions
// ============================================================

export const getStrategy = async (strategyId: number): Promise<any> => {
  try {
    const { contractAddress, contractName } = splitContract(CONTRACTS.STRATEGY_ENGINE);
    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-strategy',
      functionArgs: [uintCV(strategyId)],
      network,
      senderAddress: defaultSender(),
    });
    const value = cvToValue(result);
    return deepUnwrapClarityValue(value);
  } catch (error) {
    console.error('Error getting strategy:', error);
    return null;
  }
};

export const getUserBalance = async (strategyId: number, user: string): Promise<any> => {
  try {
    const { contractAddress, contractName } = splitContract(CONTRACTS.STRATEGY_ENGINE);
    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-user-balance',
      functionArgs: [uintCV(strategyId), principalCV(user)],
      network,
      senderAddress: user,
    });
    const value = cvToValue(result);
    return deepUnwrapClarityValue(value);
  } catch (error) {
    console.error('Error getting user balance:', error);
    return null;
  }
};

export const getStrategyCounter = async (): Promise<number> => {
  try {
    const { contractAddress, contractName } = splitContract(CONTRACTS.STRATEGY_ENGINE);
    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-strategy-counter',
      functionArgs: [],
      network,
      senderAddress: defaultSender(),
    });
    return Number(cvToValue(result)) || 0;
  } catch (error) {
    console.error('Error getting strategy counter:', error);
    return 0;
  }
};

export const isStrategyActive = async (strategyId: number): Promise<boolean> => {
  try {
    const { contractAddress, contractName } = splitContract(CONTRACTS.STRATEGY_ENGINE);
    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'is-strategy-active',
      functionArgs: [uintCV(strategyId)],
      network,
      senderAddress: defaultSender(),
    });
    return !!cvToValue(result);
  } catch (error) {
    return false;
  }
};

// ============================================================
// Risk Manager - Read Functions
// ============================================================

export const getUserRiskProfile = async (user: string): Promise<any> => {
  try {
    const { contractAddress, contractName } = splitContract(CONTRACTS.RISK_MANAGER);
    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-user-risk-profile',
      functionArgs: [principalCV(user)],
      network,
      senderAddress: user,
    });
    const value = cvToValue(result);
    return deepUnwrapClarityValue(value);
  } catch (error) {
    console.error('Error getting risk profile:', error);
    return null;
  }
};

export const getPortfolioRisk = async (user: string): Promise<any> => {
  try {
    const { contractAddress, contractName } = splitContract(CONTRACTS.RISK_MANAGER);
    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-portfolio-risk',
      functionArgs: [principalCV(user)],
      network,
      senderAddress: user,
    });
    const value = cvToValue(result);
    return deepUnwrapClarityValue(value);
  } catch (error) {
    console.error('Error getting portfolio risk:', error);
    return null;
  }
};

export const getMaxPortfolioRisk = async (): Promise<number> => {
  try {
    const { contractAddress, contractName } = splitContract(CONTRACTS.RISK_MANAGER);
    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-max-portfolio-risk',
      functionArgs: [],
      network,
      senderAddress: defaultSender(),
    });
    return Number(cvToValue(result)) || 0;
  } catch (error) {
    return 0;
  }
};

// ============================================================
// Protocol Registry - Read Functions
// ============================================================

export const getProtocol = async (protocolId: number): Promise<any> => {
  try {
    const { contractAddress, contractName } = splitContract(CONTRACTS.PROTOCOL_REGISTRY);
    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-protocol',
      functionArgs: [uintCV(protocolId)],
      network,
      senderAddress: defaultSender(),
    });
    const value = cvToValue(result);
    return deepUnwrapClarityValue(value);
  } catch (error) {
    console.error('Error getting protocol:', error);
    return null;
  }
};

export const isProtocolWhitelisted = async (protocolAddress: string): Promise<boolean> => {
  try {
    const { contractAddress, contractName } = splitContract(CONTRACTS.PROTOCOL_REGISTRY);
    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'is-protocol-whitelisted',
      functionArgs: [principalCV(protocolAddress)],
      network,
      senderAddress: defaultSender(),
    });
    return !!cvToValue(result);
  } catch (error) {
    return false;
  }
};

// ============================================================
// AI Oracle - Read Functions
// ============================================================

export const getOracle = async (oracleId: number): Promise<any> => {
  try {
    const { contractAddress, contractName } = splitContract(CONTRACTS.AI_ORACLE);
    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-oracle',
      functionArgs: [uintCV(oracleId)],
      network,
      senderAddress: defaultSender(),
    });
    const value = cvToValue(result);
    return deepUnwrapClarityValue(value);
  } catch (error) {
    console.error('Error getting oracle:', error);
    return null;
  }
};

export const getOracleData = async (oracleId: number, dataKey: string): Promise<any> => {
  try {
    const { contractAddress, contractName } = splitContract(CONTRACTS.AI_ORACLE);
    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-oracle-data',
      functionArgs: [uintCV(oracleId), stringAsciiCV(dataKey)],
      network,
      senderAddress: defaultSender(),
    });
    const value = cvToValue(result);
    return deepUnwrapClarityValue(value);
  } catch (error) {
    console.error('Error getting oracle data:', error);
    return null;
  }
};

export const getMarketSignal = async (signalId: number): Promise<any> => {
  try {
    const { contractAddress, contractName } = splitContract(CONTRACTS.AI_ORACLE);
    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-market-signal',
      functionArgs: [uintCV(signalId)],
      network,
      senderAddress: defaultSender(),
    });
    const value = cvToValue(result);
    return deepUnwrapClarityValue(value);
  } catch (error) {
    console.error('Error getting market signal:', error);
    return null;
  }
};

export const getAiPrediction = async (predictionId: number): Promise<any> => {
  try {
    const { contractAddress, contractName } = splitContract(CONTRACTS.AI_ORACLE);
    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-ai-prediction',
      functionArgs: [uintCV(predictionId)],
      network,
      senderAddress: defaultSender(),
    });
    const value = cvToValue(result);
    return deepUnwrapClarityValue(value);
  } catch (error) {
    console.error('Error getting AI prediction:', error);
    return null;
  }
};

// ============================================================
// Strategy Optimizer - Read Functions
// ============================================================

export const getOptimizationConfig = async (configId: number): Promise<any> => {
  try {
    const { contractAddress, contractName } = splitContract(CONTRACTS.STRATEGY_OPTIMIZER);
    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-optimization-config',
      functionArgs: [uintCV(configId)],
      network,
      senderAddress: defaultSender(),
    });
    const value = cvToValue(result);
    return deepUnwrapClarityValue(value);
  } catch (error) {
    console.error('Error getting optimization config:', error);
    return null;
  }
};

export const getStrategyPerformance = async (strategyId: number): Promise<any> => {
  try {
    const { contractAddress, contractName } = splitContract(CONTRACTS.STRATEGY_OPTIMIZER);
    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-strategy-performance',
      functionArgs: [uintCV(strategyId)],
      network,
      senderAddress: defaultSender(),
    });
    const value = cvToValue(result);
    return deepUnwrapClarityValue(value);
  } catch (error) {
    console.error('Error getting strategy performance:', error);
    return null;
  }
};

// ============================================================
// Audit Trail - Read Functions
// ============================================================

export const getAuditEntry = async (entryId: number): Promise<any> => {
  try {
    const { contractAddress, contractName } = splitContract(CONTRACTS.AUDIT_TRAIL);
    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-audit-entry',
      functionArgs: [uintCV(entryId)],
      network,
      senderAddress: defaultSender(),
    });
    const value = cvToValue(result);
    return deepUnwrapClarityValue(value);
  } catch (error) {
    console.error('Error getting audit entry:', error);
    return null;
  }
};

export const getEntryCounter = async (): Promise<number> => {
  try {
    const { contractAddress, contractName } = splitContract(CONTRACTS.AUDIT_TRAIL);
    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-entry-counter',
      functionArgs: [],
      network,
      senderAddress: defaultSender(),
    });
    return Number(cvToValue(result)) || 0;
  } catch (error) {
    return 0;
  }
};

// ============================================================
// Compliance Monitor - Read Functions
// ============================================================

export const getUserCompliance = async (user: string): Promise<any> => {
  try {
    const { contractAddress, contractName } = splitContract(CONTRACTS.COMPLIANCE_MONITOR);
    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-user-compliance',
      functionArgs: [principalCV(user)],
      network,
      senderAddress: user,
    });
    const value = cvToValue(result);
    return deepUnwrapClarityValue(value);
  } catch (error) {
    console.error('Error getting user compliance:', error);
    return null;
  }
};

export const isUserCompliant = async (user: string): Promise<boolean> => {
  try {
    const { contractAddress, contractName } = splitContract(CONTRACTS.COMPLIANCE_MONITOR);
    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'is-user-compliant',
      functionArgs: [principalCV(user)],
      network,
      senderAddress: user,
    });
    return !!cvToValue(result);
  } catch (error) {
    return false;
  }
};

// ============================================================
// Transaction status
// ============================================================

export const checkTransactionStatus = async (txId: string): Promise<any> => {
  try {
    const response = await fetch(`${NETWORK_INFO.nodeUrl}/extended/v1/tx/${txId}`);
    return await response.json();
  } catch (error) {
    console.error('Error checking transaction status:', error);
    return null;
  }
};

// ============================================================
// Formatting helpers
// ============================================================

export const formatStxAmount = (microStx: number): string => {
  const stx = microStx / 1_000_000;
  return `${stx.toFixed(6)} STX`;
};

export const stxToMicroStx = (stx: number): number => {
  return Math.floor(stx * 1_000_000);
};

export const microStxToStx = (microStx: number): number => {
  return microStx / 1_000_000;
};
