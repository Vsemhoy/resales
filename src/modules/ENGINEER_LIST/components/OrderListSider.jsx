import { PlusCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import {Affix, Button, Input, List, Select} from 'antd';
import React, { useEffect, useState } from 'react';
import {CheckOutlined, CloseOutlined} from "@ant-design/icons";

const useWindowSize = () => {
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowSize;
};

const OrderListSider = (props) => {

    const [ordersP, setOrdersP] = useState([]);

    useEffect(() => {
        setOrdersP(props.orders);
    }, [props.orders]);

    const { height: windowHeight } = useWindowSize();
    const affixTop = 115;

    const containerHeight = windowHeight - affixTop - 110;

    return (
        <Affix offsetTop={115}>
            <div className='sider-body-orders'>
                <div className={'sider-unit'}>
                    <div className='sider-unit-title'>Заявки</div>
                    <div
                        className='sider-unit-control'
                        style={{
                            maxHeight: `${containerHeight}px`,
                            overflowY: 'auto'
                        }}
                    >
                        <List
                            size="small"
                            dataSource={ordersP}
                            renderItem={(order, index) => (
                                <List.Item key={index}>
                                    <div className="sider-order-list">
                                        <div className="manager-info">
                                            <span>{order.manager || 'Иванов И.И.'}</span>
                                        </div>

                                        <div className="buttons-container">
                                            <Button type="primary" icon={<CheckOutlined/>} size="small">
                                                Принять
                                            </Button>
                                            <Button type="primary" danger icon={<CloseOutlined/>} size="small">
                                                Отклонить
                                            </Button>
                                        </div>

                                        <div className="dates-container">
                                            <div className="date-row">
                                                <span className="date-label">Создан:</span>
                                                <span>{order.created_at || '12.04.2023 14:30'}</span>
                                            </div>
                                            <div className="date-row">
                                                <span className="date-label">Обновлен:</span>
                                                <span>{order.updated_at || '13.04.2023 09:15'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </List.Item>
                            )}
                        />
                    </div>
                </div>
            </div>
        </Affix>
    );
};

export default OrderListSider;


// <Select placeholder=''
//         style={{width: '100%'}}
//         options={props.filter_companies_select}
//         onChange={(val) => props.on_change_filter_box('type', val)}
//         allowClear
// />