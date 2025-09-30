export function injectDayDividers(messages) {
	const result = [];
	let lastDate = null;
	const shortWeekdays = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];

	messages.forEach((msg) => {
		const dateObj = new Date(msg.timestamp);
		const weekdayShort = shortWeekdays[dateObj.getDay()];
		const datePart = dateObj.toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		});

		const currentDate = `${weekdayShort}, ${datePart}`;

		if (currentDate !== lastDate) {
			lastDate = currentDate;
			result.push({
				type: 'divider',
				key: `divider-${currentDate}`,
				date: currentDate.charAt(0).toUpperCase() + currentDate.slice(1),
			});
		}

		result.push({ ...msg, type: 'message' });
	});

	return result;
}
