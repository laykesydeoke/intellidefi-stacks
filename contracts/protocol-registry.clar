;; Protocol Registry Contract - Core Foundation
;; IntelliDeFi Protocol - AI-Driven DeFi Strategies on Bitcoin

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u300))
(define-constant err-protocol-not-found (err u301))
(define-constant err-protocol-inactive (err u302))
(define-constant err-invalid-parameters (err u303))
(define-constant err-protocol-exists (err u304))
(define-constant err-insufficient-liquidity (err u305))

;; Protocol categories
(define-constant category-dex u1)
(define-constant category-lending u2)
(define-constant category-staking u3)
(define-constant category-yield u4)
(define-constant category-synthetic u5)

;; Data Variables
(define-data-var protocol-counter uint u0)
(define-data-var registry-paused bool false)

;; Data Maps
(define-map registered-protocols
  { protocol-id: uint }
  {
    name: (string-ascii 64),
    contract-address: principal,
    category: uint,
    is-active: bool,
    tvl: uint,
    fee-rate: uint,
    risk-score: uint,
    last-updated: uint
  }
)

(define-map protocol-integrations
  { protocol-id: uint }
  {
    deposit-function: (string-ascii 32),
    withdraw-function: (string-ascii 32),
    balance-function: (string-ascii 32),
    reward-function: (string-ascii 32),
    supported-tokens: (list 20 (string-ascii 12))
  }
)

(define-map protocol-analytics
  { protocol-id: uint }
  {
    total-volume: uint,
    average-apy: uint,
    volatility: uint,
    liquidity-depth: uint,
    user-count: uint,
    last-analyzed: uint
  }
)

(define-map whitelisted-protocols
  { protocol-address: principal }
  { is-whitelisted: bool, whitelisted-at: uint }
)

;; Read-only functions
(define-read-only (get-protocol (protocol-id uint))
  (map-get? registered-protocols { protocol-id: protocol-id })
)

(define-read-only (get-protocol-integration (protocol-id uint))
  (map-get? protocol-integrations { protocol-id: protocol-id })
)

(define-read-only (get-protocol-analytics (protocol-id uint))
  (map-get? protocol-analytics { protocol-id: protocol-id })
)

(define-read-only (is-protocol-whitelisted (protocol-address principal))
  (default-to false (get is-whitelisted (map-get? whitelisted-protocols { protocol-address: protocol-address })))
)

(define-read-only (get-protocol-counter)
  (var-get protocol-counter)
)

(define-read-only (is-registry-paused)
  (var-get registry-paused)
)

(define-read-only (get-protocols-by-category (category uint))
  (ok category) ;; Simplified - would filter protocols by category
)

;; Private functions
(define-private (is-contract-owner)
  (is-eq tx-sender contract-owner)
)

(define-private (validate-protocol-data 
  (name (string-ascii 64))
  (contract-address principal)
  (category uint)
  (fee-rate uint)
  (risk-score uint)
)
  (and
    (> (len name) u0)
    (not (is-eq contract-address tx-sender))
    (and (>= category u1) (<= category u5))
    (<= fee-rate u1000) ;; Max 10% fee
    (and (>= risk-score u1) (<= risk-score u10))
  )
)

;; Public functions
(define-public (register-protocol
  (name (string-ascii 64))
  (contract-address principal)
  (category uint)
  (fee-rate uint)
  (risk-score uint)
  (deposit-fn (string-ascii 32))
  (withdraw-fn (string-ascii 32))
  (balance-fn (string-ascii 32))
  (reward-fn (string-ascii 32))
)
  (let (
    (new-protocol-id (+ (var-get protocol-counter) u1))
  )
    (asserts! (is-contract-owner) err-owner-only)
    (asserts! (not (var-get registry-paused)) err-protocol-inactive)
    (asserts! (validate-protocol-data name contract-address category fee-rate risk-score) err-invalid-parameters)
    (asserts! (is-protocol-whitelisted contract-address) err-protocol-not-found)
    
    ;; Register main protocol data
    (map-set registered-protocols
      { protocol-id: new-protocol-id }
      {
        name: name,
        contract-address: contract-address,
        category: category,
        is-active: true,
        tvl: u0,
        fee-rate: fee-rate,
        risk-score: risk-score,
        last-updated: stacks-block-height
      }
    )
    
    ;; Register integration functions
    (map-set protocol-integrations
      { protocol-id: new-protocol-id }
      {
        deposit-function: deposit-fn,
        withdraw-function: withdraw-fn,
        balance-function: balance-fn,
        reward-function: reward-fn,
        supported-tokens: (list "STX" "USDA" "sBTC")
      }
    )
    
    ;; Initialize analytics
    (map-set protocol-analytics
      { protocol-id: new-protocol-id }
      {
        total-volume: u0,
        average-apy: u0,
        volatility: u0,
        liquidity-depth: u0,
        user-count: u0,
        last-analyzed: stacks-block-height
      }
    )
    
    (var-set protocol-counter new-protocol-id)
    (ok new-protocol-id)
  )
)

