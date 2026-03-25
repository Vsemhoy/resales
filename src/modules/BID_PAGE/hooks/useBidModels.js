import { useCallback, useMemo, useState } from 'react';

const editableModelFields = [
    'model_id',
    'model_name',
    'model_count',
    'percent',
    'presence',
    'sklad',
    'sort',
    'type_model',
    'currency',
    'not_available',
];

const getModelKey = (model) => `${model?.id ?? 'null'}:${model?.sort ?? 'null'}`;

const pickEditableFields = (model) => {
    const picked = {};
    editableModelFields.forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(model || {}, field)) {
            picked[field] = model[field];
        }
    });
    return picked;
};

const didEditableChange = (currentModel, requestModel) => {
    return editableModelFields.some(
        (field) => String(currentModel?.[field] ?? '') !== String(requestModel?.[field] ?? ''),
    );
};

export const mergeCalculatedModels = (currentModels, serverModels, requestModels) => {
    if (!Array.isArray(currentModels) || currentModels.length === 0) return serverModels || [];
    if (!Array.isArray(serverModels) || serverModels.length === 0) return currentModels;

    const serverByKey = new Map(serverModels.map((model) => [getModelKey(model), model]));
    const requestByKey = new Map(
        (Array.isArray(requestModels) ? requestModels : []).map((model) => [getModelKey(model), model]),
    );

    return currentModels.map((currentModel) => {
        const key = getModelKey(currentModel);
        const serverModel = serverByKey.get(key);
        if (!serverModel) return currentModel;

        const requestModel = requestByKey.get(key);
        if (didEditableChange(currentModel, requestModel)) {
            return currentModel;
        }

        return {
            ...serverModel,
            ...pickEditableFields(currentModel),
        };
    });
};

