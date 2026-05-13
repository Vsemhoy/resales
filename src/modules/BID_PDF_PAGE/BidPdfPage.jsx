import { BarsOutlined, CodepenOutlined, EllipsisOutlined, ExpandOutlined, FileOutlined, PercentageOutlined, RocketFilled } from '@ant-design/icons';
import { Button, Checkbox, Col, Dropdown, Flex, Row, Space } from 'antd';
import React, { useState } from 'react';

const BidPdfPage = (props) => {
    const [orientation, setOrientation] = useState('v');
    const [companyId, setCompanyId] = useState('2');
    const [tagetSystem, setTagetSystem] = useState('t');
    const [holdByEngineer, setHoldByEngineer] = useState(false);

    const onSetOrientation = (e) => {
        console.log('click', e);
        setOrientation(e.key);
    };
    const onSetCompanyId = (e) => {
        console.log('click', e);
        setCompanyId(e.key);
    };
    const onSetTargetSystem = (e) => {
        console.log('click', e);
        setTagetSystem(e.key);
    };

    const orientOptions = [
        { key: 'v', label: 'Вертикальная ориентация' },
        { key: 'h', label: 'Горизонтальная ориентация' },
    ];
    const companyOptions = [
        { key: '2', label: 'Arstel', color: 'orange', disabled: companyId === 2 },
        { key: '3', label: 'Rondo', color: 'green' , disabled: companyId === 3 },
    ];
    const targetSystems = [
        { key: 't', label: 'Трансляционная' },
        { key: 'p', label: 'Профессиональная' },
    ];
    const tabs = [
        { key: 'tab1', label: 'Обложка',       draggable: false, target: null},
        { key: 'tab11', label: 'Блок 1',       draggable: true, target: null},
        { key: 'tab111', label: 'Блок 2',      draggable: true, target: 't'},
        { key: 'tab112', label: 'Блок 3',      draggable: true, target: 't'},
        { key: 'tab122', label: 'Блок 4',      draggable: true, target: 'p'},
        { key: 'tab1122', label: 'Оглавление', draggable: false, target: null},
    ]
    const [enambledTabs, setEnambledTabs] = useState(['tab1', 'tab11', 'tab112']);
    

    return (
        <div style={{maxWidth: '1260px', marginRight: 'auto', marginLeft: 'auto', minHeight: 'calc(100vh - 44px)', background: '#ffffff33'}}>
            <Row style={{display: 'flex', justifyContent: 'space-between'}}>
                <div>
                <Space wrap>
                    <Dropdown menu={{ items: companyOptions, onClick: onSetCompanyId }} placement="bottomLeft">
                        <Button
                            color={companyOptions.find(item => item.key === companyId)?.color}
                            variant="solid"
                            size='large'
                        >{companyOptions.find(item => item.key === companyId)?.label}</Button>
                    </Dropdown>

                    <Dropdown menu={{ items: orientOptions, onClick: onSetOrientation }} placement="bottomLeft">
                        <Button 
                            size='large'
                        icon={<FileOutlined style={{transform: `rotate(${orientation === '1' ? 0 : 9}0deg)`}} />}>{orientOptions.find(item => item.key === orientation)?.label}</Button>
                    </Dropdown>
                </Space>                <Space wrap style={{padding: '6px'}}>
                    <Dropdown menu={{ items: targetSystems, onClick: onSetTargetSystem }} placement="bottomLeft">
                        <Button 
                            size='large'
                        icon={<ExpandOutlined style={{transform: `rotate(${orientation === '1' ? 0 : 9}0deg)`}} />}>{targetSystems.find(item => item.key === tagetSystem)?.label}</Button>
                    </Dropdown>
                </Space>
                
            </div>
            <div>
            <Space wrap style={{padding: '6px'}}>
                <Button
                    color="danger" variant="solid"
                    size='large'
                    icon={<CodepenOutlined />}>Инженер работает!</Button>
                <Button
                    color="cyan" variant="solid"
                    size='large'
                    icon={<RocketFilled />}>В печать!</Button>
                </Space>
            </div>

            </Row>
            <Row>
                <div style={{width: '100%', marginBottom: '12px', marginTop: '6px', fontSize: 'large', background: '#ffffff', padding: '6px'}}>
                    (120984) Капитальный ремонт здания учебного корпуса, г. Москва, ул. Кусковская д.45

                </div>
            </Row>

            <Row>
                <Col flex={1}>
                    <div style={{display: 'flex', flexDirection: 'column', gridGap: '6px'}}>
                        {tabs.map(tabby => (
                            <div style={{display: 'grid', gridTemplateColumns: '30px auto 30px', background: enambledTabs.includes(tabby.key) ? 'white' : 'gray' }}>
                                <div>{tabby.draggable && (<BarsOutlined />)}</div>
                                <div>{tabby.label}</div>
                                <div>
                                    <Checkbox checked={enambledTabs.includes(tabby.key)} />
                                </div>
                            </div>
                        ))}
                    </div>
                </Col>
                <Col flex={5}>
                    Большой контент
                </Col>
                <Col flex={1}>
                    Минимапа
                </Col>
            </Row>
        </div>
    );
};

export default BidPdfPage;
