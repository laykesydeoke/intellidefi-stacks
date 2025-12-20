;; Audit Trail Contract - Compliance Foundation
;; IntelliDeFi Protocol - Immutable Action Logging

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u600))
(define-constant err-invalid-parameters (err u601))
(define-constant err-entry-not-found (err u602))
(define-constant err-unauthorized (err u603))

;; Action types
(define-constant action-deposit u1)
(define-constant action-withdrawal u2)
(define-constant action-strategy-create u3)
(define-constant action-strategy-update u4)
(define-constant action-rebalance u5)
(define-constant action-risk-update u6)
(define-constant action-oracle-update u7)
(define-constant action-compliance-check u8)

;; Data Variables
(define-data-var entry-counter uint u0)
(define-data-var audit-enabled bool true)

;; Data Maps
(define-map audit-entries
  { entry-id: uint }
  {
    actor: principal,
    action-type: uint,
    target-id: uint,
    amount: uint,
    description: (string-ascii 128),
    block-recorded: uint
  }
)

(define-map user-audit-count
  { user: principal }
  { total-actions: uint, last-action-block: uint }
)

(define-map action-type-count
  { action-type: uint }
  { count: uint }
)

(define-map authorized-loggers
  { logger: principal }
  { is-authorized: bool, authorized-at: uint }
)

;; Read-only functions
(define-read-only (get-audit-entry (entry-id uint))
  (map-get? audit-entries { entry-id: entry-id })
)

(define-read-only (get-user-audit-count (user principal))
  (map-get? user-audit-count { user: user })
)

(define-read-only (get-action-count (action-type uint))
  (default-to u0 (get count (map-get? action-type-count { action-type: action-type })))
)

(define-read-only (get-entry-counter)
  (var-get entry-counter)
)

(define-read-only (is-audit-enabled)
  (var-get audit-enabled)
)

(define-read-only (is-authorized-logger (logger principal))
  (default-to false (get is-authorized (map-get? authorized-loggers { logger: logger })))
)

;; Private functions
(define-private (is-contract-owner)
  (is-eq tx-sender contract-owner)
)

(define-private (validate-action-type (action-type uint))
  (and (>= action-type u1) (<= action-type u8))
)

(define-private (increment-action-count (action-type uint))
  (let (
    (current-count (get-action-count action-type))
  )
    (map-set action-type-count
      { action-type: action-type }
      { count: (+ current-count u1) }
    )
  )
)

;; Public functions
(define-public (log-action
  (action-type uint)
  (target-id uint)
  (amount uint)
  (description (string-ascii 128))
)
  (let (
    (new-entry-id (+ (var-get entry-counter) u1))
    (user-stats (default-to { total-actions: u0, last-action-block: u0 }
                  (get-user-audit-count tx-sender)))
  )
    (asserts! (var-get audit-enabled) err-unauthorized)
    (asserts! (or (is-contract-owner) (is-authorized-logger tx-sender)) err-unauthorized)
    (asserts! (validate-action-type action-type) err-invalid-parameters)
    (asserts! (> (len description) u0) err-invalid-parameters)

    (map-set audit-entries
      { entry-id: new-entry-id }
      {
        actor: tx-sender,
        action-type: action-type,
        target-id: target-id,
        amount: amount,
        description: description,
        block-recorded: stacks-block-height
      }
    )

    (map-set user-audit-count
      { user: tx-sender }
      {
        total-actions: (+ (get total-actions user-stats) u1),
        last-action-block: stacks-block-height
      }
    )

    (increment-action-count action-type)
    (var-set entry-counter new-entry-id)
    (ok new-entry-id)
  )
)

(define-public (authorize-logger (logger principal))
  (begin
    (asserts! (is-contract-owner) err-owner-only)

    (map-set authorized-loggers
      { logger: logger }
      { is-authorized: true, authorized-at: stacks-block-height }
    )
    (ok true)
  )
)

(define-public (revoke-logger (logger principal))
  (begin
    (asserts! (is-contract-owner) err-owner-only)

    (map-set authorized-loggers
      { logger: logger }
      { is-authorized: false, authorized-at: stacks-block-height }
    )
    (ok true)
  )
)

(define-public (toggle-audit (enabled bool))
  (begin
    (asserts! (is-contract-owner) err-owner-only)
    (var-set audit-enabled enabled)
    (ok true)
  )
)