(define-public (whitelist-protocol (protocol-address principal))
  (begin
    (asserts! (is-contract-owner) err-owner-only)
    
    (map-set whitelisted-protocols
      { protocol-address: protocol-address }
      { is-whitelisted: true, whitelisted-at: stacks-block-height }
    )
    
    (ok true)
  )
)

(define-public (update-protocol-status (protocol-id uint) (is-active bool))
  (let (
    (protocol (unwrap! (get-protocol protocol-id) err-protocol-not-found))
  )
    (asserts! (is-contract-owner) err-owner-only)
    
    (map-set registered-protocols
      { protocol-id: protocol-id }
      (merge protocol { is-active: is-active, last-updated: stacks-block-height })
    )
    
    (ok true)
  )
)

(define-public (update-protocol-tvl (protocol-id uint) (new-tvl uint))
  (let (
    (protocol (unwrap! (get-protocol protocol-id) err-protocol-not-found))
  )
    (asserts! (is-contract-owner) err-owner-only)
    
    (map-set registered-protocols
      { protocol-id: protocol-id }
      (merge protocol { tvl: new-tvl, last-updated: stacks-block-height })
    )
    
    (ok true)
  )
)

(define-public (update-protocol-analytics
  (protocol-id uint)
  (total-volume uint)
  (average-apy uint)
  (volatility uint)
  (liquidity-depth uint)
  (user-count uint)
)
  (begin
    (asserts! (is-contract-owner) err-owner-only)
    (asserts! (is-some (get-protocol protocol-id)) err-protocol-not-found)
    
    (map-set protocol-analytics
      { protocol-id: protocol-id }
      {
        total-volume: total-volume,
        average-apy: average-apy,
        volatility: volatility,
        liquidity-depth: liquidity-depth,
        user-count: user-count,
        last-analyzed: stacks-block-height
      }
    )
    
    (ok true)
  )
)

(define-public (execute-protocol-action
  (protocol-id uint)
  (action-type (string-ascii 16))
  (amount uint)
  (token (string-ascii 12))
)
  (let (
    (protocol (unwrap! (get-protocol protocol-id) err-protocol-not-found))
    (integration (unwrap! (get-protocol-integration protocol-id) err-protocol-not-found))
  )
    (asserts! (get is-active protocol) err-protocol-inactive)
    (asserts! (not (var-get registry-paused)) err-protocol-inactive)
    (asserts! (> amount u0) err-invalid-parameters)
    
    ;; This would integrate with actual protocol contracts
    ;; For now, just validate and return success
    (ok true)
  )
)

(define-public (pause-registry)
  (begin
    (asserts! (is-contract-owner) err-owner-only)
    (var-set registry-paused true)
    (ok true)
  )
)

(define-public (unpause-registry)
  (begin
    (asserts! (is-contract-owner) err-owner-only)
    (var-set registry-paused false)
    (ok true)
  )
)

(define-public (get-protocol-health-score (protocol-id uint))
  (let (
    (protocol (unwrap! (get-protocol protocol-id) err-protocol-not-found))
    (analytics (unwrap! (get-protocol-analytics protocol-id) err-protocol-not-found))
  )
    (let (
      (tvl-score (if (> (get tvl protocol) u1000000) u100 u50))
      (risk-score (- u100 (* (get risk-score protocol) u10)))
      (liquidity-score (if (> (get liquidity-depth analytics) u500000) u100 u60))
    )
      (ok (/ (+ tvl-score risk-score liquidity-score) u3))
    )
  )
)
