import { useQuery } from '@tanstack/react-query';
import { getBidSelects } from '../api/bids.api';

export const useBidSelects = (orgId, orgUserId) => {
    const baseSelects = useQuery({
        queryKey: ['bidSelects'],
        queryFn: () => getBidSelects({}),
        staleTime: 5 * 60 * 1000, // справочники не протухают быстро
    });

    const orgSelects = useQuery({
        queryKey: ['bidSelects', 'org', orgId],
        queryFn: () => getBidSelects({ orgId }),
        enabled: !!orgId,
    });

    const userSelects = useQuery({
        queryKey: ['bidSelects', 'user', orgUserId],
        queryFn: () => getBidSelects({ orgUserId }),
        enabled: !!orgUserId,
    });

    return {
        type: baseSelects.data?.type_select ?? [],
        actionEnum: baseSelects.data?.action_enum ?? [],
        adminAccept: baseSelects.data?.admin_accept_select ?? [],
        currency: baseSelects.data?.bid_currency_select ?? [],
        nds: baseSelects.data?.nds_select ?? [],
        package: baseSelects.data?.package_select ?? [],
        presence: baseSelects.data?.presence ?? [],
        complete: baseSelects.data?.complete_select ?? [],
        price: baseSelects.data?.price_select ?? [],
        pay: baseSelects.data?.pay_select ?? [],
        protection: baseSelects.data?.protection_select ?? [],
        stage: baseSelects.data?.stage_select ?? [],
        conveyance: baseSelects.data?.conveyance_select ?? [],
        insurance: baseSelects.data?.insurance_select ?? [],
        companies: baseSelects.data?.companies ?? [],
        templateWord: baseSelects.data?.templateWord ?? [],
        reasons: baseSelects.data?.reasons ?? [],
        // ...
        orgUsers: orgSelects.data?.orgusers_select ?? [],
        requisite: orgSelects.data?.requisite_select ?? [],
        factAddress: orgSelects.data?.fact_address_select ?? [],
        phones: orgSelects.data?.org_phones_select ?? [],
        // ...
        emails: userSelects.data?.contact_email_select ?? [],
    };
};
