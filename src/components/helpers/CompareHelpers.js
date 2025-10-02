/**
 * false - not equals, true = equals
 * @param {*} original
 * @param {*} updated
 * @param {*} options
 * @returns
 */
export const compareObjects = (original, updated, options = {}) => {
	const {
		excludeFields = ['date', 'hash'],
		compareArraysDeep = false, // если true, то глубокое сравнение массивов
		ignoreNullUndefined = true,
	} = options;

	if (original === updated) return true;
	if (!original || !updated) return false;

	const allKeys = new Set([...Object.keys(original), ...Object.keys(updated)]);
	// console.log(excludeFields);

	for (const key of allKeys) {
		if (excludeFields.includes(key)) continue;

		const originalValue = original[key];
		const updatedValue = updated[key];

		if (ignoreNullUndefined) {
			if (originalValue == null && updatedValue == null) continue;
			if (originalValue == null || updatedValue == null) return false;
		}

		// Сравнение массивов
		if (Array.isArray(originalValue) && Array.isArray(updatedValue)) {
			if (compareArraysDeep) {
				// Глубокое сравнение массивов
				if (originalValue.length !== updatedValue.length) return false;
				for (let i = 0; i < originalValue.length; i++) {
					if (!compareObjects(originalValue[i], updatedValue[i], options)) {
						return false;
					}
				}
			} else {
				// Только длина
				if (originalValue.length !== updatedValue.length) return false;
			}
			continue;
		}

		// Рекурсивное сравнение объектов
		if (
			typeof originalValue === 'object' &&
			typeof updatedValue === 'object' &&
			originalValue !== null &&
			updatedValue !== null &&
			!Array.isArray(originalValue) &&
			!Array.isArray(updatedValue)
		) {
			if (!compareObjects(originalValue, updatedValue, options)) return false;
			continue;
		}

		// Простые значения
		if (originalValue !== updatedValue) {
			return false;
		}
	}

	return true;
};
