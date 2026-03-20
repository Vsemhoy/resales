if (typeof globalThis !== 'undefined' && typeof globalThis.QUOTE === 'undefined') {
	globalThis.QUOTE = '"';
}

import * as XLSX from 'xlsx-community';

export default XLSX;