export const useBidModels = ({
    bidId,
    formModels,
    setForm,
    modelsSelect,
    setModelsSelect,
    isDisabledInputManager,
}) => {
    const [draggedModelIndex, setDraggedModelIndex] = useState(null);
    const [modelIdExtra, setModelIdExtra] = useState(null);
    const [modelNameExtra, setModelNameExtra] = useState('');

    const sortedBidModels = useMemo(() => {
        if (!formModels || formModels.length === 0) return [];
        return [...formModels].sort((a, b) => +a.sort - +b.sort);
    }, [formModels]);

    const handleAddModel = useCallback(() => {
        let sort = 0;
        if (formModels && formModels.length > 0) {
            const lastModel = [...formModels].sort((a, b) => +a.sort - +b.sort)[formModels.length - 1];
            sort = lastModel.sort + 1;
        }
        const bidModelsUpd = JSON.parse(JSON.stringify(formModels));
        bidModelsUpd.push({
            id: 0,
            bid_id: bidId,
            model_id: null,
            model_count: 1,
            model_name: '',
            not_available: 0,
            percent: null,
            presence: null,
            sort: sort,
            type_model: 0,
            currency: 0,
        });
        setForm((prev) => ({
            ...prev,
            models: bidModelsUpd,
        }));
    }, [bidId, formModels, setForm]);

    const handleDeleteModelFromBid = useCallback(
        (bidModelId, bidModelSort, bidModelSelectId) => {
            const bidModelIdx = formModels.findIndex(
                (model) => model.id === bidModelId && model.sort === bidModelSort,
            );
            const bidModelsUpd = JSON.parse(JSON.stringify(formModels));
            bidModelsUpd.splice(bidModelIdx, 1);
            setForm((prev) => ({
                ...prev,
                models: bidModelsUpd,
            }));
            setModelsSelect((prev) => {
                const index = prev.findIndex((model) => model.id === bidModelSelectId);
                if (index === -1) return prev;
                return prev.map((model, idx) => {
                    if (+idx === +index) {
                        return {
                            ...model,
                            used: false,
                        };
                    } else {
                        return model;
                    }
                });
            });
        },
        [formModels, setForm, setModelsSelect],
    );

    const handleChangeModel = useCallback(
        (newId, oldId, oldSort) => {
            const newModel = modelsSelect.find((model) => model.id === newId);
            const oldModel = formModels.find((model) => model.id === oldId && model.sort === oldSort);
            const oldModelIdx = formModels.findIndex(
                (model) => model.id === oldId && model.sort === oldSort,
            );
            const newModelObj = {
                id: oldId,
                bid_id: bidId,
                model_id: newId,
                model_name: newModel.name,
                model_count: 1,
                not_available: 0,
                percent: 0,
                presence: -2,
                sort: oldModel.sort,
                type_model: newModel.type_model,
                currency: newModel.currency,
            };
            const bidModelsUpd = JSON.parse(JSON.stringify(formModels));
            bidModelsUpd[oldModelIdx] = newModelObj;
            setForm((prev) => ({
                ...prev,
                models: bidModelsUpd,
            }));
            setModelsSelect((prev) => {
                const index = prev.findIndex((model) => model.id === newId);
                if (index === -1) return prev;
                return prev.map((model, idx) => {
                    if (+idx === +index) {
                        return {
                            ...model,
                            used: true,
                        };
                    } else {
                        return {
                            ...model,
                            used: false,
                        };
                    }
                });
            });
        },
        [bidId, formModels, modelsSelect, setForm, setModelsSelect],
    );

    const handleChangeModelInfo = useCallback(
        (type, value, bidModelId, bidModelSort) => {
            const bidModelIdx = formModels.findIndex(
                (model) => model.id === bidModelId && model.sort === bidModelSort,
            );
            const bidModelsUpd = JSON.parse(JSON.stringify(formModels));
            switch (type) {
                case 'model_count':
                    bidModelsUpd[bidModelIdx].model_count = value;
                    setForm((prev) => ({
                        ...prev,
                        models: bidModelsUpd,
                    }));
                    break;
                case 'percent':
                    bidModelsUpd[bidModelIdx].percent = value;
                    setForm((prev) => ({
                        ...prev,
                        models: bidModelsUpd,
                    }));
                    break;
                case 'presence':
                    bidModelsUpd[bidModelIdx].presence = value;
                    setForm((prev) => ({
                        ...prev,
                        models: bidModelsUpd,
                    }));
                    break;
                case 'sklad':
                    bidModelsUpd[bidModelIdx].sklad = value;
                    setForm((prev) => ({
                        ...prev,
                        models: bidModelsUpd,
                    }));
                    break;
            }
        },
        [formModels, setForm],
    );

    const handleModelsRowDragStart = useCallback(
        (index) => {
            if (isDisabledInputManager()) return;
            setDraggedModelIndex(index);
        },
        [isDisabledInputManager],
    );

    const handleModelsRowDrop = useCallback(
        (dropIndex) => {
            if (isDisabledInputManager()) return;
            if (draggedModelIndex === null || draggedModelIndex === dropIndex) return;
            const reordered = [...sortedBidModels];
            const [moved] = reordered.splice(draggedModelIndex, 1);
            reordered.splice(dropIndex, 0, moved);
            setForm((prev) => ({
                ...prev,
                models: reordered.map((model, idx) => ({
                    ...model,
                    sort: idx + 1,
                })),
            }));
            setDraggedModelIndex(null);
        },
        [draggedModelIndex, isDisabledInputManager, setForm, sortedBidModels],
    );

    const handleModelsRowDragEnd = useCallback(() => {
        setDraggedModelIndex(null);
    }, []);

    const handleOpenModelInfoExtra = useCallback(
        (modelId) => {
            setModelIdExtra(modelId);
            const name = formModels.find((model) => model.model_id === modelId).model_name;
            setModelNameExtra(name);
        },
        [formModels],
    );

    const handleCloseDrawerExtra = useCallback(() => {
        setModelIdExtra(null);
        setModelNameExtra('');
    }, []);

    const addParseModels = useCallback(
        (dataToAdd) => {
            if (!dataToAdd || !dataToAdd.length) return;

            const aggregatedData = dataToAdd.reduce((acc, item) => {
                const existing = acc.find((x) => x.id === item.id);
                if (existing) {
                    existing.count += item.count;
                } else {
                    acc.push({ ...item });
                }
                return acc;
            }, []);

            let sort = 0;
            if (formModels && formModels.length > 0) {
                const sorted = [...formModels].sort((a, b) => a.sort - b.sort);
                sort = sorted[sorted.length - 1].sort;
            }

            const arr = aggregatedData
                .filter((newModel) => modelsSelect.some((model) => !model.used && model.id === newModel.id))
                .map((newModel, idx) => {
                    const model = modelsSelect.find((m) => m.id === newModel.id);
                    return {
                        id: 0,
                        bid_id: bidId,
                        model_id: model.id,
                        model_name: model.name,
                        model_count: newModel.count,
                        not_available: 0,
                        percent: 0,
                        presence: -2,
                        sort: sort + idx + 1,
                        type_model: model.type_model,
                        currency: model.currency,
                    };
                });

            setForm((prev) => ({
                ...prev,
                models: arr,
            }));
        },
        [bidId, formModels, modelsSelect, setForm],
    );

    return {
        sortedBidModels,
        handleAddModel,
        handleDeleteModelFromBid,
        handleChangeModel,
        handleChangeModelInfo,
        handleModelsRowDragStart,
        handleModelsRowDrop,
        handleModelsRowDragEnd,
        handleOpenModelInfoExtra,
        handleCloseDrawerExtra,
        addParseModels,
        modelIdExtra,
        modelNameExtra,
        mergeCalculatedModels,
    };
};
