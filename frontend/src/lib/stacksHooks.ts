'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { showContractCall } from '@stacks/connect';
import {
  uintCV,
  intCV,
  stringAsciiCV,
  principalCV,
  AnchorMode,
  PostConditionMode,
} from '@stacks/transactions';
import {
  getStrategy,
  getUserBalance,
  getStrategyCounter,
  getUserRiskProfile,
  getPortfolioRisk,
  getOracle,
  getOracleData,
  getMarketSignal,
  getAiPrediction,
  getOptimizationConfig,
  getStrategyPerformance,
  getAuditEntry,
  getEntryCounter,
  getUserCompliance,
  isUserCompliant,
  getProtocol,
  checkTransactionStatus,
  CONTRACTS,
} from './contracts';
import { useStacks } from './StacksProvider';
import { network } from './stacks';

const DEPLOYER = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';

const splitContract = (contractId: string) => ({
  contractAddress: contractId.split('.')[0],
  contractName: contractId.split('.')[1],
});

// ============================================================
// Strategy Engine Hooks
// ============================================================

export function useCreateStrategy() {
  const [isLoading, setIsLoading] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const queryClient = useQueryClient();
  const { connected, address } = useStacks();

  const createStrategyFn = async (
    name: string,
    minAmount: number,
    maxAmount: number,
    riskLevel: number
  ) => {
    if (!connected || !address) {
      setError('Please connect your Stacks wallet first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      const { contractAddress, contractName } = splitContract(CONTRACTS.STRATEGY_ENGINE);

      await showContractCall({
        contractAddress,
        contractName,
        functionName: 'create-strategy',
        functionArgs: [
          stringAsciiCV(name),
          uintCV(minAmount),
          uintCV(maxAmount),
          uintCV(riskLevel),
        ],
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        appDetails: {
          name: 'IntelliDeFi Protocol',
          icon: typeof window !== 'undefined' ? window.location.origin + '/favicon.ico' : '',
        },
        onFinish: async (data: any) => {
          setTxId(data.txId);
          await new Promise(resolve => setTimeout(resolve, 5000));
          await queryClient.invalidateQueries({ queryKey: ['strategyCounter'] });
          setIsLoading(false);
          setIsSuccess(true);
        },
        onCancel: () => {
          setIsLoading(false);
          setError('Transaction cancelled');
        },
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create strategy');
      setIsLoading(false);
    }
  };

  return { createStrategy: createStrategyFn, isLoading, isPending: isLoading, txId, error, isSuccess };
}

export function useInvestInStrategy() {
  const [isLoading, setIsLoading] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const queryClient = useQueryClient();
  const { connected, address } = useStacks();

  const investFn = async (strategyId: number, amount: number) => {
    if (!connected || !address) {
      setError('Please connect your Stacks wallet first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      const { contractAddress, contractName } = splitContract(CONTRACTS.STRATEGY_ENGINE);

      await showContractCall({
        contractAddress,
        contractName,
        functionName: 'invest-in-strategy',
        functionArgs: [uintCV(strategyId), uintCV(amount)],
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        appDetails: {
          name: 'IntelliDeFi Protocol',
          icon: typeof window !== 'undefined' ? window.location.origin + '/favicon.ico' : '',
        },
        onFinish: async (data: any) => {
          setTxId(data.txId);
          await new Promise(resolve => setTimeout(resolve, 5000));
          await queryClient.invalidateQueries({ queryKey: ['strategy', strategyId] });
          await queryClient.invalidateQueries({ queryKey: ['userBalance', strategyId, address] });
          setIsLoading(false);
          setIsSuccess(true);
        },
        onCancel: () => {
          setIsLoading(false);
          setError('Transaction cancelled');
        },
      });
    } catch (err: any) {
      setError(err.message || 'Failed to invest');
      setIsLoading(false);
    }
  };

  return { invest: investFn, isLoading, isPending: isLoading, txId, error, isSuccess };
}

export function useWithdrawFromStrategy() {
  const [isLoading, setIsLoading] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const queryClient = useQueryClient();
  const { connected, address } = useStacks();

  const withdrawFn = async (strategyId: number, amount: number) => {
    if (!connected || !address) {
      setError('Please connect your Stacks wallet first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      const { contractAddress, contractName } = splitContract(CONTRACTS.STRATEGY_ENGINE);

      await showContractCall({
        contractAddress,
        contractName,
        functionName: 'withdraw-from-strategy',
        functionArgs: [uintCV(strategyId), uintCV(amount)],
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        appDetails: {
          name: 'IntelliDeFi Protocol',
          icon: typeof window !== 'undefined' ? window.location.origin + '/favicon.ico' : '',
        },
        onFinish: async (data: any) => {
          setTxId(data.txId);
          await new Promise(resolve => setTimeout(resolve, 5000));
          await queryClient.invalidateQueries({ queryKey: ['strategy', strategyId] });
          await queryClient.invalidateQueries({ queryKey: ['userBalance', strategyId, address] });
          setIsLoading(false);
          setIsSuccess(true);
        },
        onCancel: () => {
          setIsLoading(false);
          setError('Transaction cancelled');
        },
      });
    } catch (err: any) {
      setError(err.message || 'Failed to withdraw');
      setIsLoading(false);
    }
  };

  return { withdraw: withdrawFn, isLoading, isPending: isLoading, txId, error, isSuccess };
}

// ============================================================
// Risk Manager Hooks
// ============================================================

export function useSetRiskProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const queryClient = useQueryClient();
  const { connected, address } = useStacks();

  const setProfileFn = async (riskTolerance: number, maxExposure: number, diversificationMin: number) => {
    if (!connected || !address) {
      setError('Please connect your Stacks wallet first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      const { contractAddress, contractName } = splitContract(CONTRACTS.RISK_MANAGER);

      await showContractCall({
        contractAddress,
        contractName,
        functionName: 'set-user-risk-profile',
        functionArgs: [uintCV(riskTolerance), uintCV(maxExposure), uintCV(diversificationMin)],
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        appDetails: {
          name: 'IntelliDeFi Protocol',
          icon: typeof window !== 'undefined' ? window.location.origin + '/favicon.ico' : '',
        },
        onFinish: async (data: any) => {
          setTxId(data.txId);
          await new Promise(resolve => setTimeout(resolve, 3000));
          await queryClient.invalidateQueries({ queryKey: ['riskProfile', address] });
          await queryClient.invalidateQueries({ queryKey: ['portfolioRisk', address] });
          setIsLoading(false);
          setIsSuccess(true);
        },
        onCancel: () => {
          setIsLoading(false);
          setError('Transaction cancelled');
        },
      });
    } catch (err: any) {
      setError(err.message || 'Failed to set risk profile');
      setIsLoading(false);
    }
  };

  return { setRiskProfile: setProfileFn, isLoading, isPending: isLoading, txId, error, isSuccess };
}

// ============================================================
// AI Oracle Hooks
// ============================================================

export function useGenerateMarketSignal() {
  const [isLoading, setIsLoading] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const queryClient = useQueryClient();
  const { connected, address } = useStacks();

  const generateSignalFn = async (
    signalType: string,
    strength: number,
    direction: number,
    confidence: number,
    oracleId: number,
    duration: number
  ) => {
    if (!connected || !address) {
      setError('Please connect your Stacks wallet first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      const { contractAddress, contractName } = splitContract(CONTRACTS.AI_ORACLE);

      await showContractCall({
        contractAddress,
        contractName,
        functionName: 'generate-market-signal',
        functionArgs: [
          stringAsciiCV(signalType),
          uintCV(strength),
          intCV(direction),
          uintCV(confidence),
          uintCV(oracleId),
          uintCV(duration),
        ],
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        appDetails: {
          name: 'IntelliDeFi Protocol',
          icon: typeof window !== 'undefined' ? window.location.origin + '/favicon.ico' : '',
        },
        onFinish: async (data: any) => {
          setTxId(data.txId);
          await new Promise(resolve => setTimeout(resolve, 5000));
          await queryClient.invalidateQueries({ queryKey: ['marketSignal'] });
          setIsLoading(false);
          setIsSuccess(true);
        },
        onCancel: () => {
          setIsLoading(false);
          setError('Transaction cancelled');
        },
      });
    } catch (err: any) {
      setError(err.message || 'Failed to generate signal');
      setIsLoading(false);
    }
  };

  return { generateSignal: generateSignalFn, isLoading, isPending: isLoading, txId, error, isSuccess };
}

// ============================================================
// Compliance Hooks
// ============================================================

export function useRegisterUser() {
  const [isLoading, setIsLoading] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const queryClient = useQueryClient();
  const { connected, address } = useStacks();

  const registerFn = async (riskTier: number) => {
    if (!connected || !address) {
      setError('Please connect your Stacks wallet first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      const { contractAddress, contractName } = splitContract(CONTRACTS.COMPLIANCE_MONITOR);

      await showContractCall({
        contractAddress,
        contractName,
        functionName: 'register-user',
        functionArgs: [uintCV(riskTier)],
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        appDetails: {
          name: 'IntelliDeFi Protocol',
          icon: typeof window !== 'undefined' ? window.location.origin + '/favicon.ico' : '',
        },
        onFinish: async (data: any) => {
          setTxId(data.txId);
          await new Promise(resolve => setTimeout(resolve, 3000));
          await queryClient.invalidateQueries({ queryKey: ['userCompliance', address] });
          setIsLoading(false);
          setIsSuccess(true);
        },
        onCancel: () => {
          setIsLoading(false);
          setError('Transaction cancelled');
        },
      });
    } catch (err: any) {
      setError(err.message || 'Failed to register');
      setIsLoading(false);
    }
  };

  return { register: registerFn, isLoading, isPending: isLoading, txId, error, isSuccess };
}

// ============================================================
// Read-Only Query Hooks
// ============================================================

export function useStrategy(strategyId?: number) {
  return useQuery({
    queryKey: ['strategy', strategyId],
    queryFn: () => strategyId !== undefined ? getStrategy(strategyId) : Promise.resolve(null),
    enabled: strategyId !== undefined,
    staleTime: 30000,
  });
}

export function useUserBalance(strategyId?: number, userAddress?: string) {
  return useQuery({
    queryKey: ['userBalance', strategyId, userAddress],
    queryFn: () =>
      strategyId !== undefined && userAddress
        ? getUserBalance(strategyId, userAddress)
        : Promise.resolve(null),
    enabled: strategyId !== undefined && !!userAddress,
    staleTime: 15000,
  });
}

export function useStrategyCounter() {
  return useQuery({
    queryKey: ['strategyCounter'],
    queryFn: getStrategyCounter,
    staleTime: 60000,
  });
}

export function useRiskProfile(userAddress?: string) {
  return useQuery({
    queryKey: ['riskProfile', userAddress],
    queryFn: () => userAddress ? getUserRiskProfile(userAddress) : Promise.resolve(null),
    enabled: !!userAddress,
    staleTime: 30000,
  });
}

export function usePortfolioRisk(userAddress?: string) {
  return useQuery({
    queryKey: ['portfolioRisk', userAddress],
    queryFn: () => userAddress ? getPortfolioRisk(userAddress) : Promise.resolve(null),
    enabled: !!userAddress,
    staleTime: 30000,
  });
}

export function useOracle(oracleId?: number) {
  return useQuery({
    queryKey: ['oracle', oracleId],
    queryFn: () => oracleId !== undefined ? getOracle(oracleId) : Promise.resolve(null),
    enabled: oracleId !== undefined,
    staleTime: 60000,
  });
}

export function useOracleData(oracleId?: number, dataKey?: string) {
  return useQuery({
    queryKey: ['oracleData', oracleId, dataKey],
    queryFn: () =>
      oracleId !== undefined && dataKey
        ? getOracleData(oracleId, dataKey)
        : Promise.resolve(null),
    enabled: oracleId !== undefined && !!dataKey,
    staleTime: 30000,
  });
}

export function useMarketSignal(signalId?: number) {
  return useQuery({
    queryKey: ['marketSignal', signalId],
    queryFn: () => signalId !== undefined ? getMarketSignal(signalId) : Promise.resolve(null),
    enabled: signalId !== undefined,
    staleTime: 30000,
  });
}

export function useAiPrediction(predictionId?: number) {
  return useQuery({
    queryKey: ['aiPrediction', predictionId],
    queryFn: () => predictionId !== undefined ? getAiPrediction(predictionId) : Promise.resolve(null),
    enabled: predictionId !== undefined,
    staleTime: 30000,
  });
}

export function useOptimizationConfig(configId?: number) {
  return useQuery({
    queryKey: ['optimizationConfig', configId],
    queryFn: () => configId !== undefined ? getOptimizationConfig(configId) : Promise.resolve(null),
    enabled: configId !== undefined,
    staleTime: 60000,
  });
}

export function useStrategyPerformance(strategyId?: number) {
  return useQuery({
    queryKey: ['strategyPerformance', strategyId],
    queryFn: () => strategyId !== undefined ? getStrategyPerformance(strategyId) : Promise.resolve(null),
    enabled: strategyId !== undefined,
    staleTime: 30000,
  });
}

export function useProtocol(protocolId?: number) {
  return useQuery({
    queryKey: ['protocol', protocolId],
    queryFn: () => protocolId !== undefined ? getProtocol(protocolId) : Promise.resolve(null),
    enabled: protocolId !== undefined,
    staleTime: 60000,
  });
}

export function useAuditEntry(entryId?: number) {
  return useQuery({
    queryKey: ['auditEntry', entryId],
    queryFn: () => entryId !== undefined ? getAuditEntry(entryId) : Promise.resolve(null),
    enabled: entryId !== undefined,
    staleTime: 60000,
  });
}

export function useUserCompliance(userAddress?: string) {
  return useQuery({
    queryKey: ['userCompliance', userAddress],
    queryFn: () => userAddress ? getUserCompliance(userAddress) : Promise.resolve(null),
    enabled: !!userAddress,
    staleTime: 30000,
  });
}

export function useTransactionStatus(txId?: string) {
  return useQuery({
    queryKey: ['transactionStatus', txId],
    queryFn: () => txId ? checkTransactionStatus(txId) : Promise.resolve(null),
    enabled: !!txId,
    refetchInterval: 5000,
    staleTime: 0,
  });
}

export function useWalletInfo() {
  const { connected, address } = useStacks();
  return {
    isConnected: connected,
    address,
    shortAddress: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null,
  };
}
