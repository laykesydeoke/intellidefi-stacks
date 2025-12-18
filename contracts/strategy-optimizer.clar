;; Strategy Optimizer Contract - AI Integration
;; IntelliDeFi Protocol - AI-Driven DeFi Strategies on Bitcoin

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u500))
(define-constant err-strategy-not-found (err u501))
(define-constant err-invalid-parameters (err u502))
(define-constant err-optimization-failed (err u503))
(define-constant err-insufficient-data (err u504))
(define-constant err-rebalance-too-frequent (err u505))

;; Optimization types
(define-constant opt-maximize-return u1)
(define-constant opt-minimize-risk u2)
(define-constant opt-maximize-sharpe u3)
(define-constant opt-diversification u4)
(define-constant opt-yield-farming u5)

;; Data Variables
(define-data-var optimization-counter uint u0)
(define-data-var min-rebalance-interval uint u144) ;; ~24 hours
(define-data-var default-optimization-window uint u4320) ;; ~30 days

;; Data Maps
(define-map optimization-configs
  { config-id: uint }
  {
    strategy-id: uint,
    optimization-type: uint,
    target-return: uint,
    max-risk: uint,
    rebalance-frequency: uint,
    is-active: bool,
    created-at: uint
  }
)

(define-map portfolio-allocations
  { strategy-id: uint, protocol-id: uint }
  {
    current-allocation: uint,
    target-allocation: uint,
    last-rebalanced: uint,
    performance-score: uint
  }
)

(define-map optimization-results
  { optimization-id: uint }
  {
    strategy-id: uint,
    optimization-type: uint,
    predicted-return: uint,
    predicted-risk: uint,
    confidence: uint,
    allocations: (list 10 { protocol-id: uint, allocation: uint }),
    created-at: uint
  }
)

(define-map strategy-performance
  { strategy-id: uint }
  {
    total-return: uint,
    volatility: uint,
    sharpe-ratio: uint,
    max-drawdown: uint,
    win-rate: uint,
    last-updated: uint
  }
)

(define-map rebalance-history
  { rebalance-id: uint }
  {
    strategy-id: uint,
    old-allocations: (list 10 { protocol-id: uint, allocation: uint }),
    new-allocations: (list 10 { protocol-id: uint, allocation: uint }),
    trigger-reason: (string-ascii 64),
    executed-at: uint
  }
)

;; Read-only functions
(define-read-only (get-optimization-config (config-id uint))
  (map-get? optimization-configs { config-id: config-id })
)

(define-read-only (get-portfolio-allocation (strategy-id uint) (protocol-id uint))
  (map-get? portfolio-allocations { strategy-id: strategy-id, protocol-id: protocol-id })
)

(define-read-only (get-optimization-result (optimization-id uint))
  (map-get? optimization-results { optimization-id: optimization-id })
)

(define-read-only (get-strategy-performance (strategy-id uint))
  (map-get? strategy-performance { strategy-id: strategy-id })
)

(define-read-only (get-optimization-counter)
  (var-get optimization-counter)
)

(define-read-only (can-rebalance (strategy-id uint))
  (match (get-portfolio-allocation strategy-id u1) ;; Check first protocol
    allocation (> (- stacks-block-height (get last-rebalanced allocation)) (var-get min-rebalance-interval))
    true ;; No previous rebalance
  )
)

;; Private functions
(define-private (is-contract-owner)
  (is-eq tx-sender contract-owner)
)

(define-private (validate-optimization-type (opt-type uint))
  (and (>= opt-type u1) (<= opt-type u5))
)

(define-private (calculate-sharpe-ratio (returns uint) (volatility uint))
  (if (> volatility u0)
    (/ (* returns u10000) volatility)
    u0
  )
)

(define-private (calculate-portfolio-risk (allocations (list 10 { protocol-id: uint, allocation: uint })))
  ;; Simplified risk calculation - would be more complex in production
  (fold + (map get-allocation-risk allocations) u0)
)

(define-private (get-allocation-risk (allocation { protocol-id: uint, allocation: uint }))
  (* (get allocation allocation) u5) ;; Simplified risk factor
)

;; Public functions
(define-public (create-optimization-config
  (strategy-id uint)
  (optimization-type uint)
  (target-return uint)
  (max-risk uint)
  (rebalance-frequency uint)
)
  (let (
    (new-config-id (+ (var-get optimization-counter) u1))
  )
    (asserts! (is-contract-owner) err-owner-only)
    (asserts! (> strategy-id u0) err-invalid-parameters)
    (asserts! (validate-optimization-type optimization-type) err-invalid-parameters)
    (asserts! (> target-return u0) err-invalid-parameters)
    (asserts! (> max-risk u0) err-invalid-parameters)
    (asserts! (> rebalance-frequency u0) err-invalid-parameters)
    
    (map-set optimization-configs
      { config-id: new-config-id }
      {
        strategy-id: strategy-id,
        optimization-type: optimization-type,
        target-return: target-return,
        max-risk: max-risk,
        rebalance-frequency: rebalance-frequency,
        is-active: true,
        created-at: stacks-block-height
      }
    )
    
    (var-set optimization-counter new-config-id)
    (ok new-config-id)
  )
)

