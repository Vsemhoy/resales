import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getBidInfo, updateBid } from '../api/bids.api';
import {areArraysEqual} from "../utils/areEqual";

export const useBidData = (bidId, form) => {
    const queryClient = useQueryClient();

    // --- загрузка ---
    const {
        data,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ['bid', bidId],
        queryFn: () => getBidInfo(bidId),
        staleTime: Infinity, // не рефетчим автоматически, чтобы не перетирать несохранённые правки
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
        gcTime: 30 * 60 * 1000,
    });

    // --- сохранение ---
    const {
        mutate: saveBid,
        isPending: isSaving,
    } = useMutation({
        mutationFn: (data) => updateBid(bidId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bid', bidId] });
        },
    });

    // --- isDirty ---
    const isDirty = useMemo(() => {
        if (!data || !form) return false;

        const bid = data.bid;

        if (bid.base_info.orguser !== form.baseInfo.orgUser) return true;
        if (bid.base_info.protection !== form.baseInfo.protectionProject) return true;
        if (bid.base_info.object !== form.baseInfo.object) return true;
        if (bid.base_info.sellby !== form.baseInfo.sellBy) return true;

        if (bid.bill) {
            if (bid.bill.requisite !== form.bill.requisite) return true;
            if (bid.bill.conveyance !== form.bill.conveyance) return true;
            if (bid.bill.fact_address !== form.bill.factAddress) return true;
            if (bid.bill.org_phone !== form.bill.phone) return true;
            if (bid.bill.contact_email !== form.bill.email) return true;
            if (bid.bill.insurance !== form.bill.insurance) return true;
            if (bid.bill.package !== form.bill.package) return true;
            if (bid.bill.consignee !== form.bill.consignee) return true;
            if (bid.bill.other_equipment !== form.bill.otherEquipment) return true;
        }

        if (bid.comments.engineer !== form.comments.engineer) return true;
        if (bid.comments.manager !== form.comments.manager) return true;
        if (bid.comments.admin !== form.comments.admin) return true;
        if (bid.comments.accountant !== form.comments.accountant) return true;
        if (bid.comments.add_equipment !== form.comments.addEquipment) return true;

        if (bid.finance.bid_currency !== form.finance.currency) return true;
        if (bid.finance.status !== form.finance.priceStatus) return true;
        if (String(bid.finance.percent) !== String(form.finance.percent)) return true;
        if (bid.finance.nds !== form.finance.nds) return true;

        return !areArraysEqual(data.bid_models, form.models);
    }, [data, form]);

    return {
        // данные с сервера (для инициализации формы)
        serverData: data,
        isLoading,
        isError,
        error,
        // сохранение
        saveBid,
        isSaving,
        // трекинг изменений
        isDirty,
    };
};
