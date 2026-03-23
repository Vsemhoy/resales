import {CSRF_TOKEN, ROUTE_PREFIX} from "../config/config";
import {PROD_AXIOS_INSTANCE} from "../config/Api";

export const getBidInfo = (bidId) =>
    PROD_AXIOS_INSTANCE.post(`${ROUTE_PREFIX}/sales/v2/offers/${bidId}`, {
        _token: CSRF_TOKEN
    }).then(r => r.data.content);

export const updateBid = (bidId, data) =>
    PROD_AXIOS_INSTANCE.post(`${ROUTE_PREFIX}/sales/updatebid/${bidId}`, {
        data,
        _token: CSRF_TOKEN
    }).then(r => r.data);

export const calcModels = (bidInfo, bidModels) =>
    PROD_AXIOS_INSTANCE.post(`${ROUTE_PREFIX}/sales/calcmodels`, {
        data: { bid_info: bidInfo, bid_models: bidModels },
        _token: CSRF_TOKEN
    }).then(r => r.data.content);

export const getBidSelects = (params) =>
    PROD_AXIOS_INSTANCE.post(`${ROUTE_PREFIX}/sales/v2/bidselects`, {
        data: params,
        _token: CSRF_TOKEN
    }).then(r => r.data.selects);

export const getCurrencySelects = (params) =>
    PROD_AXIOS_INSTANCE.post(`${ROUTE_PREFIX}/currency/getcurrency`, {
        data: params,
        _token: CSRF_TOKEN
    }).then(r => r.data);

export const getBidModels = (params) =>
    PROD_AXIOS_INSTANCE.post(`${ROUTE_PREFIX}/sales/getmodels`, {
        data: params,
        _token: CSRF_TOKEN
    }).then(r => r.data);

export const getWordFile = (params) =>
    PROD_AXIOS_INSTANCE.post(`${ROUTE_PREFIX}/sales/makedoc`, {
        data: params,
        _token: CSRF_TOKEN
    }).then(r => r.data);

export const getNewBid = (params) =>
    PROD_AXIOS_INSTANCE.post(`${ROUTE_PREFIX}/sales/data/makebid`, {
        data: params,
        _token: CSRF_TOKEN
    }).then(r => r.data.item_id);

export const changePlace = (bidId, params) =>
    PROD_AXIOS_INSTANCE.post(`${ROUTE_PREFIX}/sales/data/changebidstage`, {
        bid_id: bidId,
        data: params,
        _token: CSRF_TOKEN
    }).then(r => r.data);

export const toSent1C = (bidId) =>
    PROD_AXIOS_INSTANCE.post(`${ROUTE_PREFIX}/sales/send1c/${bidId}`, {
        _token: CSRF_TOKEN
    }).then(r => r.data);

export const getProjectInfo = (bidProject) =>
    PROD_AXIOS_INSTANCE.post(`${ROUTE_PREFIX}/sales/v2/offers/project/${bidProject}`, {
        _token: CSRF_TOKEN
    }).then(r => r.data);

