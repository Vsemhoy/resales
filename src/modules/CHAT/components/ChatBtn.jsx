import React, { useEffect, useState } from 'react';
import { Dropdown, Badge } from 'antd';
import { WechatWorkOutlined } from '@ant-design/icons';
import { PROD_AXIOS_INSTANCE } from '../../../config/Api';
import { ShortName } from '../../../components/helpers/TextHelpers';

export const ChatBtn = ({ userdata }) => {
  const [sms, setSms] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSms = async () => {
      setLoading(true);
      try {
        const response = await PROD_AXIOS_INSTANCE.get('/api/sms');
        if (response.data?.content?.sms) {
          setSms(response.data.content.sms);
        } else {
          setSms([]);
        }
      } catch (error) {
        console.error('Ошибка при загрузке sms:', error);
        setSms([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSms();
  }, []);

  const menuItems = loading
    ? [{ key: 'loading', label: <p style={{ margin: 0 }}>Загрузка...</p> }]
    : sms.length > 0
    ? sms.map((msg) => ({ key: msg.id, label: <span>{msg.from}</span> }))
    : [{ key: 'no-messages', label: <p style={{ margin: 0 }}>У вас нет сообщений</p> }];

  return (
    <Dropdown menu={{ items: menuItems }} trigger={['hover']}>
      <div className="sa-flex-gap" style={{ cursor: 'pointer', position: 'relative' }}>
        <Badge count={sms.length} size="small" offset={[0, 0]}>
          <WechatWorkOutlined style={{ fontSize: '20px' }} />
        </Badge>
        {ShortName(userdata?.user?.surname, userdata?.user?.name, userdata?.user?.secondname)}
      </div>
    </Dropdown>
  );
};
