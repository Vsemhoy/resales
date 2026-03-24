export const areArraysEqual = (arr1, arr2) => {
    // Проверка длины
    if (arr1.length !== arr2.length) return false;

    // Проверка каждого элемента
    return arr1.every((item, index) => {
        const item2 = arr2[index];

        // Если оба объекта
        if (typeof item === 'object' && item !== null &&
            typeof item2 === 'object' && item2 !== null) {
            return areObjectsEqual(item, item2);
        }

        // Для примитивов
        return item === item2;
    });
};
export const areObjectsEqual = (obj1, obj2) => {
    const keys1 = Object.keys(obj1);

    //if (keys1.length !== keys2.length) return false;

    return keys1.every(key => {
        // Рекурсивная проверка для вложенных объектов
        if (typeof obj1[key] === 'object' && obj1[key] !== null &&
            typeof obj2[key] === 'object' && obj2[key] !== null) {
            return areObjectsEqual(obj1[key], obj2[key]);
        }
        if (key !== 'moneyOne' && key !== 'moneyCount') {
            return String(obj1[key]) === String(obj2[key]);
        } else {
            return true;
        }
    });
};