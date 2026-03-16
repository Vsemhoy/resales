import React, {useEffect, useState} from 'react';
import {ArrowLeftOutlined, CloseOutlined, InboxOutlined, PlusOutlined} from '@ant-design/icons';
import {
    Button,
    Card,
    Checkbox,
    Divider,
    Flex,
    Form,
    Input,
    Layout,
    Radio,
    Spin,
    Switch,
    Tag,
    Tabs,
    Tooltip,
    Upload, Select
} from 'antd';
import './styles/bidPagePdf.css';
import {Content} from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import TextArea from "antd/es/input/TextArea";
import NameSelect from "../BID_PAGE/components/NameSelect";
import {CSRF_TOKEN, HTTP_HOST, PRODMODE, ROUTE_PREFIX} from "../../config/config";
import {PROD_AXIOS_INSTANCE} from "../../config/Api";
import MODELS from "../BID_PAGE/mock/mock_models";
import ModelInput from "../BID_PAGE/components/ModelInput";
import {useNavigate, useParams} from "react-router-dom";
import {PDF} from "./mock/mock";
import {useUserData} from "../../context/UserDataContext";
import CustomModal from "../../components/helpers/modals/CustomModal";

const FILE_FIELD_NAMES = [
    'structuralDiagrams',
    'blockPlacements',
    'placementOfAcousticSystems_placementOfAcousticSystems_file',
    'placementOfAcousticSystems_lineArrayConfiguration_file',
    'calculatingReverberationTime_reverberationTime_file',
    'calculatingDirectSpl_levelDistributionMap_file',
    'calculatingDirectSpl_levelDistributionChart_file',
    'calculatingCoefficientSti_levelDistributionMap_file',
    'calculatingCoefficientSti_levelDistributionChart_file',
    'calculatingAlcons_levelDistributionMap_file',
    'calculatingAlcons_levelDistributionChart_file',
];

const getFileNameFromUrl = (url = '') => {
    const rawName = String(url).split('?')[0].split('#')[0].split('/').pop() || 'file';
    try {
        return decodeURIComponent(rawName);
    } catch (_) {
        return rawName;
    }
};

