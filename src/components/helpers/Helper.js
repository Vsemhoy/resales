class Helper {
    static prepareSelectOptions = (options) => {
        if (options && options.length > 0) {
            return options.map((option) => {
                return {
                    key: `option-${option.id}-${option.name}`,
                    value: option.id,
                    label: option.name,
                    boss_id: option.boss_id,
                    id_company: option.id_company,
                    count: option.count,
                    match: option.match,
                };
            });
        } else {
            return [];
        }
    };
}



export default Helper;