;; Risk Manager Contract - Core Foundation
;; IntelliDeFi Protocol - AI-Driven DeFi Strategies on Bitcoin

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u200))
(define-constant err-invalid-risk-level (err u201))
(define-constant err-risk-limit-exceeded (err u202))
(define-constant err-invalid-parameters (err u203))
(define-constant err-strategy-not-found (err u204))

;; Risk levels (1-10 scale)
(define-constant risk-conservative u3)
(define-constant risk-moderate u6)
(define-constant risk-aggressive u10)

;; Data Variables
(define-data-var global-risk-multiplier uint u100) ;; 100 = 1.0x, 150 = 1.5x
(define-data-var max-portfolio-risk uint u500)     ;; Max 5x leverage across portfolio

;; Data Maps
(define-map risk-parameters
  { risk-level: uint }
  {
    max-allocation: uint,      ;; Max allocation per strategy (basis points)
    volatility-threshold: uint, ;; Max volatility tolerance
    correlation-limit: uint,    ;; Max correlation between strategies
    drawdown-limit: uint       ;; Max acceptable drawdown
  }
)

(define-map strategy-risk-metrics
  { strategy-id: uint }
  {
    current-risk-score: uint,
    volatility: uint,
    max-drawdown: uint,
    sharpe-ratio: uint,
    last-updated: uint
  }
)

(define-map user-risk-profiles
  { user: principal }
  {
    risk-tolerance: uint,      ;; 1-10 scale
    max-exposure: uint,        ;; Max total exposure in STX
    diversification-min: uint, ;; Min number of strategies
    last-updated: uint
  }
)

(define-map portfolio-risk
  { user: principal }
  {
    total-exposure: uint,
    portfolio-risk-score: uint,
    correlation-score: uint,
    last-calculated: uint
  }
)

;; Read-only functions
(define-read-only (get-risk-parameters (risk-level uint))
  (map-get? risk-parameters { risk-level: risk-level })
)

(define-read-only (get-strategy-risk-metrics (strategy-id uint))
  (map-get? strategy-risk-metrics { strategy-id: strategy-id })
)

(define-read-only (get-user-risk-profile (user principal))
  (map-get? user-risk-profiles { user: user })
)

(define-read-only (get-portfolio-risk (user principal))
  (map-get? portfolio-risk { user: user })
)

(define-read-only (get-global-risk-multiplier)
  (var-get global-risk-multiplier)
)

(define-read-only (calculate-position-risk (strategy-id uint) (amount uint))
  (let (
    (strategy-risk (unwrap! (get-strategy-risk-metrics strategy-id) (err u0)))
    (risk-score (get current-risk-score strategy-risk))
    (volatility (get volatility strategy-risk))
  )
    (ok (* (* amount risk-score) volatility))
  )
)

;; Private functions
(define-private (is-contract-owner)
  (is-eq tx-sender contract-owner)
)

(define-private (validate-risk-level (risk-level uint))
  (and (>= risk-level u1) (<= risk-level u10))
)

(define-private (calculate-portfolio-correlation (user principal))
  ;; Simplified correlation calculation
  ;; In production, this would integrate with price oracles
  (let (
    (current-portfolio (default-to 
      { total-exposure: u0, portfolio-risk-score: u0, correlation-score: u0, last-calculated: u0 }
      (get-portfolio-risk user)))
  )
    (get correlation-score current-portfolio)
  )
)

;; Public functions
(define-public (initialize-risk-parameters)
  (begin
    ;; Conservative risk parameters
    (map-set risk-parameters
      { risk-level: risk-conservative }
      {
        max-allocation: u2000,      ;; 20% max allocation
        volatility-threshold: u1500, ;; 15% volatility limit
        correlation-limit: u5000,    ;; 50% correlation limit
        drawdown-limit: u1000       ;; 10% max drawdown
      }
    )
    
    ;; Moderate risk parameters
    (map-set risk-parameters
      { risk-level: risk-moderate }
      {
        max-allocation: u4000,      ;; 40% max allocation
        volatility-threshold: u2500, ;; 25% volatility limit
        correlation-limit: u7000,    ;; 70% correlation limit
        drawdown-limit: u2000       ;; 20% max drawdown
      }
    )
    
    ;; Aggressive risk parameters
    (map-set risk-parameters
      { risk-level: risk-aggressive }
      {
        max-allocation: u7000,      ;; 70% max allocation
        volatility-threshold: u5000, ;; 50% volatility limit
        correlation-limit: u9000,    ;; 90% correlation limit
        drawdown-limit: u4000       ;; 40% max drawdown
      }
    )
    
    (ok true)
  )
)

