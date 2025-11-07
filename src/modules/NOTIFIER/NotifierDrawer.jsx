import { Button, Drawer } from 'antd';
import React, { useEffect, useState } from 'react';
import NotiCard from './NotiCard';
import { MOCK_NOTICES } from './mock/NoticeMock';
import {CSRF_TOKEN, PRODMODE} from "../../config/config";
import {PROD_AXIOS_INSTANCE} from "../../config/Api";

/**
 * Компонент нотификации - показывает уведомления, присланные с бэка
 * @param {object} params - объект конфигурации
 * @param {boolean} params.is_open - статус
 * @param {function} params.on_count_change - коллбек при изменении количества уведомлений
 * @param {function} params.on_close - коллбек на закрытие
 * @returns
 */
const NotifierDrawer = ({is_open, on_count_change, on_close}) => {
  const [notifications, setNotifications] = useState([]);
  const [noticePage, setNoticePage] = useState(1);
  const [noticeIgnore, setNoticeIgnore] = useState([]);
  const [countOfNotifications, setCountOfNotifications] = useState(0);
  const [countOfNewNotifications, setCountOfNewNotifications] = useState(0);

  const [notificatorOpened, setNotificatorOpened] = useState(false);
  const [notificatorLoading, setNotificatorLoading] = useState(true);
  
    const notificationRead = (id) => {
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, is_read: true } 
            : notification
        )
      );
      markNoteRead(id);
      setCountOfNewNotifications(countOfNewNotifications - 1);
    };

    useEffect(() => {
      if (on_count_change){
          on_count_change(countOfNewNotifications);
      }
    }, [countOfNewNotifications]);

    useEffect(() => {
      console.log(is_open);
      setNotificatorOpened(is_open);
    }, [is_open]);


    useEffect(() => {
      if (notificatorOpened === true){
        getFreshNotices();
      }
    }, [notificatorOpened]);

      // EFFECTS
      useEffect(() => {
        if (PRODMODE){
          getFreshNotices();
        } else {

          setNotifications(MOCK_NOTICES);
          console.log("MANOK" , MOCK_NOTICES);
          
        }
      }, []);


      useEffect(() => {
        setNotificatorLoading(false);
      }, [notifications]);



    const markNoteRead = async (note_id, req, res) => {
        try {
          let response = await PROD_AXIOS_INSTANCE.put('/api/notice/read/' + note_id + '?_token=' + CSRF_TOKEN,
              {
                  data: note_id,
                  _token: CSRF_TOKEN
              }
          );

            // setBaseUserListData(response.data.data);
        } catch (e) {
            console.log(e)
            alert(e.response.data.message);
        } finally {

        }
    }


    const getFreshNotices = async (item)=> {
      try {
        // setLoadingOrgs(true)
        const format_data = {
            CSRF_TOKEN,
            data: {
            }
        }
        let response = await PROD_AXIOS_INSTANCE.get('/api/notice/fresh' + '?_token=' + CSRF_TOKEN);
        
        setNotifications(response.data.data);
        let ignore = [];
        for (let i = 0; i < response.data.data.length; i++){
          ignore.push(response.data.data[i].id);
        };
        setNoticeIgnore(ignore);
        setCountOfNotifications(ignore.length);
        setCountOfNewNotifications(ignore.length);
      } catch (e) {
          console.log(e)
      } finally {
          // setLoadingOrgs(false)
          // window.location.reload();
      }
    }


    const getOldNotices = async ()=> {
      try {
        let response = await PROD_AXIOS_INSTANCE.post('/api/notice/old?_token=' + CSRF_TOKEN, 
          {   
            page: noticePage,
            ignore: noticeIgnore,
            _token: CSRF_TOKEN
        });
        
        if (response.data.data.length){
          setNoticePage(noticePage + 1);
          setNotifications(prev => [...prev, ...response.data.data]);

        } 
        if (response.data.data.length < 12){
          setNoticePage(-1);
        }

      } catch (e) {
          console.log(e)
      } finally {
          // setLoadingOrgs(false)
          // window.location.reload();
      }
    }




    const handleClose = () => {
      setNotificatorOpened(false);
      if (on_close){
        on_close();
      }
    }



  return (
    <Drawer
        closable
        destroyOnClose
        title={<p>Уведомления</p>}
        placement="right"
        open={notificatorOpened}
        loading={notificatorLoading}
        onClose={handleClose}
      >
        {/* <Button type="primary" style={{ marginBottom: 16 }} onClick={showNotyBar}>
          Reload
        </Button>
        <p>Новых уведомлений не найдено...</p> */}
        <div>
          {notifications.map((item)=>(
            <NotiCard 
              data={item}
              key={`notic_${item.id}`}
              on_read={notificationRead}
            />
          ))}
        </div>
          
        { noticePage > 0 && (
          <Button type="dashed" block
            onClick={getOldNotices}
          >
            Показать старые уведомления
          </Button>
        )}

      </Drawer>
  );
};

export default NotifierDrawer;