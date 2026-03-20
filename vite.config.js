import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const fixXlsxCommunityQuote = () => {
	const pattern = /var APOS = "'";\s*QUOTE = '"'/;
	const replacement = "var APOS = \"'\"; var QUOTE = '\"'";

	return {
		name: 'fix-xlsx-community-quote',
		enforce: 'pre',
		transform(code, id) {
			const normalizedId = id.split('?')[0].replace(/\\/g, '/');
			if (!normalizedId.includes('/node_modules/xlsx-community/xlsx.js')) {
				return null;
			}

			if (!pattern.test(code)) {
				return null;
			}

			return {
				code: code.replace(pattern, replacement),
				map: null,
			};
		},
	};
};

const quoteDefine = JSON.stringify('"');

export default defineConfig({
	plugins: [fixXlsxCommunityQuote(), react()],
	define: {
		QUOTE: quoteDefine,
	},
	optimizeDeps: {
		esbuildOptions: {
			define: {
				QUOTE: quoteDefine,
			},
		},
	},
});
