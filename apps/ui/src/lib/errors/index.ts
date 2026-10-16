abstract class AppError extends Error {
  readonly details: Record<string, unknown>;

  constructor(message: string, details: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.details = details;
  }
}

class ContextNotFoundError extends AppError {
  constructor({ hookName, providerName }: { hookName: string; providerName: string }) {
    super(`${hookName} must be used within ${providerName}`, { hookName, providerName });
  }
}

class JsonParseError extends AppError {
  constructor({ caller, rawValue }: { caller: string; rawValue: unknown }) {
    super(`${caller}: failed to parse JSON`, { caller, rawValueType: typeof rawValue });
  }
}

class JsonStringifyError extends AppError {
  constructor({ caller }: { caller: string }) {
    super(`${caller}: failed to stringify value`, { caller });
  }
}

export { AppError, ContextNotFoundError, JsonParseError, JsonStringifyError };
