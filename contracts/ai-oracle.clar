;; AI Oracle Contract - AI Integration
;; IntelliDeFi Protocol - AI-Driven DeFi Strategies on Bitcoin

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u400))
(define-constant err-oracle-not-found (err u401))
(define-constant err-invalid-data (err u402))
(define-constant err-oracle-inactive (err u403))
(define-constant err-insufficient-confidence (err u404))
(define-constant err-stale-data (err u405))

;; Oracle data types
(define-constant oracle-market-analysis u1)
(define-constant oracle-risk-assessment u2)
(define-constant oracle-yield-prediction u3)
(define-constant oracle-portfolio-optimization u4)
(define-constant oracle-sentiment-analysis u5)

;; Data Variables
(define-data-var oracle-counter uint u0)
(define-data-var min-confidence-threshold uint u7000) ;; 70%
(define-data-var max-data-age uint u144) ;; ~24 hours in blocks

;; Data Maps
(define-map ai-oracles
  { oracle-id: uint }
  {
    name: (string-ascii 64),
    oracle-type: uint,
    endpoint-url: (string-ascii 128),
    is-active: bool,
    confidence-score: uint,
    last-updated: uint,
    update-frequency: uint
  }
)

(define-map oracle-data
  { oracle-id: uint, data-key: (string-ascii 32) }
  {
    value: (string-ascii 256),
    confidence: uint,
    timestamp: uint,
    block-height: uint
  }
)

(define-map market-signals
  { signal-id: uint }
  {
    signal-type: (string-ascii 32),
    strength: uint,
    direction: int,
    confidence: uint,
    generated-by: uint,
    expires-at: uint
  }
)

(define-map ai-predictions
  { prediction-id: uint }
  {
    strategy-id: uint,
    predicted-return: uint,
    risk-score: uint,
    time-horizon: uint,
    confidence: uint,
    created-at: uint
  }
)

(define-map authorized-updaters
  { updater: principal }
  { is-authorized: bool, authorized-at: uint }
)

;; Read-only functions
(define-read-only (get-oracle (oracle-id uint))
  (map-get? ai-oracles { oracle-id: oracle-id })
)

(define-read-only (get-oracle-data (oracle-id uint) (data-key (string-ascii 32)))
  (map-get? oracle-data { oracle-id: oracle-id, data-key: data-key })
)

(define-read-only (get-market-signal (signal-id uint))
  (map-get? market-signals { signal-id: signal-id })
)

(define-read-only (get-ai-prediction (prediction-id uint))
  (map-get? ai-predictions { prediction-id: prediction-id })
)

(define-read-only (is-authorized-updater (updater principal))
  (default-to false (get is-authorized (map-get? authorized-updaters { updater: updater })))
)

(define-read-only (get-oracle-counter)
  (var-get oracle-counter)
)

(define-read-only (is-data-fresh (oracle-id uint) (data-key (string-ascii 32)))
  (match (get-oracle-data oracle-id data-key)
    data-entry (< (- stacks-block-height (get block-height data-entry)) (var-get max-data-age))
    false
  )
)

;; Private functions
(define-private (is-contract-owner)
  (is-eq tx-sender contract-owner)
)

(define-private (validate-oracle-type (oracle-type uint))
  (and (>= oracle-type u1) (<= oracle-type u5))
)

(define-private (validate-confidence (confidence uint))
  (and (>= confidence u0) (<= confidence u10000)) ;; 0-100%
)

;; Public functions
(define-public (register-oracle
  (name (string-ascii 64))
  (oracle-type uint)
  (endpoint-url (string-ascii 128))
  (update-frequency uint)
)
  (let (
    (new-oracle-id (+ (var-get oracle-counter) u1))
  )
    (asserts! (is-contract-owner) err-owner-only)
    (asserts! (> (len name) u0) err-invalid-data)
    (asserts! (validate-oracle-type oracle-type) err-invalid-data)
    (asserts! (> update-frequency u0) err-invalid-data)
    
    (map-set ai-oracles
      { oracle-id: new-oracle-id }
      {
        name: name,
        oracle-type: oracle-type,
        endpoint-url: endpoint-url,
        is-active: true,
        confidence-score: u0,
        last-updated: stacks-block-height,
        update-frequency: update-frequency
      }
    )
    
    (var-set oracle-counter new-oracle-id)
    (ok new-oracle-id)
  )
)

