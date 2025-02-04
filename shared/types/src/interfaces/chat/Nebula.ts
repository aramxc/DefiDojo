export interface ContextFilter {
    chain_ids?: string[];
    contract_addresses?: string[];
    wallet_addresses?: string[];
}

export interface ExecuteConfig {
    mode: 'engine' | 'session_key' | 'client';
    // Engine mode config
    engine_url?: string;
    engine_authorization_token?: string;
    engine_backend_wallet_address?: string;
    // Session key mode config
    smart_account_address?: string;
    smart_account_factory_address?: string;
    smart_account_session_key?: string;
    // Client mode config
    signer_wallet_address?: string;
}

export interface MessageRequest {
    message: string;
    stream?: boolean;
    session_id?: string;
    execute_config?: ExecuteConfig;
    context_filter?: ContextFilter;
}

export interface StreamEvent {
    session_id: string;
    request_id: string;
    type: string;
    source: string;
    data: any;
}

export interface DeltaEvent {
    v: string;
}

// Base session interface for common properties
export interface Session {
    id: string;
    title?: string;
    created_at: string;
    updated_at: string;
    context_filter?: ContextFilter;
    execute_config?: ExecuteConfig;
}

// For updating sessions
export interface SessionUpdateRequest {
    title?: string;
    context_filter?: ContextFilter;
    execute_config?: ExecuteConfig;
}

