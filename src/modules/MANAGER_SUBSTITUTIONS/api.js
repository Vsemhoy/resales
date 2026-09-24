import { PROD_AXIOS_INSTANCE } from '../../config/Api';

const base = '/api/sales/manager-substitutions';
// 403 здесь означает отсутствие прав, а не истечение сессии.
const config = { handleForbiddenLocally: true };

export const listSubstitutions = (page, perPage, signal) =>
    PROD_AXIOS_INSTANCE.get(base, { ...config, signal, params: { page, per_page: perPage } });
export const listManagers = (signal) =>
    PROD_AXIOS_INSTANCE.get(`${base}/managers`, { ...config, signal });
export const createSubstitution = (data, signal) =>
    PROD_AXIOS_INSTANCE.post(base, { data }, { ...config, signal });
export const revokeSubstitution = (id, signal) =>
    PROD_AXIOS_INSTANCE.post(`${base}/${id}/revoke`, undefined, { ...config, signal });