const normalizeFileUrl = (url) => {
    if (!url || typeof url !== 'string') {
        return undefined;
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    if (url.startsWith('/')) {
        return `${HTTP_HOST}${url}`;
    }
    return url;
};

const toUploadFile = (file, fieldName, index) => {
    if (!file) {
        return null;
    }

    if (typeof file === 'string') {
        return {
            uid: `${fieldName}-${index}`,
            name: getFileNameFromUrl(file),
            status: 'done',
            url: normalizeFileUrl(file),
        };
    }

    const url = file?.url || file?.link || file?.path || file?.file_link;
    const name = file?.name || file?.file_name || file?.filename || file?.original_name || getFileNameFromUrl(url) || `file-${index + 1}`;

    return {
        ...file,
        uid: String(file?.uid || file?.id || `${fieldName}-${index}`),
        name,
        status: file?.status || 'done',
        url: normalizeFileUrl(url),
    };
};

const normalizeUploadFileList = (value, fieldName) => {
    if (!value) {
        return [];
    }
    if (Array.isArray(value)) {
        return value
            .map((file, index) => toUploadFile(file, fieldName, index))
            .filter(Boolean);
    }
    return [toUploadFile(value, fieldName, 0)].filter(Boolean);
};

const normalizeFormData = (payload = {}) => {
    const unpacked = {
        ...payload,
        ...(payload?.acousticCalculation || {}),
    };

    FILE_FIELD_NAMES.forEach((fieldName) => {
        const imageFieldName = `image_${fieldName}`;
        const rawValue = unpacked[fieldName] || unpacked[imageFieldName];
        unpacked[fieldName] = normalizeUploadFileList(rawValue, fieldName);
    });

    return unpacked;
};

const toServerFilePath = (value) => {
    if (!value || typeof value !== 'string') {
        return '';
    }
    if (value.startsWith(HTTP_HOST)) {
        return value.slice(HTTP_HOST.length);
    }
    return value;
};

const getSavedFilePath = (fileList = []) => {
    const hasNewFile = fileList.some((file) => !!file?.originFileObj);
    if (hasNewFile) {
        return '';
    }
    const existingFile = fileList.find((file) => !file?.originFileObj);
    if (!existingFile) {
        return '';
    }
    return toServerFilePath(existingFile?.url || existingFile?.path || existingFile?.link || existingFile?.file_link || '');
};

const collectSavedFilePaths = (data, fieldNames) => {
    return fieldNames.reduce((acc, fieldName) => {
        acc[fieldName] = getSavedFilePath(data?.[fieldName]);
        return acc;
    }, {});
};

const BidPdfPage = () => {

    const { bidId } = useParams();
    const navigate = useNavigate();

    const { userdata } = useUserData();

    const [isEngineer, setIsEngineer] = useState(false);
    const [isNeedEngineer, setIsNeedEngineer] = useState(false);

    const [form] = Form.useForm();

    const [isLoading, setIsLoading] = useState(false);

    const [modelsSelect, setModelsSelect] = useState([]);
    const [bidType, setBidType] = useState(null);
    const [bidSubtype, setBidSubtype] = useState(false);
    const [isCreatePdf, setIsCreatePdf] = useState(false);
    const [currency, setCurrency] = useState({ label: '$', value: '1' });

    const [isOpenCustomModal, setIsOpenCustomModal] = useState(false);
    const [customModalTitle, setCustomModalTitle] = useState('');
    const [customModalText, setCustomModalText] = useState('');
    const [customModalType, setCustomModalType] = useState('');
    const [customModalFilling, setCustomModalFilling] = useState([]);
    const [customModalButtons, setCustomModalButtons] = useState([]);

    const isNeedEngineerButtons = [
        {
            id: 1,
            text: "Нет",
            color: "default",
            variant: "outlined"
        },
        {
            id: 2,
            text: "Да",
            color: "purple",
            variant: "solid"
        },
    ];

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
        { label: 'Рекомендации',          value: '5', checked: false },
        { label: 'Описание оборудования', value: '6', checked: false },
    ]);
    const [tabsProf, setTabsProf] = useState([
        { label: 'Особенности системы',   value: '2', checked: false },
        { label: 'Акустический расчет',   value: '4', checked: false },
        { label: 'Рекомендации',          value: '5', checked: false },
        { label: 'Описание оборудования', value: '6', checked: false },
    ]);
    const formStyle = {
        width: '98%',
        flex: 1,
        minHeight: 0,
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
    //const isFieldsDisabled = isNeedEngineer && !isEngineer;
    const isFieldsDisabled = (isEngineer && !isNeedEngineer) || (isNeedEngineer && !isEngineer);

    const tabs = [
        {
            key: 1,
            label: 'Титульный лист',
            forceRender: true,
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
                        <Input disabled={isFieldsDisabled}/>
                    </Form.Item>
                    <Form.Item name="email"
                               label="E-mail"
                    >
                        <Input disabled={isFieldsDisabled}/>
                    </Form.Item>
                </Card>
            )
        },
        {
            key: 2,
            label: 'Особенности системы',
            forceRender: true,
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
                                            disabled={isFieldsDisabled}
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
                                                      disabled={isFieldsDisabled}
                                            />
                                        </Form.Item>
                                        <CloseOutlined onClick={() => {
                                            if (!isFieldsDisabled) remove(name);
                                        }}/>
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
            forceRender: true,
            children: (
                <Card
                    size="default"
                    title="Выбор оборудования"
                    key={3}
                    style={cardStyle}
                >
                    <Form.Item name="selectionOfEquipment" label="Опишите выбор оборудования">
                        <TextArea
                            autoSize={{ minRows: 2, maxRows: 5 }}
                            style={{ width: '100%', resize: 'none' }}
                            disabled={isFieldsDisabled}
                        />
                    </Form.Item>
                    <Divider/>
                    <Form.Item label="Структурная схема проекта">
                        <Form.Item
                            name="structuralDiagrams"
                            valuePropName="fileList"
                            getValueFromEvent={normFile}
                            noStyle
                        >
                            <Upload.Dragger
                                accept=".png"
                                beforeUpload={() => false}
                                disabled={isFieldsDisabled}
                            >
                                <p className="ant-upload-drag-icon">
                                    <InboxOutlined />
                                </p>
                                <p className="ant-upload-text">Кликните или перетащите файл в эту область для загрузки.</p>
                                <p className="ant-upload-hint">Поддерживается одиночная загрузка.  Допустимый формат: .png !</p>
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
                                accept=".png"
                                beforeUpload={() => false}
                                disabled={isFieldsDisabled}
                            >
                                <p className="ant-upload-drag-icon">
                                    <InboxOutlined />
                                </p>
                                <p className="ant-upload-text">Кликните или перетащите файл в эту область для загрузки.</p>
                                <p className="ant-upload-hint">Поддерживается одиночная загрузка.  Допустимый формат: .png !</p>
                            </Upload.Dragger>
                        </Form.Item>
                    </Form.Item>
                </Card>
            )
        },
        {
            key: 4,
            label: 'Акустический расчет',
            forceRender: true,
            children: (
                <Card
                    size="default"
                    title="Акустический расчет"
                    key={4}
                    style={cardStyle}
                >
                    <Form.Item name="acousticCalculation_intro" label="Опишите акустический расчет">
                        <TextArea
                            autoSize={{ minRows: 2, maxRows: 5 }}
                            style={{ width: '100%', resize: 'none' }}
                            disabled={isFieldsDisabled}
                        />
                    </Form.Item>

                    <Divider/>

                    <h4>Размещение акустических систем</h4>
                    <Form.Item name='placementOfAcousticSystems_placementOfAcousticSystems_name' label={'Расстановка акустических систем'}>
                        <Input placeholder={'Подпишите изображение...'} disabled={isFieldsDisabled}/>
                    </Form.Item>
                    <Form.Item label={null}>
                        <Form.Item
                            name="placementOfAcousticSystems_placementOfAcousticSystems_file"
                            valuePropName="fileList"
                            getValueFromEvent={normFile}
                            noStyle
                        >
                            <Upload.Dragger
                                accept=".jpg,.jpeg,.png"
                                beforeUpload={() => false}
                                disabled={isFieldsDisabled}
                            >
                                <p className="ant-upload-drag-icon">
                                    <InboxOutlined />
                                </p>
                                <p className="ant-upload-text">Кликните или перетащите файл в эту область для загрузки.</p>
                                <p className="ant-upload-hint">Поддерживается одиночная загрузка.  Допустимые форматы: JPG, JPEG, PNG.</p>
                            </Upload.Dragger>
                        </Form.Item>
                    </Form.Item>
                    <Form.Item name='placementOfAcousticSystems_lineArrayConfiguration_name' label={'Конфигурация линейного массива'}>
                        <Input placeholder={'Подпишите изображение...'} disabled={isFieldsDisabled}/>
                    </Form.Item>
                    <Form.Item label={null}>
                        <Form.Item
                            name="placementOfAcousticSystems_lineArrayConfiguration_file"
                            valuePropName="fileList"
                            getValueFromEvent={normFile}
                            noStyle
                        >
                            <Upload.Dragger
                                accept=".jpg,.jpeg,.png"
                                beforeUpload={() => false}
                                disabled={isFieldsDisabled}
                            >
                                <p className="ant-upload-drag-icon">
                                    <InboxOutlined />
                                </p>
                                <p className="ant-upload-text">Кликните или перетащите файл в эту область для загрузки.</p>
                                <p className="ant-upload-hint">Поддерживается одиночная загрузка.  Допустимые форматы: JPG, JPEG, PNG.</p>
                            </Upload.Dragger>
                        </Form.Item>
                    </Form.Item>
                    <Form.Item name="placementOfAcousticSystems_description" label="Опишите размещение акустических систем">
                        <TextArea
                            autoSize={{ minRows: 2, maxRows: 5 }}
                            style={{ width: '100%', resize: 'none' }}
                            disabled={isFieldsDisabled}
                        />
                    </Form.Item>

                    <Divider/>

                    <h4>Расчет времени реверберации</h4>
                    <Form.Item name='calculatingReverberationTime_reverberationTime_name' label={'Время реверберации'}>
                        <Input placeholder={'Подпишите изображение...'} disabled={isFieldsDisabled}/>
                    </Form.Item>
                    <Form.Item label={null}>
                        <Form.Item
                            name="calculatingReverberationTime_reverberationTime_file"
                            valuePropName="fileList"
                            getValueFromEvent={normFile}
                            noStyle
                        >
                            <Upload.Dragger
                                accept=".jpg,.jpeg,.png"
                                beforeUpload={() => false}
                                disabled={isFieldsDisabled}
                            >
                                <p className="ant-upload-drag-icon">
                                    <InboxOutlined />
                                </p>
                                <p className="ant-upload-text">Кликните или перетащите файл в эту область для загрузки.</p>
                                <p className="ant-upload-hint">Поддерживается одиночная загрузка.  Допустимые форматы: JPG, JPEG, PNG.</p>
                            </Upload.Dragger>
                        </Form.Item>
                    </Form.Item>
                    <Form.Item name="calculatingReverberationTime_description" label="Опишите расчет времени реверберации">
                        <TextArea
                            autoSize={{ minRows: 2, maxRows: 5 }}
                            style={{ width: '100%', resize: 'none' }}
                            disabled={isFieldsDisabled}
                        />
                    </Form.Item>

                    <Divider/>

                    <h4>Расчет DIRECT SPL</h4>
                    <Form.Item name='calculatingDirectSpl_levelDistributionMap_name' label={'Карта распределения уровня DIRECT SPL'}>
                        <Input placeholder={'Подпишите изображение...'} disabled={isFieldsDisabled}/>
                    </Form.Item>
                    <Form.Item label={null}>
                        <Form.Item
                            name="calculatingDirectSpl_levelDistributionMap_file"
                            valuePropName="fileList"
                            getValueFromEvent={normFile}
                            noStyle
                        >
                            <Upload.Dragger
                                accept=".jpg,.jpeg,.png"
                                beforeUpload={() => false}
                                disabled={isFieldsDisabled}
                            >
                                <p className="ant-upload-drag-icon">
                                    <InboxOutlined />
                                </p>
                                <p className="ant-upload-text">Кликните или перетащите файл в эту область для загрузки.</p>
                                <p className="ant-upload-hint">Поддерживается одиночная загрузка.  Допустимые форматы: JPG, JPEG, PNG.</p>
                            </Upload.Dragger>
                        </Form.Item>
                    </Form.Item>
                    <Form.Item name='calculatingDirectSpl_levelDistributionChart_name' label={'График распределения уровня DIRECT SPL'}>
                        <Input placeholder={'Подпишите изображение...'} disabled={isFieldsDisabled}/>
                    </Form.Item>
                    <Form.Item label={null}>
                        <Form.Item
                            name="calculatingDirectSpl_levelDistributionChart_file"
                            valuePropName="fileList"
                            getValueFromEvent={normFile}
                            noStyle
                        >
                            <Upload.Dragger
                                accept=".jpg,.jpeg,.png"
                                beforeUpload={() => false}
                                disabled={isFieldsDisabled}
                            >
                                <p className="ant-upload-drag-icon">
                                    <InboxOutlined />
                                </p>
                                <p className="ant-upload-text">Кликните или перетащите файл в эту область для загрузки.</p>
                                <p className="ant-upload-hint">Поддерживается одиночная загрузка.  Допустимые форматы: JPG, JPEG, PNG.</p>
                            </Upload.Dragger>
                        </Form.Item>
                    </Form.Item>
                    <Form.Item name="calculatingDirectSpl_description" label="Опишите расчет DIRECT SPL">
                        <TextArea
                            autoSize={{ minRows: 2, maxRows: 5 }}
                            style={{ width: '100%', resize: 'none' }}
                            disabled={isFieldsDisabled}
                        />
                    </Form.Item>

                    <Divider/>

                    <h4>Расчет TOTAL SPL</h4>
                    <Form.Item name="calculatingTotalSpl_description" label="Опишите расчет TOTAL SPL">
                        <TextArea
                            autoSize={{ minRows: 2, maxRows: 5 }}
                            style={{ width: '100%', resize: 'none' }}
                            disabled={isFieldsDisabled}
                        />
                    </Form.Item>

                    <Divider/>

                    <h4>Расчет коэффициента STI</h4>
                    <Form.Item name='calculatingCoefficientSti_levelDistributionMap_name' label={'Карта распределения STI'}>
                        <Input placeholder={'Подпишите изображение...'} disabled={isFieldsDisabled}/>
                    </Form.Item>
                    <Form.Item label={null}>
                        <Form.Item
                            name="calculatingCoefficientSti_levelDistributionMap_file"
                            valuePropName="fileList"
                            getValueFromEvent={normFile}
                            noStyle
                        >
                            <Upload.Dragger
                                accept=".jpg,.jpeg,.png"
                                beforeUpload={() => false}
                                disabled={isFieldsDisabled}
                            >
                                <p className="ant-upload-drag-icon">
                                    <InboxOutlined />
                                </p>
                                <p className="ant-upload-text">Кликните или перетащите файл в эту область для загрузки.</p>
                                <p className="ant-upload-hint">Поддерживается одиночная загрузка.  Допустимые форматы: JPG, JPEG, PNG.</p>
                            </Upload.Dragger>
                        </Form.Item>
                    </Form.Item>
                    <Form.Item name='calculatingCoefficientSti_levelDistributionChart_name' label={'График распределения STI'}>
                        <Input placeholder={'Подпишите изображение...'} disabled={isFieldsDisabled}/>
                    </Form.Item>
                    <Form.Item label={null}>
                        <Form.Item
                            name="calculatingCoefficientSti_levelDistributionChart_file"
                            valuePropName="fileList"
                            getValueFromEvent={normFile}
                            noStyle
                        >
                            <Upload.Dragger
                                accept=".jpg,.jpeg,.png"
                                beforeUpload={() => false}
                                disabled={isFieldsDisabled}
                            >
                                <p className="ant-upload-drag-icon">
                                    <InboxOutlined />
                                </p>
                                <p className="ant-upload-text">Кликните или перетащите файл в эту область для загрузки.</p>
                                <p className="ant-upload-hint">Поддерживается одиночная загрузка.  Допустимые форматы: JPG, JPEG, PNG.</p>
                            </Upload.Dragger>
                        </Form.Item>
                    </Form.Item>
                    <Form.Item name="calculatingCoefficientSti_description" label="Опишите расчет коэффициента STI">
                        <TextArea
                            autoSize={{ minRows: 2, maxRows: 5 }}
                            style={{ width: '100%', resize: 'none' }}
                            disabled={isFieldsDisabled}
                        />
                    </Form.Item>

                    <Divider/>

                    <h4>Расчет Alcons</h4>
                    <Form.Item name='calculatingAlcons_levelDistributionMap_name' label={'Карта распределения ALCONS'}>
                        <Input placeholder={'Подпишите изображение...'} disabled={isFieldsDisabled}/>
                    </Form.Item>
                    <Form.Item label={null}>
                        <Form.Item
                            name="calculatingAlcons_levelDistributionMap_file"
                            valuePropName="fileList"
                            getValueFromEvent={normFile}
                            noStyle
                        >
                            <Upload.Dragger
                                accept=".jpg,.jpeg,.png"
                                beforeUpload={() => false}
                                disabled={isFieldsDisabled}
                            >
                                <p className="ant-upload-drag-icon">
                                    <InboxOutlined />
                                </p>
                                <p className="ant-upload-text">Кликните или перетащите файл в эту область для загрузки.</p>
                                <p className="ant-upload-hint">Поддерживается одиночная загрузка.  Допустимые форматы: JPG, JPEG, PNG.</p>
                            </Upload.Dragger>
                        </Form.Item>
                    </Form.Item>
                    <Form.Item name='calculatingAlcons_levelDistributionChart_name' label={'График распределения ALCONS'}>
                        <Input placeholder={'Подпишите изображение...'} disabled={isFieldsDisabled}/>
                    </Form.Item>
                    <Form.Item label={null}>
                        <Form.Item
                            name="calculatingAlcons_levelDistributionChart_file"
                            valuePropName="fileList"
                            getValueFromEvent={normFile}
                            noStyle
                        >
                            <Upload.Dragger
                                accept=".jpg,.jpeg,.png"
                                beforeUpload={() => false}
                                disabled={isFieldsDisabled}
                            >
                                <p className="ant-upload-drag-icon">
                                    <InboxOutlined />
                                </p>
                                <p className="ant-upload-text">Кликните или перетащите файл в эту область для загрузки.</p>
                                <p className="ant-upload-hint">Поддерживается одиночная загрузка.  Допустимые форматы: JPG, JPEG, PNG.</p>
                            </Upload.Dragger>
                        </Form.Item>
                    </Form.Item>
                    <Form.Item name="calculatingAlcons_description" label="Опишите расчет Alcons">
                        <TextArea
                            autoSize={{ minRows: 2, maxRows: 5 }}
                            style={{ width: '100%', resize: 'none' }}
                            disabled={isFieldsDisabled}
                        />
                    </Form.Item>

                    <Divider/>

                    <h4>Выводы</h4>
                    <Form.Item name='conclusion' label={'Вывод'}>
                        <TextArea
                            autoSize={{ minRows: 2, maxRows: 5 }}
                            style={{ width: '100%', resize: 'none' }}
                            disabled={isFieldsDisabled}
                        />
                    </Form.Item>
                    <Form.Item name='conclusion_recommendations' label={'Рекомендации'}>
                        <TextArea
                            autoSize={{ minRows: 2, maxRows: 5 }}
                            style={{ width: '100%', resize: 'none' }}
                            disabled={isFieldsDisabled}
                        />
                    </Form.Item>

                    <Divider/>
                </Card>
            )
        },
        {
            key: 5,
            label: 'Рекомендации',
            forceRender: true,
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
                                    <Button type="dashed"
                                            onClick={() => add()} block icon={<PlusOutlined />}
                                            disabled={isFieldsDisabled}
                                    >
                                        Добавить рекомендацию
                                    </Button>
                                </Flex>
                                {fields.map(({ key, name }, idx) => (
                                    <Flex key={key} align="flex-start" justify="space-between" gap={'middle'}>
                                        <div style={{ height: 32, padding: '5px 0' }}>{idx + 1}.</div>
                                        <Form.Item name={[name, 'recommendation-model']}>
                                            <Input disabled={isFieldsDisabled}/>
                                        </Form.Item>
                                        <Form.Item name={[name, 'recommendation-count']} style={{ width: '10%' }}>
                                            <ModelInput type={'model_count'}
                                                        onChangeModel={() => {}}
                                                        error={false}
                                                        isOnlyPositive={true}
                                                        title={'Количество моделей'}
                                                        disabled={isFieldsDisabled}
                                            />
                                        </Form.Item>

                                        <Form.Item name={[name, 'recommendation-text']} style={{ width: '70%' }}>
                                            <TextArea onChange={() => {}}
                                                      style={{ width: '100%', height: 'autosize', resize: 'none' }}
                                                      autoSize={{ minRows: 1, maxRows: 5 }}
                                                      placeholder={'Примечание...'}
                                                      disabled={isFieldsDisabled}
                                            />
                                        </Form.Item>
                                        <CloseOutlined style={{ height: 32 }}
                                                       onClick={() => {
                                                           if (!isFieldsDisabled) remove(name)
                                                       }}
                                        />
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
            const path = `${ROUTE_PREFIX}/sales/getmodels`;
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

    const fetchBidPdfInfo = async () => {
        setIsLoading(true);
        if (PRODMODE) {
            setTimeout(async () => {
                try {
                    let response = await PROD_AXIOS_INSTANCE.post(`${ROUTE_PREFIX}/sales/pdf/show/${bidId}`, {
                        '_token': CSRF_TOKEN,
                    });
                    if (response.data) {
                        setBidType(response.data?.type ?? response.data?.bidType ?? response.data?.type_id ?? null);
                        setBidSubtype(response.data?.bidSubtype);
                        setIsNeedEngineer(response.data?.bidIsNeedEngineer);
                        setCurrency(response.data?.currency);
                        if (response.data?.bidSubtype) {
                            setTabsProf(prev => tabsCheckedSet(prev, response));
                        } else {
                            setTabsTrans(prev => tabsCheckedSet(prev, response));
                        }
                        form.setFieldsValue(normalizeFormData(response.data));
                    }
                } catch (e) {
                    console.log(e);
                } finally {
                    setIsLoading(false);
                }
            }, 1000);
        } else {
            setTimeout(() => {
                setBidType(PDF?.type ?? PDF?.bidType ?? PDF?.type_id ?? null);
                setBidSubtype(PDF?.bidSubtype);
                setCurrency(PDF?.currency);
                if (PDF?.bidSubtype) {
                    setTabsProf(prev => tabsCheckedSet(prev));
                } else {
                    setTabsTrans(prev => tabsCheckedSet(prev));
                }
                form.setFieldsValue(normalizeFormData(PDF));
                setTimeout(() => setIsLoading(false), 500);
            }, 1000);
        }
    };

    const handleFinish = async (data) => {
        setTimeout(async () => {
            console.log(data);
            if (PRODMODE) {
                try {
                    const requestData = collectRequestData(data);
                    const formData = new FormData();
                    formData.append('_token', CSRF_TOKEN);
                    formData.append('data', JSON.stringify(requestData));
                    collectFiles(formData, data);
                    let response = await PROD_AXIOS_INSTANCE.post(`${ROUTE_PREFIX}/sales/pdf/${isCreatePdf ? 'create' : 'save'}/${bidId}`, formData);
                    if (isCreatePdf && response.data?.file_link) {
                        window.open(`${HTTP_HOST}${response.data?.file_link}`, '_blank');
                    }
                } catch (e) {
                    console.log(e);
                }
            }
        }, 0);
    };

    const updateIsNeedEngineer = async () => {
        if (PRODMODE) {
            const path = `${ROUTE_PREFIX}/v2/sales/pdf/engineer/${bidId}`;
            try {
                let response = await PROD_AXIOS_INSTANCE.post(path, {
                    data: {
                        isNeedEngineer,
                    },
                    _token: CSRF_TOKEN,
                });
            } catch (e) {
                console.log(e);
            }
        }
    };

    const collectRequestData = (data) => {
        const commonSavedPaths = collectSavedFilePaths(data, ['structuralDiagrams', 'blockPlacements']);
        const acousticSavedPaths = collectSavedFilePaths(data, [
            'placementOfAcousticSystems_placementOfAcousticSystems_file',
            'placementOfAcousticSystems_lineArrayConfiguration_file',
            'calculatingReverberationTime_reverberationTime_file',
            'calculatingDirectSpl_levelDistributionMap_file',
            'calculatingDirectSpl_levelDistributionChart_file',
            'calculatingCoefficientSti_levelDistributionMap_file',
            'calculatingCoefficientSti_levelDistributionChart_file',
            'calculatingAlcons_levelDistributionMap_file',
            'calculatingAlcons_levelDistributionChart_file',
        ]);

        return {
            bidSubtype,
            currency,
            tabs: bidSubtype ? tabsProf : tabsTrans,
            tel : data?.tel,
            email: data?.email,
            features: data?.features,
            recommendations: data?.recommendations,
            ...commonSavedPaths,
            ...acousticSavedPaths,
            selectionOfEquipment: !bidSubtype ? data?.selectionOfEquipment : null,
            acousticCalculation: !bidSubtype ? null : {
                acousticCalculation_intro: data?.acousticCalculation_intro,

                placementOfAcousticSystems_placementOfAcousticSystems_name: data?.placementOfAcousticSystems_placementOfAcousticSystems_name,
                placementOfAcousticSystems_lineArrayConfiguration_name: data?.placementOfAcousticSystems_lineArrayConfiguration_name,
                placementOfAcousticSystems_description: data?.placementOfAcousticSystems_description,

                calculatingReverberationTime_reverberationTime_name: data?.calculatingReverberationTime_reverberationTime_name,
                calculatingReverberationTime_description: data?.calculatingReverberationTime_description,

                calculatingDirectSpl_levelDistributionMap_name: data?.calculatingDirectSpl_levelDistributionMap_name,
                calculatingDirectSpl_levelDistributionChart_name: data?.calculatingDirectSpl_levelDistributionChart_name,
                calculatingDirectSpl_description: data?.calculatingDirectSpl_description,

                calculatingTotalSpl_description: data?.calculatingTotalSpl_description,

                calculatingCoefficientSti_levelDistributionMap_name: data?.calculatingCoefficientSti_levelDistributionMap_name,
                calculatingCoefficientSti_levelDistributionChart_name: data?.calculatingCoefficientSti_levelDistributionChart_name,
                calculatingCoefficientSti_description: data?.calculatingCoefficientSti_description,

                calculatingAlcons_levelDistributionMap_name: data?.calculatingAlcons_levelDistributionMap_name,
                calculatingAlcons_levelDistributionChart_name: data?.calculatingAlcons_levelDistributionChart_name,
                calculatingAlcons_description: data?.calculatingAlcons_description,

                conclusion: data?.conclusion,
                conclusion_recommendations: data?.conclusion_recommendations,
            },
        };
    };
    const collectFiles = (formData, data) => {
        if (bidSubtype) {
            if (data?.placementOfAcousticSystems_placementOfAcousticSystems_file && data?.placementOfAcousticSystems_placementOfAcousticSystems_file.length > 0) {
                data?.placementOfAcousticSystems_placementOfAcousticSystems_file.forEach((uploadFile) => {
                    if (uploadFile.originFileObj) {
                        formData.append('placementOfAcousticSystems_placementOfAcousticSystems_file[]', uploadFile.originFileObj);
                    }
                });
            }
            if (data?.placementOfAcousticSystems_lineArrayConfiguration_file && data?.placementOfAcousticSystems_lineArrayConfiguration_file.length > 0) {
                data?.placementOfAcousticSystems_lineArrayConfiguration_file.forEach((uploadFile) => {
                    if (uploadFile.originFileObj) {
                        formData.append('placementOfAcousticSystems_lineArrayConfiguration_file[]', uploadFile.originFileObj);
                    }
                });
            }
            if (data?.calculatingReverberationTime_reverberationTime_file && data?.calculatingReverberationTime_reverberationTime_file.length > 0) {
                data?.calculatingReverberationTime_reverberationTime_file.forEach((uploadFile) => {
                    if (uploadFile.originFileObj) {
                        formData.append('calculatingReverberationTime_reverberationTime_file[]', uploadFile.originFileObj);
                    }
                });
            }
            if (data?.calculatingDirectSpl_levelDistributionMap_file && data?.calculatingDirectSpl_levelDistributionMap_file.length > 0) {
                data?.calculatingDirectSpl_levelDistributionMap_file.forEach((uploadFile) => {
                    if (uploadFile.originFileObj) {
                        formData.append('calculatingDirectSpl_levelDistributionMap_file[]', uploadFile.originFileObj);
                    }
                });
            }
            if (data?.calculatingDirectSpl_levelDistributionChart_file && data?.calculatingDirectSpl_levelDistributionChart_file.length > 0) {
                data?.calculatingDirectSpl_levelDistributionChart_file.forEach((uploadFile) => {
                    if (uploadFile.originFileObj) {
                        formData.append('calculatingDirectSpl_levelDistributionChart_file[]', uploadFile.originFileObj);
                    }
                });
            }
            if (data?.calculatingCoefficientSti_levelDistributionMap_file && data?.calculatingCoefficientSti_levelDistributionMap_file.length > 0) {
                data?.calculatingCoefficientSti_levelDistributionMap_file.forEach((uploadFile) => {
                    if (uploadFile.originFileObj) {
                        formData.append('calculatingCoefficientSti_levelDistributionMap_file[]', uploadFile.originFileObj);
                    }
                });
            }
            if (data?.calculatingCoefficientSti_levelDistributionChart_file && data?.calculatingCoefficientSti_levelDistributionChart_file.length > 0) {
                data?.calculatingCoefficientSti_levelDistributionChart_file.forEach((uploadFile) => {
                    if (uploadFile.originFileObj) {
                        formData.append('calculatingCoefficientSti_levelDistributionChart_file[]', uploadFile.originFileObj);
                    }
                });
            }
            if (data?.calculatingAlcons_levelDistributionMap_file && data?.calculatingAlcons_levelDistributionMap_file.length > 0) {
                data?.calculatingAlcons_levelDistributionMap_file.forEach((uploadFile) => {
                    if (uploadFile.originFileObj) {
                        formData.append('calculatingAlcons_levelDistributionMap_file[]', uploadFile.originFileObj);
                    }
                });
            }
            if (data?.calculatingAlcons_levelDistributionChart_file && data?.calculatingAlcons_levelDistributionChart_file.length > 0) {
                data?.calculatingAlcons_levelDistributionChart_file.forEach((uploadFile) => {
                    if (uploadFile.originFileObj) {
                        formData.append('calculatingAlcons_levelDistributionChart_file[]', uploadFile.originFileObj);
                    }
                });
            }
        } else {
            if (data?.structuralDiagrams && data?.structuralDiagrams.length > 0) {
                data?.structuralDiagrams.forEach((uploadFile) => {
                    if (uploadFile.originFileObj) {
                        formData.append('structuralDiagrams[]', uploadFile.originFileObj);
                    }
                });
            }
            if (data?.blockPlacements && data?.blockPlacements.length > 0) {
                data?.blockPlacements.forEach((uploadFile) => {
                    if (uploadFile.originFileObj) {
                        formData.append('blockPlacements[]', uploadFile.originFileObj);
                    }
                });
            }
        }
    };
    const handleCurrencyChange = (e) => {
        const selectedValue = e.target.value;
        const selectedOption = currencyOptions.find(opt => opt.value === selectedValue);
        setCurrency(selectedOption || { label: '$', value: 1 });
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
    const tabsCheckedSet = (prev, response) => {
        if (PRODMODE) {
            return prev.map((item) => {
                const tabIdx = response.data.tabs.findIndex(tab => +tab.value === +item.value);
                if (tabIdx !== -1) {
                    return {
                        ...item,
                        checked: response.data.tabs[tabIdx].checked,
                    };
                }
                return item;
            });
        } else {
            return prev.map((item) => {
                const tabIdx = PDF.tabs.findIndex(tab => +tab.value === +item.value);
                if (tabIdx !== -1) {
                    return {
                        ...item,
                        checked: PDF.tabs[tabIdx].checked,
                    };
                }
                return item;
            });
        }
    };

    const openCustomModal = (type, title, text, filling, buttons) => {
        setCustomModalType(type);
        setCustomModalTitle(title);
        setCustomModalText(text);
        setCustomModalFilling(filling);
        setCustomModalButtons(buttons);
        setTimeout(() => setIsOpenCustomModal(true), 200);
    };
    const customClick = (button_id) => {
        if (+button_id === 2) {
            updateIsNeedEngineer().then();
        } else {
            setIsNeedEngineer(false);
        }
        setIsOpenCustomModal(false);
    };

    useEffect(() => {
        fetchBidModels().then();
    }, []);

    useEffect(() => {
        const departmentId = userdata?.user?.id_departament ?? userdata?.user?.id_dapartament;
        setIsEngineer([7, 8, 20].includes(departmentId));
    }, [userdata]);

    useEffect(() => {
        const shortBidType = +bidType === 2 ? 'Счет' : 'КП';
        if (bidId) {
            document.title = `${shortBidType} PDF | ${bidId}`;
            return;
        }
        document.title = 'КП PDF';
    }, [bidId, bidType]);

    useEffect(() => {
        if (form) {
            fetchBidPdfInfo().then();
        }
    }, [form]);

    const filteredTabs = React.useMemo(() => {
        const activeTabKeys = (bidSubtype ? tabsProf : tabsTrans)
            .filter(tab => tab.checked && tab.value !== '6')
            .map(tab => Number(tab.value));
        return tabs.filter(tab => tab.key === 1 || activeTabKeys.includes(tab.key));
    }, [bidSubtype, tabsProf, tabsTrans, isFieldsDisabled]);
    const bidTypeLabel = +bidType === 2 ? 'Счет' : 'Коммерческое предложение';
    const backPath = isEngineer ? '/bids' : `/bids/${bidId}`;

    return (
        <Spin spinning={isLoading}>
            <Layout className={'sa-layout sa-w-100'}>
                <Content>
                    <div className={'bid-pdf-page'}>
                        <div className={'sa-bid-pdf-header'}>
                            <Button
                                icon={<ArrowLeftOutlined />}
                                onClick={() => navigate(backPath)}
                            >
                                Назад
                            </Button>
                            <h1 className={'sa-bid-pdf-title'}>
                                {bidTypeLabel}
                                <Tag className={'sa-bid-pdf-title-tag'}>№{bidId}</Tag>
                            </h1>
                        </div>
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
                                        disabled={isFieldsDisabled}
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
                            top: '12px',
                            zIndex: 1
                        }}
                >
                    <div className={'sa-bid-pdf-sider'}>
                        <h3>Настройки</h3>
                        <Switch
                            checkedChildren="Профессиональный звук"
                            unCheckedChildren="Трансляционный звук"
                            checked={bidSubtype}
                            onChange={(_) => setBidSubtype((prev) => !prev)}
                            disabled={isFieldsDisabled}
                        />
                        <Radio.Group
                            block
                            options={currencyOptions}
                            value={currency.value}
                            onChange={handleCurrencyChange}
                            optionType="button"
                            buttonStyle="solid"
                            disabled={isFieldsDisabled}
                        />
                        {bidSubtype ? tabsProf.map(tab => {
                            return (
                                <Checkbox key={`checkbox-prof-${tab.value}`}
                                          onChange={(e) => setCheckboxChecked(tab, e.target.checked)}
                                          checked={tab.checked}
                                          disabled={isFieldsDisabled}
                                >
                                    {tab.label}
                                </Checkbox>
                            );
                        }) : tabsTrans.map(tab => {
                            return (
                                <Checkbox key={`checkbox-trans-${tab.value}`}
                                          onChange={(e) => setCheckboxChecked(tab, e.target.checked)}
                                          checked={tab.checked}
                                          disabled={isFieldsDisabled}
                                >
                                    {tab.label}
                                </Checkbox>
                            );
                        })}
                        { isEngineer ? (
                            <Switch  checkedChildren="Инженер работает"
                                     unCheckedChildren="Работа завершена"
                                     checked={isNeedEngineer}
                                     onChange={(_) => {
                                         setIsNeedEngineer((prev) => !prev);
                                         openCustomModal(
                                             'updateIsNeedEngineer',
                                             'Закончить работу инженера.',
                                             'После завершения работы инженера, у Вас не будет возможности изменять настройки PDF-документа для этой заявки. Продолжить?',
                                             [],
                                             isNeedEngineerButtons
                                         );
                                     }}
                                     loading={!isNeedEngineer}
                            />
                            ) : (
                                <Switch  checkedChildren="Инженер работает"
                                         unCheckedChildren="Призвать инженера"
                                         checked={isNeedEngineer}
                                         onChange={(_) => {
                                             setIsNeedEngineer((prev) => !prev);
                                             openCustomModal(
                                                 'updateIsNeedEngineer',
                                                 'Привлечь инженера.',
                                                 'После передачи задачи инженеру, у Вас не будет возможности изменять настройки PDF-документа для этой заявки. Продолжить?',
                                                 [],
                                                 isNeedEngineerButtons
                                             );
                                         }}
                                         loading={isNeedEngineer}
                                />
                            )
                        }
                    </div>
                </Sider>
            </Layout>
            <CustomModal
                customClick={customClick}
                customType={customModalType}
                customText={customModalText}
                customTitle={customModalTitle}
                customFilling={customModalFilling}
                customButtons={customModalButtons}
                open={isOpenCustomModal}
            />
        </Spin>
    );
};

export default BidPdfPage;
