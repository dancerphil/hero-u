export interface OpenRouterModelArchitecture {
    modality?: string | null;
    input_modalities?: string[];
    output_modalities?: string[];
    tokenizer?: string | null;
    instruct_type?: string | null;
}

export interface OpenRouterModelPricing {
    prompt?: string;
    completion?: string;
    [key: string]: string | undefined;
}

export interface OpenRouterTopProvider {
    context_length?: number | null;
    max_completion_tokens?: number | null;
    is_moderated?: boolean | null;
}

export interface OpenRouterModelLinks {
    details?: string;
}

export interface OpenRouterModel {
    id: string;
    canonical_slug?: string | null;
    hugging_face_id?: string | null;
    name?: string | null;
    created?: number | null;
    description?: string | null;
    context_length?: number | null;
    architecture?: OpenRouterModelArchitecture | null;
    pricing?: OpenRouterModelPricing | null;
    top_provider?: OpenRouterTopProvider | null;
    per_request_limits?: unknown;
    supported_parameters?: string[] | null;
    default_parameters?: Record<string, unknown> | null;
    knowledge_cutoff?: string | null;
    expiration_date?: string | null;
    links?: OpenRouterModelLinks | null;
    [key: string]: unknown;
}
