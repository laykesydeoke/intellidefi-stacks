'use client';

import { useState } from 'react';

interface OracleData {
  id: number;
  name: string;
  type: string;
  status: 'active' | 'inactive';
  confidence: number;
  lastUpdated: string;
}

const mockOracles: OracleData[] = [
  { id: 1, name: 'Market Analyzer', type: 'Market Analysis', status: 'active', confidence: 92, lastUpdated: '2 min ago' },
  { id: 2, name: 'Risk Assessor', type: 'Risk Assessment', status: 'active', confidence: 88, lastUpdated: '5 min ago' },
  { id: 3, name: 'Yield Predictor', type: 'Yield Prediction', status: 'active', confidence: 85, lastUpdated: '8 min ago' },
  { id: 4, name: 'Portfolio Optimizer', type: 'Optimization', status: 'inactive', confidence: 0, lastUpdated: 'N/A' },
];

interface Prediction {
  strategyId: number;
  predictedReturn: string;
  riskScore: number;
  confidence: number;
  horizon: string;
}

const mockPredictions: Prediction[] = [
  { strategyId: 1, predictedReturn: '+12.5%', riskScore: 3, confidence: 89, horizon: '30 days' },
  { strategyId: 2, predictedReturn: '+8.2%', riskScore: 5, confidence: 82, horizon: '14 days' },
  { strategyId: 3, predictedReturn: '+22.1%', riskScore: 7, confidence: 76, horizon: '90 days' },
];

export default function OraclePage() {
  const [activeTab, setActiveTab] = useState<'oracles' | 'predictions' | 'signals'>('oracles');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">AI Oracle</h1>
        <p className="mt-2 text-gray-400">
          Machine learning-powered market analysis and strategy predictions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-400">Active Oracles</p>
          <p className="text-2xl font-bold text-white mt-1">3</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-400">Avg Confidence</p>
          <p className="text-2xl font-bold text-green-400 mt-1">88.3%</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-400">Predictions Today</p>
          <p className="text-2xl font-bold text-white mt-1">47</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-400">Signals Generated</p>
          <p className="text-2xl font-bold text-purple-400 mt-1">156</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {(['oracles', 'predictions', 'signals'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'oracles' && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Oracle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Confidence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {mockOracles.map((oracle) => (
                <tr key={oracle.id} className="border-b border-gray-800/50">
                  <td className="px-6 py-4 text-sm text-white font-medium">{oracle.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{oracle.type}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      oracle.status === 'active'
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-gray-500/10 text-gray-400'
                    }`}>
                      {oracle.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-white">{oracle.confidence > 0 ? `${oracle.confidence}%` : '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{oracle.lastUpdated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'predictions' && (
        <div className="space-y-4">
          {mockPredictions.map((prediction) => (
            <div key={prediction.strategyId} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Strategy #{prediction.strategyId}</h3>
                  <p className="text-sm text-gray-400 mt-1">Horizon: {prediction.horizon}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-400">{prediction.predictedReturn}</p>
                  <p className="text-sm text-gray-400">Confidence: {prediction.confidence}%</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex-1 bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${prediction.confidence}%` }}
                  />
                </div>
                <span className={`text-sm font-medium ${
                  prediction.riskScore <= 3 ? 'text-green-400' :
                  prediction.riskScore <= 6 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  Risk: {prediction.riskScore}/10
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'signals' && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="space-y-4">
            {[
              { type: 'Bullish', strength: 78, asset: 'BTC', time: '5m ago' },
              { type: 'Neutral', strength: 52, asset: 'STX', time: '12m ago' },
              { type: 'Bearish', strength: 65, asset: 'USDA', time: '23m ago' },
              { type: 'Bullish', strength: 89, asset: 'BTC', time: '31m ago' },
            ].map((signal, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-800/50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${
                    signal.type === 'Bullish' ? 'bg-green-400' :
                    signal.type === 'Bearish' ? 'bg-red-400' : 'bg-yellow-400'
                  }`} />
                  <span className="text-sm text-white font-medium">{signal.asset}</span>
                  <span className={`text-sm ${
                    signal.type === 'Bullish' ? 'text-green-400' :
                    signal.type === 'Bearish' ? 'text-red-400' : 'text-yellow-400'
                  }`}>{signal.type}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400">Strength: {signal.strength}%</span>
                  <span className="text-xs text-gray-500">{signal.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