(define-public (optimize-strategy
  (strategy-id uint)
  (optimization-type uint)
  (market-conditions (string-ascii 32))
)
  (let (
    (optimization-id (+ (var-get optimization-counter) u1))
    (predicted-return (+ u1000 (* strategy-id u100))) ;; Simplified calculation
    (predicted-risk (+ u500 (* strategy-id u50)))     ;; Simplified calculation
    (confidence u8500) ;; 85% confidence
  )
    (asserts! (> strategy-id u0) err-invalid-parameters)
    (asserts! (validate-optimization-type optimization-type) err-invalid-parameters)
    
    ;; Create optimized allocations (simplified)
    (let (
      (allocations (list 
        { protocol-id: u1, allocation: u4000 }  ;; 40%
        { protocol-id: u2, allocation: u3000 }  ;; 30%
        { protocol-id: u3, allocation: u2000 }  ;; 20%
        { protocol-id: u4, allocation: u1000 }  ;; 10%
      ))
    )
      (map-set optimization-results
        { optimization-id: optimization-id }
        {
          strategy-id: strategy-id,
          optimization-type: optimization-type,
          predicted-return: predicted-return,
          predicted-risk: predicted-risk,
          confidence: confidence,
          allocations: allocations,
          created-at: stacks-block-height
        }
      )
      
      (var-set optimization-counter optimization-id)
      (ok optimization-id)
    )
  )
)

(define-public (execute-rebalance
  (strategy-id uint)
  (new-allocations (list 10 { protocol-id: uint, allocation: uint }))
  (trigger-reason (string-ascii 64))
)
  (let (
    (rebalance-id (+ (var-get optimization-counter) u1))
  )
    (asserts! (is-contract-owner) err-owner-only)
    (asserts! (> strategy-id u0) err-invalid-parameters)
    (asserts! (can-rebalance strategy-id) err-rebalance-too-frequent)
    
    ;; Update portfolio allocations
    (let (
      (first-allocation (unwrap! (element-at new-allocations u0) err-invalid-parameters))
    )
      (map-set portfolio-allocations
        { strategy-id: strategy-id, protocol-id: (get protocol-id first-allocation) }
        {
          current-allocation: (get allocation first-allocation),
          target-allocation: (get allocation first-allocation),
          last-rebalanced: stacks-block-height,
          performance-score: u0
        }
      )
    )
    
    ;; Record rebalance history
    (map-set rebalance-history
      { rebalance-id: rebalance-id }
      {
        strategy-id: strategy-id,
        old-allocations: (list), ;; Would store previous allocations
        new-allocations: new-allocations,
        trigger-reason: trigger-reason,
        executed-at: stacks-block-height
      }
    )
    
    (ok rebalance-id)
  )
)

(define-public (update-strategy-performance
  (strategy-id uint)
  (total-return uint)
  (volatility uint)
  (max-drawdown uint)
  (win-rate uint)
)
  (begin
    (asserts! (is-contract-owner) err-owner-only)
    (asserts! (> strategy-id u0) err-invalid-parameters)
    (asserts! (<= win-rate u10000) err-invalid-parameters) ;; Max 100%
    
    (let (
      (sharpe (calculate-sharpe-ratio total-return volatility))
    )
      (map-set strategy-performance
        { strategy-id: strategy-id }
        {
          total-return: total-return,
          volatility: volatility,
          sharpe-ratio: sharpe,
          max-drawdown: max-drawdown,
          win-rate: win-rate,
          last-updated: stacks-block-height
        }
      )
      
      (ok true)
    )
  )
)

(define-public (get-optimization-recommendation 
  (strategy-id uint)
  (user-risk-tolerance uint)
  (market-sentiment (string-ascii 16))
)
  (let (
    (performance (get-strategy-performance strategy-id))
  )
    (asserts! (> strategy-id u0) err-invalid-parameters)
    (asserts! (and (>= user-risk-tolerance u1) (<= user-risk-tolerance u10)) err-invalid-parameters)
    
    ;; Generate recommendation based on risk tolerance and market sentiment
    (let (
      (recommended-allocation (if (<= user-risk-tolerance u3) u2000 u5000)) ;; Conservative vs aggressive
      (confidence-score u7500) ;; 75% confidence
    )
      (ok {
        action: "rebalance",
        allocation-change: recommended-allocation,
        confidence: confidence-score,
        reason: "risk-adjusted-optimization"
      })
    )
  )
)

(define-public (auto-optimize-strategy (strategy-id uint))
  (let (
    (performance (get-strategy-performance strategy-id))
  )
    (asserts! (> strategy-id u0) err-invalid-parameters)
    (asserts! (can-rebalance strategy-id) err-rebalance-too-frequent)
    
    ;; Auto-optimization logic based on performance
    (match performance
      perf-data (let (
        (current-sharpe (get sharpe-ratio perf-data))
        (target-sharpe u15000) ;; Target 1.5 Sharpe ratio
      )
        (if (< current-sharpe target-sharpe)
          (optimize-strategy strategy-id opt-maximize-sharpe "auto-optimization")
          (ok u0) ;; No optimization needed
        )
      )
      (ok u0) ;; No performance data available
    )
  )
)

(define-public (set-rebalance-interval (new-interval uint))
  (begin
    (asserts! (is-contract-owner) err-owner-only)
    (asserts! (> new-interval u0) err-invalid-parameters)
    
    (var-set min-rebalance-interval new-interval)
    (ok true)
  )
)

(define-public (toggle-optimization-config (config-id uint))
  (let (
    (config (unwrap! (get-optimization-config config-id) err-strategy-not-found))
  )
    (asserts! (is-contract-owner) err-owner-only)
    
    (map-set optimization-configs
      { config-id: config-id }
      (merge config { is-active: (not (get is-active config)) })
    )
    
    (ok true)
  )
)
