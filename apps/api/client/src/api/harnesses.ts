/**
 * Harnesses API functions
 */

import { get } from './client';
import type { Harness } from './types';

/**
 * Get all available harnesses
 */
export async function getHarnesses(): Promise<Harness[]> {
  return get<Harness[]>('/harnesses');
}

/**
 * Get a single harness by name
 */
export async function getHarness(name: string): Promise<Harness> {
  return get<Harness>(`/harnesses/${name}`);
}
