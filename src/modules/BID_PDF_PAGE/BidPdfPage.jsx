import React, {useEffect, useState} from 'react';
import {CloseOutlined, InboxOutlined, PlusOutlined} from '@ant-design/icons';
import {Button, Card, Checkbox, Flex, Form, Input, Layout, Radio, Switch, Tabs, Tooltip, Upload} from 'antd';
import './styles/bidPagePdf.css';
import {Content} from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import TextArea from "antd/es/input/TextArea";
import NameSelect from "../BID_PAGE/components/NameSelect";
import {CSRF_TOKEN, PRODMODE} from "../../config/config";
import {PROD_AXIOS_INSTANCE} from "../../config/Api";
import MODELS from "../BID_PAGE/mock/mock_models";
import ModelInput from "../BID_PAGE/components/ModelInput";
import {useParams} from "react-router-dom";

const BidPdfPage = () => {

    const { bidId } = useParams();

    const [form] = Form.useForm();

    const [modelsSelect, setModelsSelect] = useState([]);
    const [bidSubtype, setBidSubtype] = useState(false);
    const [isCreatePdf, setIsCreatePdf] = useState(false);
    const [currency, setCurrency] = useState({ label: '$', value: '1' });
    const [featureFields, setFeatureFields] = useState([
        {
            key: 1,
            name: 1,
        }
    ]);
    const currencyOptions = [
        { label: '$', value: '1' },
        { label: '€', value: '2' },
        { label: '₽', value: '3' },
    ];
    const [tabsTrans, setTabsTrans] = useState([
        { label: 'Особенности системы',   value: '2', checked: false },
        { label: 'Выбор оборудования',    value: '3', checked: false },
        { label: 'Рекомендации',          value: '4', checked: false },
        { label: 'Описание оборудования', value: '5', checked: false },
    ]);
    const [tabsProf, setTabsProf] = useState([
        { label: 'Особенности системы',   value: '2', checked: false },
        { label: 'Рекомендации',          value: '4', checked: false },
        { label: 'Описание оборудования', value: '5', checked: false },
    ]);
    const formStyle = {
        width: '98%',
        height: '95%',
        background: '#ffffff94',
        borderRadius: 8,
        padding: 24,
        display: 'grid',
        gridTemplateRows: '95% 40px',
    };
    const cardStyle = {
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        paddingRight: 8,
    };


    const structuralDiagrams = (e) => {
        console.log('Upload event:', e);
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };
    const blockPlacements = (e) => {
        console.log('Upload event:', e);
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };
    const normFile = (e) => {
        console.log('Upload event:', e);
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };

    const tabs = [
        {
            key: 1,
            label: 'Титульный лист',
            children: (
                <Card
                    size="default"
                    title="Титульный лист"
                    key={1}
                    style={cardStyle}
                >
                    <Form.Item name="tel"
                               label="Телефон"
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item name="email"
                               label="E-mail"
                    >
                        <Input />
                    </Form.Item>
                </Card>
            )
        },
        {
            key: 2,
            label: 'Особенности системы',
            children: (
                <Card
                    size="default"
                    title="Особенности системы и требования заказчика"
                    key={2}
                    style={cardStyle}
                >
                    <Form.List name="features" children>
                        {(featureFields, { add, remove }) => (
                            <div>
                                <Flex justify={'center'} style={{ marginBottom: 5 }}>
                                    <Button type="dashed"
                                            onClick={() => add()}
                                            block
                                            icon={<PlusOutlined />}
                                    >
                                        Добавить особенность/требование
                                    </Button>
                                </Flex>
                                {featureFields.map(({ key, name }, idx) => (
                                    <Flex key={key} align="center" justify="space-between" gap={'middle'}>
                                        <p>{idx + 1}.</p>
                                        <Form.Item name={[name, 'feature']} style={{ flexGrow: 1, margin: 0 }}>
                                            <TextArea onChange={() => {}}
                                                      style={{ width: '100%', height: 'autosize', resize: 'none' }}
                                                      autoSize={{ minRows: 1, maxRows: 5 }}
                                                      placeholder={'Особенность или требование...'}
                                            />
                                        </Form.Item>
                                        <CloseOutlined onClick={() => remove(name)} />
                                    </Flex>
                                ))}
                            </div>
                        )}
                    </Form.List>
                </Card>
            )
        },
        {
            key: 3,
            label: 'Выбор оборудования',
            children: (
                <Card
                    size="default"
                    title="Выбор оборудования"
                    key={3}
                    style={cardStyle}
                >
                    <Form.Item name="selection-of-equipment" label="Опишите выбор оборудования">
                        <TextArea
                            autoSize={{ minRows: 2, maxRows: 5 }}
                            style={{ width: '100%', resize: 'none' }}
                        />
                    </Form.Item>
                    <Form.Item label="Структурная схема проекта">
                        <Form.Item
                            name="structuralDiagrams"
                            valuePropName="fileList"
                            getValueFromEvent={normFile}
                            noStyle
                        >
                            <Upload.Dragger
                                multiple
                                beforeUpload={() => false}
                            >
                                <p className="ant-upload-drag-icon">
                                    <InboxOutlined />
                                </p>
                                <p className="ant-upload-text">Кликните или перетащите файл в эту область для загрузки.</p>
                                <p className="ant-upload-hint">Поддерживается одиночная или массовая загрузка.</p>
                            </Upload.Dragger>
                        </Form.Item>
                    </Form.Item>
                    <Form.Item label="Размещение блоков в шкафах">
                        <Form.Item
                            name="blockPlacements"
                            valuePropName="fileList"
                            getValueFromEvent={normFile}
                            noStyle
                        >
                            <Upload.Dragger
                                multiple
                                beforeUpload={() => false}
                            >
                                <p className="ant-upload-drag-icon">
                                    <InboxOutlined />
                                </p>
                                <p className="ant-upload-text">Кликните или перетащите файл в эту область для загрузки.</p>
                                <p className="ant-upload-hint">Поддерживается одиночная или массовая загрузка.</p>
                            </Upload.Dragger>
                        </Form.Item>
                    </Form.Item>
                </Card>
            )
        },
        {
            key: 4,
            label: 'Рекомендации',
            children: (
                <Card
                    size="default"
                    title="Рекомендации по дополнительному оборудованию системы"
                    key={4}
                    style={cardStyle}
                >
                    <Form.List name="recommendations" children>
                        {(fields, { add, remove }) => (
                            <div>
                                <Flex justify={'center'} style={{ marginBottom: 5 }}>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                        Добавить рекомендацию
                                    </Button>
                                </Flex>
                                {fields.map(({ key, name }, idx) => (
                                    <Flex key={key} align="flex-start" justify="space-between" gap={'middle'}>
                                        <div style={{ height: 32, padding: '5px 0' }}>{idx + 1}.</div>
                                        <Form.Item name={[name, 'recommendation-model']}>
                                            <NameSelect
                                                options={prepareSelect(modelsSelect)}
                                                disabled={false}
                                                onUpdateModelName={() => {}}
                                                minWidth={225}
                                            />
                                        </Form.Item>
                                        <Form.Item name={[name, 'recommendation-count']} style={{ width: '10%' }}>
                                            <ModelInput
                                                disabled={false}
                                                type={'model_count'}
                                                onChangeModel={() => {}}
                                                error={false}
                                                isOnlyPositive={true}
                                                title={'Количество моделей'}
                                            />
                                        </Form.Item>

                                        <Form.Item name={[name, 'recommendation-text']} style={{ width: '70%' }}>
                                            <TextArea onChange={() => {}}
                                                      style={{ width: '100%', height: 'autosize', resize: 'none' }}
                                                      autoSize={{ minRows: 1, maxRows: 5 }}
                                                      placeholder={'Примечание...'}
                                            />
                                        </Form.Item>
                                        <CloseOutlined style={{ height: 32 }} onClick={() => remove(name)} />
                                    </Flex>
                                ))}
                            </div>
                        )}
                    </Form.List>
                </Card>
            )
        },
    ];

    const fetchBidModels = async () => {
        if (PRODMODE) {
            const path = `/api/sales/getmodels`;
            try {
                let response = await PROD_AXIOS_INSTANCE.get(path, {
                    data: {},
                    _token: CSRF_TOKEN,
                });
                if (response.data) {
                    setModelsSelect(response.data.models);
                }
            } catch (e) {
                console.log(e);
            }
        } else {
            setModelsSelect(MODELS);
        }
    };

    const handleFinish = async (data) => {
        console.log(data);
        if (PRODMODE) {
            try {
                data.currency = currency;
                data.bidSubtype = bidSubtype;
                data.tabs = bidSubtype ? tabsProf : tabsTrans;
                const formData = new FormData();
                formData.append('_token', CSRF_TOKEN);
                formData.append('data', JSON.stringify(data));

                if (data.structuralDiagrams && data.structuralDiagrams > 0) {
                    data.structuralDiagrams.forEach((uploadFile) => {
                        if (uploadFile.originFileObj) {
                            formData.append('structuralDiagrams[]', uploadFile.originFileObj);
                        }
                    });
                }

                if (data.blockPlacements && data.blockPlacements > 0) {
                    data.blockPlacements.forEach((uploadFile) => {
                        if (uploadFile.originFileObj) {
                            formData.append('blockPlacements[]', uploadFile.originFileObj);
                        }
                    });
                }

                let response = await PROD_AXIOS_INSTANCE.post(`api/sales/createPDF/${bidId}`, formData);
                console.log(response);
            } catch (e) {
                console.log(e);
            }
        }
    };

    const handleCurrencyChange = (e) => {
        const selectedValue = e.target.value;
        const selectedOption = currencyOptions.find(opt => opt.value === selectedValue);
        setCurrency(selectedOption || { label: '$', value: 1 });
    };
    const prepareSelect = (select) => {
        if (select) {
            return select.map((item) => ({value: item.id, label: item.name, used: item.used}));
        } else {
            return [];
        }
    };
    const setCheckboxChecked = (tab, checked) => {
        if (bidSubtype) {
            setTabsProf(prev => checkboxSet(prev, tab, checked));
        } else {
            setTabsTrans(prev => checkboxSet(prev, tab, checked));
        }
    };
    const checkboxSet = (prev, tab, checked) => {
        const itemIndex = prev.findIndex(item => item.value === tab.value);
        return prev.map((item, idx) => {
            if (+itemIndex === +idx) {
                return {
                    ...item,
                    checked: checked,
                }
            }
            return item;
        });
    };

    useEffect(() => {
        fetchBidModels().then();
    }, []);

    const filteredTabs = React.useMemo(() => {
        const activeTabKeys = (bidSubtype ? tabsProf : tabsTrans)
            .filter(tab => tab.checked && tab.value !== '5')
            .map(tab => Number(tab.value));
        return tabs.filter(tab => tab.key === 1 || activeTabKeys.includes(tab.key));
    }, [bidSubtype, tabsProf, tabsTrans]);

    return (
        <Layout className={'sa-layout sa-w-100'}>
            <Content>
                <div className={'bid-pdf-page'}>
                    <Form
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                        form={form}
                        style={formStyle}
                        name="bid-pdf"
                        autoComplete="off"
                        initialValues={{ items: [{}] }}
                        onFinish={handleFinish}
                    >
                        <Tabs
                            onChange={() => console.log('onChangeTab')}
                            type="card"
                            className="full-height-tabs"
                            style={{ height: '100%', maxHeight: '100%' }}
                            tabBarStyle={{ margin: 0 }}
                            /*tabPaneStyle={{ height: '100%' }}*/
                            items={filteredTabs}
                        />

                        <Flex gap="middle" justify="flex-end" align="center">
                            <Button htmlType="submit"
                                    onClick={() => setIsCreatePdf(true)}
                            >
                                Создать PDF
                            </Button>
                            <Button type="primary"
                                    htmlType="submit"
                                    onClick={() => setIsCreatePdf(false)}
                            >
                                Сохранить
                            </Button>
                        </Flex>
                    </Form>
                </div>
            </Content>
            <Sider width={'250px'}
                   style={{
                        backgroundColor: '#ffffff',
                        overflow: 'hidden',
                        position: 'sticky',
                        top: '100px',
                        zIndex: 1
                    }}
            >
                <div className={'sa-bid-pdf-sider'}>
                    <h3>Настройки</h3>
                    <Switch
                        checkedChildren="Профессиональный звук"
                        unCheckedChildren="Трансляционный звук"
                        onChange={(_) => setBidSubtype((prev) => !prev)}
                    />
                    <Radio.Group
                        block
                        options={currencyOptions}
                        value={currency.value}
                        onChange={handleCurrencyChange}
                        optionType="button"
                        buttonStyle="solid"
                    />
                    {bidSubtype ? tabsProf.map(tab => {
                        return (
                            <Checkbox key={`checkbox-prof-${tab.value}`}
                                      onChange={(e) => setCheckboxChecked(tab, e.target.checked)}
                                      checked={tab.checked}
                            >
                                {tab.label}
                            </Checkbox>
                        );
                    }) : tabsTrans.map(tab => {
                        return (
                            <Checkbox key={`checkbox-trans-${tab.value}`}
                                      onChange={(e) => setCheckboxChecked(tab, e.target.checked)}
                                      checked={tab.checked}
                            >
                                {tab.label}
                            </Checkbox>
                        );
                    })}
                </div>
            </Sider>
        </Layout>
    );
};

export default BidPdfPage;
