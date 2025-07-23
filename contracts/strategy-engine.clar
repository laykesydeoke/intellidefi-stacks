;; Strategy Engine Contract - Core Foundation
;; IntelliDeFi Protocol - AI-Driven DeFi Strategies on Bitcoin

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-strategy-not-found (err u101))
(define-constant err-insufficient-balance (err u102))
(define-constant err-strategy-inactive (err u103))
(define-constant err-invalid-parameters (err u104))

;; Data Variables
(define-data-var strategy-counter uint u0)

;; Data Maps
(define-map strategies
  { strategy-id: uint }
  {
    name: (string-ascii 64),
    creator: principal,
    is-active: bool,
    min-amount: uint,
    max-amount: uint,
    risk-level: uint,
    created-at: uint
  }
)

(define-map strategy-balances
  { strategy-id: uint, user: principal }
  { amount: uint, last-updated: uint }
)

(define-map user-strategies
  { user: principal }
  { strategy-ids: (list 50 uint) }
)

;; Read-only functions
(define-read-only (get-strategy (strategy-id uint))
  (map-get? strategies { strategy-id: strategy-id })
)

(define-read-only (get-user-balance (strategy-id uint) (user principal))
  (map-get? strategy-balances { strategy-id: strategy-id, user: user })
)

(define-read-only (get-user-strategies (user principal))
  (map-get? user-strategies { user: user })
)

(define-read-only (get-strategy-counter)
  (var-get strategy-counter)
)

;; Private functions
(define-private (is-contract-owner)
  (is-eq tx-sender contract-owner)
)

(define-private (validate-strategy-params (name (string-ascii 64)) (min-amount uint) (max-amount uint) (risk-level uint))
  (and
    (> (len name) u0)
    (> min-amount u0)
    (> max-amount min-amount)
    (<= risk-level u10)
  )
)

;; Public functions
(define-public (create-strategy 
  (name (string-ascii 64))
  (min-amount uint)
  (max-amount uint)
  (risk-level uint)
)
  (let (
    (new-strategy-id (+ (var-get strategy-counter) u1))
  )
    (asserts! (validate-strategy-params name min-amount max-amount risk-level) err-invalid-parameters)
    
    (map-set strategies
      { strategy-id: new-strategy-id }
      {
        name: name,
        creator: tx-sender,
        is-active: true,
        min-amount: min-amount,
        max-amount: max-amount,
        risk-level: risk-level,
        created-at: stacks-block-height
      }
    )
    
    (var-set strategy-counter new-strategy-id)
    (ok new-strategy-id)
  )
)

(define-public (invest-in-strategy (strategy-id uint) (amount uint))
  (let (
    (strategy (unwrap! (get-strategy strategy-id) err-strategy-not-found))
    (current-balance (default-to { amount: u0, last-updated: u0 } 
                       (get-user-balance strategy-id tx-sender)))
  )
    (asserts! (get is-active strategy) err-strategy-inactive)
    (asserts! (>= amount (get min-amount strategy)) err-insufficient-balance)
    (asserts! (<= amount (get max-amount strategy)) err-insufficient-balance)
    
    (map-set strategy-balances
      { strategy-id: strategy-id, user: tx-sender }
      { 
        amount: (+ (get amount current-balance) amount),
        last-updated: stacks-block-height
      }
    )
    
    (ok true)
  )
)

(define-public (withdraw-from-strategy (strategy-id uint) (amount uint))
  (let (
    (strategy (unwrap! (get-strategy strategy-id) err-strategy-not-found))
    (current-balance (unwrap! (get-user-balance strategy-id tx-sender) err-insufficient-balance))
  )
    (asserts! (<= amount (get amount current-balance)) err-insufficient-balance)
    
    (map-set strategy-balances
      { strategy-id: strategy-id, user: tx-sender }
      { 
        amount: (- (get amount current-balance) amount),
        last-updated: stacks-block-height
      }
    )
    
    (ok true)
  )
)

(define-public (toggle-strategy-status (strategy-id uint))
  (let (
    (strategy (unwrap! (get-strategy strategy-id) err-strategy-not-found))
  )
    (asserts! (is-eq tx-sender (get creator strategy)) err-owner-only)
    
    (map-set strategies
      { strategy-id: strategy-id }
      (merge strategy { is-active: (not (get is-active strategy)) })
    )
    
    (ok true)
  )
)
