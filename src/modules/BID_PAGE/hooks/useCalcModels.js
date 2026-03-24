import { useQuery } from '@tanstack/react-query';
import { useDebounce } from './useDebounce';
import { calcModels } from '../api/bids.api';

export const useCalcModels = (models, finance) => {
    const debouncedModels = useDebounce(models, 700);
    const debouncedFinance = useDebounce(finance, 700);

    const { data, isFetching } = useQuery({
        queryKey: ['calcModels', debouncedModels, debouncedFinance],
        queryFn: () => calcModels(debouncedFinance, debouncedModels),
        enabled: debouncedModels.length > 0,
    });

    return {
        calculatedModels: data?.models ?? models,
        amounts: data?.amounts ?? { usd: 0, eur: 0, rub: 0 },
        engineerParams: data?.models_data ?? {},
        isCalculating: isFetching,
    };
};
