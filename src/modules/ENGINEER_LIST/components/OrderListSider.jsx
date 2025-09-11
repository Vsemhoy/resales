import { PlusCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import {Affix, Button, Input, List, Modal, Select} from 'antd';
import React, { useEffect, useState } from 'react';
import {CheckOutlined, CloseOutlined} from "@ant-design/icons";
import dayjs from "dayjs";
import DeclineEngineer from "./DeclineEngineer";

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
    const [role, setRole] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [orderID, setOrderID] = useState(0);
    const [reason, setReason] = useState("");

    useEffect(() => {
        setOrdersP(props.orders);
        setRole(props.activeRole);
        setIsOpen(props.isOpenModal);
        setOrderID(props.modalOrderID);
        setReason(props.modalReason);
    }, [props.orders, props.activeRole, props.isOpenModal, props.modalOrderID, props.modalReason]);

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

                                        {role && role === 1 ?(
                                            <div className="buttons-container" >
                                                <Button type="primary" icon={<CheckOutlined/>} size="small">
                                                    Принять
                                                </Button>
                                                <Button type="primary" danger icon={<CloseOutlined/>} size="small" onClick={(e) => props.returnOrderToSpec(order.id, "engineer")}>
                                                    Отклонить
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="buttons-container">
                                                <Button type="primary" danger icon={<CloseOutlined/>} size="small" style={{width:'100%'}} onClick={(e) => props.returnOrderToSpec(order.id, "myself")}>
                                                    Отозвать
                                                </Button>
                                            </div>
                                        )}

                                        <div className="dates-container">
                                            <div className="date-row">
                                                <span className="date-label">Создан:</span>
                                                <span>
                                                  {order.created_at ? dayjs.unix(order.created_at).format('DD.MM.YYYY') : null}
                                                </span>
                                            </div>
                                            <div className="date-row">
                                            <span className="date-label">Обновлен:</span>
                                                <span>{order.updated_at ? dayjs.unix(order.updated_at).format('DD.MM.YYYY') : null}</span>
                                            </div>
                                        </div>
                                    </div>
                                </List.Item>
                            )}
                        />
                    </div>
                </div>
            </div>

            {isOpen && (
                <DeclineEngineer
                    orderID={orderID}
                    reason={reason}
                    open={isOpen}
                    handleOk={props.handleOk}
                    handleCancel={props.handleCancel}
                    handleSetText={props.handleSetText}
                />
            )}

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