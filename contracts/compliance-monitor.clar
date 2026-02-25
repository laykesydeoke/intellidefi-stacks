;; Compliance Monitor Contract - Regulatory Foundation
;; IntelliDeFi Protocol - Institutional Compliance Enforcement

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u700))
(define-constant err-invalid-parameters (err u701))
(define-constant err-not-found (err u702))
(define-constant err-compliance-violation (err u703))
(define-constant err-already-verified (err u704))

;; Compliance status
(define-constant status-pending u0)
(define-constant status-approved u1)
(define-constant status-rejected u2)
(define-constant status-suspended u3)

;; Data Variables
(define-data-var compliance-enabled bool true)
(define-data-var max-transaction-amount uint u100000000000) ;; 1000 STX default
(define-data-var daily-limit uint u500000000000) ;; 5000 STX default
(define-data-var verification-counter uint u0)

;; Data Maps
(define-map user-compliance
  { user: principal }
  {
    status: uint,
    risk-tier: uint,
    verified-at: uint,
    expires-at: uint,
    total-volume: uint,
    transaction-count: uint
  }
)

(define-map compliance-rules
  { rule-id: uint }
  {
    name: (string-ascii 64),
    max-amount: uint,
    min-holding-period: uint,
    requires-verification: bool,
    is-active: bool
  }
)

(define-map transaction-limits
  { user: principal }
  {
    daily-volume: uint,
    last-reset-block: uint,
    transactions-today: uint
  }
)

(define-map compliance-officers
  { officer: principal }
  { is-active: bool, appointed-at: uint }
)

;; Read-only functions
(define-read-only (get-user-compliance (user principal))
  (map-get? user-compliance { user: user })
)

(define-read-only (get-compliance-rule (rule-id uint))
  (map-get? compliance-rules { rule-id: rule-id })
)

(define-read-only (get-transaction-limits (user principal))
  (map-get? transaction-limits { user: user })
)

(define-read-only (is-user-compliant (user principal))
  (match (get-user-compliance user)
    profile (is-eq (get status profile) status-approved)
    false
  )
)

(define-read-only (is-compliance-enabled)
  (var-get compliance-enabled)
)

(define-read-only (is-compliance-officer (officer principal))
  (default-to false (get is-active (map-get? compliance-officers { officer: officer })))
)

(define-read-only (get-max-transaction-amount)
  (var-get max-transaction-amount)
)

;; Private functions
(define-private (is-contract-owner)
  (is-eq tx-sender contract-owner)
)

(define-private (is-authorized)
  (or (is-contract-owner) (is-compliance-officer tx-sender))
)

(define-private (blocks-per-day)
  u144
)

;; Public functions
(define-public (register-user (risk-tier uint))
  (begin
    (asserts! (and (>= risk-tier u1) (<= risk-tier u5)) err-invalid-parameters)
    (asserts! (is-none (get-user-compliance tx-sender)) err-already-verified)

    (map-set user-compliance
      { user: tx-sender }
      {
        status: status-pending,
        risk-tier: risk-tier,
        verified-at: u0,
        expires-at: u0,
        total-volume: u0,
        transaction-count: u0
      }
    )

    (map-set transaction-limits
      { user: tx-sender }
      {
        daily-volume: u0,
        last-reset-block: stacks-block-height,
        transactions-today: u0
      }
    )
    (ok true)
  )
)

(define-public (verify-user (user principal) (approved bool))
  (let (
    (profile (unwrap! (get-user-compliance user) err-not-found))
    (new-counter (+ (var-get verification-counter) u1))
  )
    (asserts! (is-authorized) err-owner-only)

    (map-set user-compliance
      { user: user }
      (merge profile {
        status: (if approved status-approved status-rejected),
        verified-at: stacks-block-height,
        expires-at: (+ stacks-block-height (* (blocks-per-day) u365))
      })
    )

    (var-set verification-counter new-counter)
    (ok new-counter)
  )
)

(define-public (check-transaction-compliance
  (user principal)
  (amount uint)
)
  (let (
    (profile (unwrap! (get-user-compliance user) err-not-found))
    (limits (default-to
      { daily-volume: u0, last-reset-block: u0, transactions-today: u0 }
      (get-transaction-limits user)))
    (needs-reset (> (- stacks-block-height (get last-reset-block limits)) (blocks-per-day)))
    (current-daily (if needs-reset u0 (get daily-volume limits)))
  )
    (asserts! (var-get compliance-enabled) err-compliance-violation)
    (asserts! (is-eq (get status profile) status-approved) err-compliance-violation)
    (asserts! (<= amount (var-get max-transaction-amount)) err-compliance-violation)
    (asserts! (<= (+ current-daily amount) (var-get daily-limit)) err-compliance-violation)

    ;; Update transaction tracking
    (map-set transaction-limits
      { user: user }
      {
        daily-volume: (+ current-daily amount),
        last-reset-block: (if needs-reset stacks-block-height (get last-reset-block limits)),
        transactions-today: (+ (if needs-reset u0 (get transactions-today limits)) u1)
      }
    )

    ;; Update user volume
    (map-set user-compliance
      { user: user }
      (merge profile {
        total-volume: (+ (get total-volume profile) amount),
        transaction-count: (+ (get transaction-count profile) u1)
      })
    )

    (ok true)
  )
)

(define-public (suspend-user (user principal))
  (let (
    (profile (unwrap! (get-user-compliance user) err-not-found))
  )
    (asserts! (is-authorized) err-owner-only)

    (map-set user-compliance
      { user: user }
      (merge profile { status: status-suspended })
    )
    (ok true)
  )
)

(define-public (appoint-compliance-officer (officer principal))
  (begin
    (asserts! (is-contract-owner) err-owner-only)

    (map-set compliance-officers
      { officer: officer }
      { is-active: true, appointed-at: stacks-block-height }
    )
    (ok true)
  )
)

(define-public (remove-compliance-officer (officer principal))
  (begin
    (asserts! (is-contract-owner) err-owner-only)

    (map-set compliance-officers
      { officer: officer }
      { is-active: false, appointed-at: stacks-block-height }
    )
    (ok true)
  )
)

(define-public (set-compliance-rule
  (rule-id uint)
  (name (string-ascii 64))
  (max-amount uint)
  (min-holding-period uint)
  (requires-verification bool)
)
  (begin
    (asserts! (is-contract-owner) err-owner-only)
    (asserts! (> (len name) u0) err-invalid-parameters)
    (asserts! (> max-amount u0) err-invalid-parameters)

    (map-set compliance-rules
      { rule-id: rule-id }
      {
        name: name,
        max-amount: max-amount,
        min-holding-period: min-holding-period,
        requires-verification: requires-verification,
        is-active: true
      }
    )
    (ok true)
  )
)

(define-public (set-max-transaction-amount (new-max uint))
  (begin
    (asserts! (is-contract-owner) err-owner-only)
    (asserts! (> new-max u0) err-invalid-parameters)
    (var-set max-transaction-amount new-max)
    (ok true)
  )
)

(define-public (set-daily-limit (new-limit uint))
  (begin
    (asserts! (is-contract-owner) err-owner-only)
    (asserts! (> new-limit u0) err-invalid-parameters)
    (var-set daily-limit new-limit)
    (ok true)
  )
)

(define-public (toggle-compliance (enabled bool))
  (begin
    (asserts! (is-contract-owner) err-owner-only)
    (var-set compliance-enabled enabled)
    (ok true)
  )
)
