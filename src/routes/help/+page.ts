// file: src/routes/help/+page.ts
import { faqCatalog, sezioniFAQ } from '#lib/data/faq/index';
import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = async () => {
	return {
		catalog: faqCatalog,
		sezioni: sezioniFAQ
	};
};
