import { Pagination, Spin, Tag, message } from 'antd';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { PROD_AXIOS_INSTANCE } from '../../../../../config/Api';
import { CSRF_TOKEN, PRODMODE } from '../../../../../config/config';
import { ANTD_PAGINATION_LOCALE } from '../../../../../config/Localization';
import OrgHistoryModalRow from '../Tabs/TabComponents/RowTemplates/OrgHistoryModalRow';
import { MODAL_HISTORY_LIST } from '../../mock/MODALHISTORYTABMOCK';
import dayjs from 'dayjs';
import { getMonthName } from '../../../../../components/helpers/TextHelpers';
import { has } from 'lodash';

const OrgListModalHistoryTab = (props) => {
  const [dataList, setDataList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [onPage, setOnPage] = useState(30);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [orgId, setOrgId] = useState(null);
  const [total, setTotal] = useState(0);
  
  const observer = useRef();


  const lastElementRef = useCallback(node => {
    console.log("OBSERVER");
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    console.log("OBSERVER 2");
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        console.log("LOAD NEXT TO");
        loadNextPage();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loadingMore, hasMore]);



  useEffect(() => {
    if (props.data?.id) {
      if (PRODMODE) {
        if (props.data?.id !== orgId) {
          resetState();
          setOrgId(props.data.id);
          get_org_data_action(props.data.id, 1, onPage, true);
        }
      } else {
        setDataList(MODAL_HISTORY_LIST);
        setTotal(300);
        setHasMore(false);
      }
    } else {
      resetState();
    }
  }, [props.data]);

  const resetState = () => {
    setDataList([]);
    setCurrentPage(1);
    setHasMore(true);
    setOrgId(null);
    setTotal(0);
  };

  const loadNextPage = () => {
    console.log("PRE CALL TO LOAD");
    if (!loadingMore && hasMore && orgId) {
      get_org_data_action(orgId, currentPage + 1, onPage, false);
    }
  };

  const get_org_data_action = async (id, page = currentPage, limit = onPage, reset = false) => {
    if (loadingMore || (!hasMore && !reset)) return;

    try {
      reset ? setLoading(true) : setLoadingMore(true);
      
      let response = await PROD_AXIOS_INSTANCE.post('/api/sales/v2/orglist/' + id + '/h', {
        data: { page, limit },
        _token: CSRF_TOKEN
      });

      if (response.data) {
        const newData = response.data.content || response.data?.data;
        const newItems = newData;
        
        if (Array.isArray(newItems)) {
          if (newItems.length === 0) {
            setHasMore(false);
            if (currentPage > 1) {
              message.info('Данные закончились');
            }
          } else {
            setDataList(prev => reset ? newItems : [...prev, ...newItems]);
            setCurrentPage(page);
            setTotal(prev => newData.total || prev + newItems.length);
            console.log(newItems);
          }
        }
      }
    } catch (e) {
      console.log(e);
      message.error('Ошибка загрузки данных');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  let lastDate = null;

  return (
    <Spin spinning={loading}>
      <div className={'sa-orgtab-container'}>
        <div className={'sa-pa-6 sa-flex-space'}>
          <div className='sa-flex-space'>
            <Tag color="#cdd2d6ff" style={{color: '#5a5a5aff'}}>
              Загружено {dataList.length} из {total || '∞'}
            </Tag>
            {!hasMore && dataList.length > 0 && (
              <Tag color="green">Все данные загружены</Tag>
            )}
          </div>
        </div>

        <div>
            <div className={'sa-org-history-row sa-org-bid-row-header'}>

              <div>
                  <div className='sa-orghistory-datacell'>
                    Дата
                  </div>
              </div>

              <div>
                  <div className='sa-orghistory-datacell'>
                    Путь
                  </div>
              </div>
              <div>
                  <div className='sa-orghistory-datacell'>
                  Старое значение
                  </div>
              </div>
              <div>
                  <div className='sa-orghistory-datacell'>
                  Новое значение
                  </div>
              </div>
              <div>
                  <div className='sa-orghistory-datacell'>
                  Пользователь
                  </div>
              </div>
              <div>
                  <div className='sa-orghistory-datacell'>
                  Тип
                  </div>
              </div>
          </div>
          
          {dataList.map((item, index) => {
            const isLastElement = index === dataList.length - 1;
            const showDateBreak = lastDate !== item?.date;
            if (showDateBreak) lastDate = item.date;
            
            return (
              <div 
                key={item.id || index}
                ref={isLastElement ? lastElementRef : null}
              >
                {showDateBreak && item?.date && (
                  <div className='sa-orghistory-date-break-row'>
                    {dayjs.unix(item.date).date()} {getMonthName(dayjs.unix(item.date).month())} {dayjs.unix(item.date).year()}
                  </div>
                )}
                <OrgHistoryModalRow
                  org_id={orgId}
                  data={item}
                />
              </div>
            );
          })}
        </div>

        {loadingMore && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="small" />
            <span style={{ marginLeft: 10 }}>Загрузка...</span>
          </div>
        )}

        {!hasMore && dataList.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            Нет данных для отображения
          </div>
        )}
        {!hasMore && (
          <div className='sa-orghistory-date-break-row'>Все существующие записи загружены...</div>
        )}
      </div>
    </Spin>
  );
};

export default OrgListModalHistoryTab;