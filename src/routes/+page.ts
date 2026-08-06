// file: src/routes/+page.ts
import { esempiScheme } from '#lib/scheme/examples/catalog';
import type { PageLoad } from './$types';

export const prerender = true; 

export const load: PageLoad = async () => {
    return { 
        esempi: esempiScheme 
    };
};