(define-public (set-user-risk-profile 
  (risk-tolerance uint)
  (max-exposure uint)
  (diversification-min uint)
)
  (begin
    (asserts! (validate-risk-level risk-tolerance) err-invalid-risk-level)
    (asserts! (> max-exposure u0) err-invalid-parameters)
    (asserts! (> diversification-min u0) err-invalid-parameters)
    
    (map-set user-risk-profiles
      { user: tx-sender }
      {
        risk-tolerance: risk-tolerance,
        max-exposure: max-exposure,
        diversification-min: diversification-min,
        last-updated: stacks-block-height
      }
    )
    
    (ok true)
  )
)

(define-public (update-strategy-risk-metrics
  (strategy-id uint)
  (risk-score uint)
  (volatility uint)
  (max-drawdown uint)
  (sharpe-ratio uint)
)
  (begin
    (asserts! (is-contract-owner) err-owner-only)
    (asserts! (validate-risk-level risk-score) err-invalid-risk-level)
    
    (map-set strategy-risk-metrics
      { strategy-id: strategy-id }
      {
        current-risk-score: risk-score,
        volatility: volatility,
        max-drawdown: max-drawdown,
        sharpe-ratio: sharpe-ratio,
        last-updated: stacks-block-height
      }
    )
    
    (ok true)
  )
)

(define-public (validate-investment
  (user principal)
  (strategy-id uint)
  (amount uint)
)
  (let (
    (user-profile (unwrap! (get-user-risk-profile user) err-invalid-parameters))
    (strategy-risk (unwrap! (get-strategy-risk-metrics strategy-id) err-strategy-not-found))
    (risk-params (unwrap! (get-risk-parameters (get risk-tolerance user-profile)) err-invalid-risk-level))
    (current-portfolio (default-to 
      { total-exposure: u0, portfolio-risk-score: u0, correlation-score: u0, last-calculated: u0 }
      (get-portfolio-risk user)))
  )
    ;; Check max exposure limit
    (asserts! (<= (+ (get total-exposure current-portfolio) amount) 
                  (get max-exposure user-profile)) err-risk-limit-exceeded)
    
    ;; Check strategy risk against user tolerance
    (asserts! (<= (get current-risk-score strategy-risk) 
                  (get risk-tolerance user-profile)) err-risk-limit-exceeded)
    
    ;; Check volatility threshold
    (asserts! (<= (get volatility strategy-risk) 
                  (get volatility-threshold risk-params)) err-risk-limit-exceeded)
    
    (ok true)
  )
)

(define-public (update-portfolio-risk (user principal))
  (let (
    (current-portfolio (default-to 
      { total-exposure: u0, portfolio-risk-score: u0, correlation-score: u0, last-calculated: u0 }
      (get-portfolio-risk user)))
    (correlation (calculate-portfolio-correlation user))
  )
    (map-set portfolio-risk
      { user: user }
      {
        total-exposure: (get total-exposure current-portfolio),
        portfolio-risk-score: (get portfolio-risk-score current-portfolio),
        correlation-score: correlation,
        last-calculated: stacks-block-height
      }
    )
    
    (ok true)
  )
)

(define-public (set-global-risk-multiplier (multiplier uint))
  (begin
    (asserts! (is-contract-owner) err-owner-only)
    (asserts! (and (>= multiplier u50) (<= multiplier u300)) err-invalid-parameters) ;; 0.5x to 3.0x
    
    (var-set global-risk-multiplier multiplier)
    (ok true)
  )
)
