/**
 * Circuit Breaker Pattern for AI Model Calls
 * Prevents cascade failures when external services are down
 * 
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Failure threshold exceeded, requests fail fast
 * - HALF_OPEN: Testing if service recovered
 */

interface CircuitBreakerConfig {
  failureThreshold: number;   // Number of failures before opening
  resetTimeoutMs: number;     // Time before attempting recovery (half-open)
  halfOpenRequests: number;   // Requests to test in half-open state
}

interface CircuitState {
  failures: number;
  lastFailureTime: number;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  halfOpenSuccesses: number;
}

// In-memory state per service (resets on cold start, which is acceptable)
const circuitStates = new Map<string, CircuitState>();

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 3,
  resetTimeoutMs: 30000, // 30 seconds
  halfOpenRequests: 2
};

function getCircuitState(serviceId: string): CircuitState {
  if (!circuitStates.has(serviceId)) {
    circuitStates.set(serviceId, {
      failures: 0,
      lastFailureTime: 0,
      state: 'CLOSED',
      halfOpenSuccesses: 0
    });
  }
  return circuitStates.get(serviceId)!;
}

/**
 * Check if circuit allows request to proceed
 */
export function canProceed(serviceId: string, config: CircuitBreakerConfig = DEFAULT_CONFIG): boolean {
  const state = getCircuitState(serviceId);
  const now = Date.now();

  switch (state.state) {
    case 'CLOSED':
      return true;
    
    case 'OPEN':
      // Check if reset timeout has passed
      if (now - state.lastFailureTime >= config.resetTimeoutMs) {
        state.state = 'HALF_OPEN';
        state.halfOpenSuccesses = 0;
        console.log(`[CircuitBreaker] ${serviceId}: OPEN -> HALF_OPEN (testing recovery)`);
        return true;
      }
      return false;
    
    case 'HALF_OPEN':
      // Allow limited requests through for testing
      return state.halfOpenSuccesses < config.halfOpenRequests;
    
    default:
      return true;
  }
}

/**
 * Record a successful request
 */
export function recordSuccess(serviceId: string, config: CircuitBreakerConfig = DEFAULT_CONFIG): void {
  const state = getCircuitState(serviceId);
  
  if (state.state === 'HALF_OPEN') {
    state.halfOpenSuccesses++;
    if (state.halfOpenSuccesses >= config.halfOpenRequests) {
      state.state = 'CLOSED';
      state.failures = 0;
      console.log(`[CircuitBreaker] ${serviceId}: HALF_OPEN -> CLOSED (recovered)`);
    }
  } else if (state.state === 'CLOSED') {
    // Reset failure count on success
    state.failures = Math.max(0, state.failures - 1);
  }
}

/**
 * Record a failed request
 */
export function recordFailure(serviceId: string, config: CircuitBreakerConfig = DEFAULT_CONFIG): void {
  const state = getCircuitState(serviceId);
  state.failures++;
  state.lastFailureTime = Date.now();

  if (state.state === 'HALF_OPEN') {
    // Any failure in half-open immediately opens circuit
    state.state = 'OPEN';
    console.log(`[CircuitBreaker] ${serviceId}: HALF_OPEN -> OPEN (failed recovery test)`);
  } else if (state.state === 'CLOSED' && state.failures >= config.failureThreshold) {
    state.state = 'OPEN';
    console.log(`[CircuitBreaker] ${serviceId}: CLOSED -> OPEN (threshold exceeded: ${state.failures})`);
  }
}

/**
 * Get current circuit status for monitoring
 */
export function getCircuitStatus(serviceId: string): { state: string; failures: number; lastFailure: Date | null } {
  const s = getCircuitState(serviceId);
  return {
    state: s.state,
    failures: s.failures,
    lastFailure: s.lastFailureTime ? new Date(s.lastFailureTime) : null
  };
}

/**
 * Execute a function with circuit breaker protection
 */
export async function withCircuitBreaker<T>(
  serviceId: string,
  fn: () => Promise<T>,
  config: CircuitBreakerConfig = DEFAULT_CONFIG
): Promise<T> {
  if (!canProceed(serviceId, config)) {
    throw new Error(`Circuit breaker OPEN for ${serviceId}. Service temporarily unavailable.`);
  }

  try {
    const result = await fn();
    recordSuccess(serviceId, config);
    return result;
  } catch (error) {
    recordFailure(serviceId, config);
    throw error;
  }
}

/**
 * Model-specific circuit breaker wrapper with fallback chain
 */
export const MODEL_FALLBACK_CHAIN: Record<string, string[]> = {
  'google/gemini-2.5-flash': ['openai/gpt-5-mini', 'google/gemini-2.5-flash-lite'],
  'google/gemini-2.5-pro': ['openai/gpt-5', 'google/gemini-2.5-flash'],
  'openai/gpt-5': ['google/gemini-2.5-pro', 'openai/gpt-5-mini'],
  'openai/gpt-5-mini': ['google/gemini-2.5-flash', 'openai/gpt-5-nano'],
};

export function getAvailableModel(preferredModel: string): string {
  // Check if preferred model's circuit is open
  if (canProceed(preferredModel)) {
    return preferredModel;
  }

  // Try fallback chain
  const fallbacks = MODEL_FALLBACK_CHAIN[preferredModel] || [];
  for (const fallback of fallbacks) {
    if (canProceed(fallback)) {
      console.log(`[CircuitBreaker] Using fallback model: ${fallback} (${preferredModel} unavailable)`);
      return fallback;
    }
  }

  // Last resort: return preferred and let it fail (will trigger circuit)
  console.warn(`[CircuitBreaker] No available models in fallback chain, attempting ${preferredModel}`);
  return preferredModel;
}
