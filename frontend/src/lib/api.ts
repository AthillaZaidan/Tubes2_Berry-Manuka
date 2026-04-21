// lib/api.ts — API client for backend integration

import {
  DOMNode,
  ScrapeRequest,
  ScrapeResponse,
  TraverseRequest,
  TraversalResult,
  LCARequest,
  LCAResponse,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function fetchJSON<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const errBody = await res.json();
      if (errBody.error) message = errBody.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

export async function scrapeHTML(
  req: ScrapeRequest
): Promise<ScrapeResponse> {
  return fetchJSON<ScrapeResponse>("/api/scrape", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function traverseTree(
  req: TraverseRequest
): Promise<TraversalResult> {
  return fetchJSON<TraversalResult>("/api/traverse", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function findLCA(req: LCARequest): Promise<LCAResponse> {
  return fetchJSON<LCAResponse>("/api/lca", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

// Health check
export async function healthCheck(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/scrape`, { method: "OPTIONS" });
    return res.ok;
  } catch {
    return false;
  }
}
