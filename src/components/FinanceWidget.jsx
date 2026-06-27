import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import './FinanceWidget.css';

const INITIAL_ASSETS = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 192.25, change: '+1.24%', trend: 'up', type: 'stock' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 177.46, change: '-0.85%', trend: 'down', type: 'stock' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 415.13, change: '+2.11%', trend: 'up', type: 'stock' },
  { symbol: 'BTC', name: 'Bitcoin', price: 67240.50, change: '+4.56%', trend: 'up', type: 'crypto' },
  { symbol: 'ETH', name: 'Ethereum', price: 3482.15, change: '-1.20%', trend: 'down', type: 'crypto' }
];

const ASSET_LOGOS = {
  AAPL: (
    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '18px', height: '18px', color: '#000000' }}>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.69-1.12 1.84-.98 2.94.97.08 2.07-.47 2.81-1.33z" />
    </svg>
  ),
  TSLA: (
    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '18px', height: '18px', color: '#E82127' }}>
      <path d="M12.15 4.02C15.02 4.02 17.65 4.8 19.8 6.1l.46-1.12c-2.47-1.5-5.5-2.38-8.8-2.38-3.32 0-6.35.88-8.8 2.38l.46 1.12c2.14-1.3 4.77-2.08 7.64-2.08zm-.15 2.76c-2 .02-3.88.58-5.46 1.55l.44 1.08c1.4-.87 3.06-1.38 4.85-1.4 1.8.02 3.45.53 4.85 1.4l.44-1.08c-1.58-.97-3.46-1.53-5.46-1.55zm.08 3.53c-1.2.02-2.34.34-3.32.9l.4 1c.84-.48 1.8-.75 2.82-.77 1.03.02 1.98.3 2.82.77l.4-1c-.98-.56-2.12-.88-3.32-.9zm-.08 3.25c-.5.02-.97.14-1.38.35.2.2.35.47.4.77V21.5h1.9v-6.6c.05-.3.2-.57.4-.77-.4-.2-.88-.33-1.38-.35z" />
    </svg>
  ),
  MSFT: (
    <svg viewBox="0 0 23 23" style={{ width: '18px', height: '18px' }}>
      <path fill="#F25022" d="M0 0h10.5v10.5H0z"/>
      <path fill="#7FBA00" d="M11.5 0h10.5v10.5H11.5z"/>
      <path fill="#00A4EF" d="M0 11.5h10.5v10.5H0z"/>
      <path fill="#FFB900" d="M11.5 11.5h10.5v10.5H11.5z"/>
    </svg>
  ),
  BTC: (
    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '18px', height: '18px', color: '#F7931A' }}>
      <path d="M23.633 10.67c.29-1.91-1.17-2.93-3.16-3.62l.65-2.58-1.57-.39-.63 2.53c-.41-.1-.83-.2-1.24-.3l.63-2.54-1.57-.39-.65 2.59c-.34-.08-.68-.15-1-.23l.003-.01-2.17-.54-.42 1.68s1.17.27 1.14.28c.64.16.75.58.73.91l-.73 2.94c.04.01.1.03.16.05-.05-.01-.1-.03-.16-.05l-1.02 4.1c-.08.2-.28.5-.73.39.02.03-1.14-.28-1.14-.28l-.78 1.8 2.05.51c.38.1.75.2 1.12.29l-.66 2.65 1.57.39.65-2.61c.43.12.85.23 1.26.33l-.65 2.61 1.57.39.66-2.65c2.68.51 4.7.31 5.55-2.12.69-1.96-.03-3.09-1.45-3.83.69-.16 1.21-.62 1.35-1.56zm-4.78 4.97c-.49 1.96-3.79.9-4.86.63l.87-3.48c1.07.27 4.51.79 3.99 2.85zm.49-4.99c-.44 1.79-3.19.88-4.08.66l.79-3.16c.89.22 3.75.63 3.29 2.5z" />
    </svg>
  ),
  ETH: (
    <svg viewBox="0 0 784 1277" fill="currentColor" style={{ width: '11px', height: '18px', color: '#627EEA' }}>
      <path d="M392 0L0 649l392 232 392-232L392 0z" opacity=".6"/>
      <path d="M392 0v881l392-232L392 0z"/>
      <path d="M392 948L0 716l392 561V948z" opacity=".6"/>
      <path d="M392 948v329l392-561L392 948z"/>
      <path d="M392 881L0 649l392 232V881z" opacity=".2"/>
      <path d="M392 881v232l392-232H392z" opacity=".2"/>
    </svg>
  )
};

export default function FinanceWidget() {
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [tickStates, setTickStates] = useState({}); // Stores 'up' or 'down' for temporary flash styles

  useEffect(() => {
    const interval = setInterval(() => {
      // Pick 1 or 2 random assets to update every second for realistic ticks
      setAssets((prevAssets) => {
        const nextAssets = prevAssets.map((asset) => {
          // 70% chance of updating each second for a highly active feel
          if (Math.random() < 0.7) {
            const isUp = Math.random() > 0.48; // Slight upward bias
            const percentChange = (Math.random() * 0.08) / 100; // Tiny price variation (0.00% to 0.08%)
            const diff = asset.price * percentChange;
            const newPrice = isUp ? asset.price + diff : asset.price - diff;

            // Keep track of tick direction for flashing effect
            setTickStates(prev => ({
              ...prev,
              [asset.symbol]: isUp ? 'up' : 'down'
            }));

            // Clear the tick flash style after 600ms
            setTimeout(() => {
              setTickStates(prev => {
                const next = { ...prev };
                delete next[asset.symbol];
                return next;
              });
            }, 600);

            // Re-calculate the percentage change from initial
            const initialAsset = INITIAL_ASSETS.find(a => a.symbol === asset.symbol);
            const totalDiff = newPrice - initialAsset.price;
            const totalPercent = ((totalDiff / initialAsset.price) * 100).toFixed(2);
            const sign = totalDiff >= 0 ? '+' : '';

            return {
              ...asset,
              price: parseFloat(newPrice.toFixed(2)),
              change: `${sign}${totalPercent}%`,
              trend: totalDiff >= 0 ? 'up' : 'down'
            };
          }
          return asset;
        });
        return nextAssets;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="finance-widget">
      <div className="widget-header">
        <TrendingUp size={16} className="trend-icon" />
        <span className="widget-title">LIVE MARKETS</span>
      </div>

      <div className="finance-list">
        {assets.map((asset) => {
          const isUp = asset.trend === 'up';
          const tick = tickStates[asset.symbol]; // 'up', 'down', or undefined

          return (
            <div 
              key={asset.symbol} 
              className={`asset-row ${tick ? `flash-${tick}` : ''}`}
            >
              <div className="asset-info">
                <div className="asset-logo-container">
                  {ASSET_LOGOS[asset.symbol]}
                </div>
                <div className="asset-meta">
                  <div className="asset-symbol-row">
                    <span className="asset-symbol">{asset.symbol}</span>
                    <span className="asset-name">{asset.name}</span>
                  </div>
                  <span className="asset-type-label">{asset.type.toUpperCase()}</span>
                </div>
              </div>
              
              <div className="asset-values">
                <span className="asset-price">
                  ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={`asset-change ${isUp ? 'trend-up' : 'trend-down'}`}>
                  {isUp ? '+' : ''}{asset.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