(define-public (authorize-updater (updater principal))
  (begin
    (asserts! (is-contract-owner) err-owner-only)
    
    (map-set authorized-updaters
      { updater: updater }
      { is-authorized: true, authorized-at: stacks-block-height }
    )
    
    (ok true)
  )
)

(define-public (update-oracle-data
  (oracle-id uint)
  (data-key (string-ascii 32))
  (value (string-ascii 256))
  (confidence uint)
)
  (let (
    (oracle (unwrap! (get-oracle oracle-id) err-oracle-not-found))
  )
    (asserts! (or (is-contract-owner) (is-authorized-updater tx-sender)) err-owner-only)
    (asserts! (get is-active oracle) err-oracle-inactive)
    (asserts! (validate-confidence confidence) err-invalid-data)
    (asserts! (>= confidence (var-get min-confidence-threshold)) err-insufficient-confidence)
    
    (map-set oracle-data
      { oracle-id: oracle-id, data-key: data-key }
      {
        value: value,
        confidence: confidence,
        timestamp: stacks-block-height,
        block-height: stacks-block-height
      }
    )
    
    ;; Update oracle's last updated time
    (map-set ai-oracles
      { oracle-id: oracle-id }
      (merge oracle { last-updated: stacks-block-height })
    )
    
    (ok true)
  )
)

(define-public (generate-market-signal
  (signal-type (string-ascii 32))
  (strength uint)
  (direction int)
  (confidence uint)
  (oracle-id uint)
  (duration uint)
)
  (let (
    (signal-id (+ (var-get oracle-counter) u1))
  )
    (asserts! (or (is-contract-owner) (is-authorized-updater tx-sender)) err-owner-only)
    (asserts! (validate-confidence confidence) err-invalid-data)
    (asserts! (>= confidence (var-get min-confidence-threshold)) err-insufficient-confidence)
    (asserts! (<= strength u100) err-invalid-data)
    
    (map-set market-signals
      { signal-id: signal-id }
      {
        signal-type: signal-type,
        strength: strength,
        direction: direction,
        confidence: confidence,
        generated-by: oracle-id,
        expires-at: (+ stacks-block-height duration)
      }
    )
    
    (ok signal-id)
  )
)

(define-public (create-ai-prediction
  (strategy-id uint)
  (predicted-return uint)
  (risk-score uint)
  (time-horizon uint)
  (confidence uint)
)
  (let (
    (prediction-id (+ (var-get oracle-counter) u1))
  )
    (asserts! (or (is-contract-owner) (is-authorized-updater tx-sender)) err-owner-only)
    (asserts! (validate-confidence confidence) err-invalid-data)
    (asserts! (>= confidence (var-get min-confidence-threshold)) err-insufficient-confidence)
    (asserts! (and (>= risk-score u1) (<= risk-score u10)) err-invalid-data)
    
    (map-set ai-predictions
      { prediction-id: prediction-id }
      {
        strategy-id: strategy-id,
        predicted-return: predicted-return,
        risk-score: risk-score,
        time-horizon: time-horizon,
        confidence: confidence,
        created-at: stacks-block-height
      }
    )
    
    (ok prediction-id)
  )
)

(define-public (get-ai-recommendation (strategy-id uint))
  (let (
    ;; Simplified AI recommendation logic
    ;; Would update in production
    (base-recommendation u5000) ;; 50% allocation recommendation
  )
    (asserts! (> strategy-id u0) err-invalid-data)
    
    ;; Return recommendation with confidence
    (ok { 
      allocation-percentage: base-recommendation,
      confidence: u8000,
      recommendation: "moderate-buy"
    })
  )
)

(define-public (toggle-oracle-status (oracle-id uint))
  (let (
    (oracle (unwrap! (get-oracle oracle-id) err-oracle-not-found))
  )
    (asserts! (is-contract-owner) err-owner-only)
    
    (map-set ai-oracles
      { oracle-id: oracle-id }
      (merge oracle { 
        is-active: (not (get is-active oracle)),
        last-updated: stacks-block-height 
      })
    )
    
    (ok true)
  )
)

(define-public (set-confidence-threshold (new-threshold uint))
  (begin
    (asserts! (is-contract-owner) err-owner-only)
    (asserts! (validate-confidence new-threshold) err-invalid-data)
    
    (var-set min-confidence-threshold new-threshold)
    (ok true)
  )
)

(define-public (set-max-data-age (new-age uint))
  (begin
    (asserts! (is-contract-owner) err-owner-only)
    (asserts! (> new-age u0) err-invalid-data)
    
    (var-set max-data-age new-age)
    (ok true)
  )
)
