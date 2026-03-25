import { useState, useRef, useCallback, useEffect } from 'react';
import { calcModels } from '../api/bids.api';
import { useDebounce } from './useDebounce';

export const useCalcModels = (models, finance, onModelsUpdate) => {
    const [isCalculating, setIsCalculating] = useState(false);
    const [amounts, setAmounts] = useState({ usd: 0, eur: 0, rub: 0 });
    const [engineerParams, setEngineerParams] = useState({
        unit: 0, box_size: 0, power_consumption: 0,
        max_power: 0, rated_power_speaker: 0, mass: 0, size: 0,
    });

    // debounce — ждём пока пользователь перестанет вводить
    const debouncedModels  = useDebounce(models, 700);
    const debouncedFinance = useDebounce(finance, 700);

    // refs для защиты от race condition
    const calcRequestIdRef     = useRef(0);
    const latestModelsRef      = useRef(models);
    const latestModelsVersion  = useRef(0);
    const lastAppliedSignatureRef = useRef(null);

    // всегда актуальная ссылка на models
    useEffect(() => {
        latestModelsRef.current = models;
        latestModelsVersion.current += 1;
    }, [models]);

    // функция пересчёта — принимает данные аргументами, не из замыкания
    const calculate = useCallback(async (modelsToCalc, financeToCalc) => {
        const requestId      = ++calcRequestIdRef.current;
        const requestVersion = latestModelsVersion.current;
        const snapshot       = JSON.parse(JSON.stringify(modelsToCalc));

        setIsCalculating(true);

        try {
            const bid_info = {
                bidCurrency:    financeToCalc.currency,
                bidPriceStatus: financeToCalc.priceStatus,
                bidPercent:     financeToCalc.percent,
                bidNds:         financeToCalc.nds,
            };

            const content = await calcModels(bid_info, modelsToCalc);
            if (!content) return null;

            // запрос устарел — пришёл более новый
            if (calcRequestIdRef.current !== requestId) return null;

            // пока летел запрос — модели изменились локально
            if (latestModelsVersion.current !== requestVersion) {
                if (content.models) {
                    return {
                        // мёрдж: серверные цены + локальные изменения пользователя
                        mergedModels: mergeCalculatedModels(
                            latestModelsRef.current,
                            content.models,
                            snapshot,
                        ),
                        amounts:       null,
                        engineerParams: null,
                    };
                }
                return null;
            }

            // всё чисто — применяем полный ответ сервера
            if (content.amounts)     setAmounts(content.amounts);
            if (content.models_data) setEngineerParams(content.models_data);

            return { mergedModels: content.models, amounts: content.amounts };

        } catch (e) {
            console.error('calcModels error', e);
            return null;
        } finally {
            setTimeout(() => setIsCalculating(false), 500);
        }
    }, []); // ← пустой массив: функция стабильна, данные через аргументы

    // автоматический пересчёт при изменении debounced значений
    useEffect(() => {
        if (!debouncedModels?.length) return;

        const makeSignature = (modelsVal, financeVal) =>
            JSON.stringify({ models: modelsVal, finance: financeVal });

        const currentSignature = makeSignature(debouncedModels, debouncedFinance);
        if (currentSignature === lastAppliedSignatureRef.current) return;

        calculate(debouncedModels, debouncedFinance).then(result => {
            if (result?.mergedModels) {
                const isSame = JSON.stringify(result.mergedModels) === JSON.stringify(debouncedModels);
                if (!isSame) {
                    lastAppliedSignatureRef.current = makeSignature(result.mergedModels, debouncedFinance);
                    onModelsUpdate(result.mergedModels);
                }
            }
        });
    }, [debouncedModels, debouncedFinance]);

    return {
        calculate,
        isCalculating,
        amounts,
        engineerParams,
    };
};
