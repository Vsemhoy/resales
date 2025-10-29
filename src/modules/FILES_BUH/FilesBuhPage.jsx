import CurrencyMonitorBar from "../../components/template/CURRENCYMONITOR/CurrencyMonitorBar";
import {
    Affix,
    Alert,
    Button,
    Dropdown,
    Input, Layout,
    message,
    Modal,
    Pagination,
    Select,
    Space, Spin,
    Tag,
    Tooltip,
    Upload
} from "antd";
import {CaretLeftFilled, CloseOutlined, FilterOutlined, UploadOutlined} from "@ant-design/icons";
import React, {useEffect, useState} from "react";
import {CSRF_TOKEN, PRODMODE} from "../../config/config";
import {PROD_AXIOS_INSTANCE} from "../../config/Api";
import TextArea from "antd/es/input/TextArea";
import Sider from "antd/es/layout/Sider";
import EngineerListSiderFilters from "../ENGINEER_LIST/components/EngineerListSiderFilters";
import {Content} from "antd/es/layout/layout";
import {NavLink} from "react-router-dom";
import {ANTD_PAGINATION_LOCALE} from "../../config/Localization";
import EngineerListTable from "../ENGINEER_LIST/components/EngineerListTable";
import OrderListSider from "../ENGINEER_LIST/components/OrderListSider";
import NewOrderModal from "../ENGINEER_LIST/components/NewOrderModal";

const FilesBuhPage = (props) => {
    const {userdata} = props;
    const [userInfo, setUserInfo] = useState(null);
    const [activeRole, setActiveRole] = useState(0);
    const [baseUserDataCompanies, setUserDataCompanies] = useState([]);
    const [isOneRole, setIsOneRole] = useState(true);
    const [roles, setRoles] = useState([
        {
            value: 1,
            label: 'Менеджер',
            acl: 89,
        },
        {
            value: 2,
            label: 'Администратор',
            acl: 90,
        },
        {
            value: 3,
            label: 'Бухгалтер',
            acl: 91,
        },
    ]);

    const [isAlertVisible, setIsAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertDescription, setAlertDescription] = useState('');
    const [alertType, setAlertType] = useState('');

    const [fileList, setFileList] = useState([]);
    const [problemFiles, setProblemFiles] = useState([]);
    const [noProblemFiles, setNoProblemFiles] = useState([]);


    useEffect(() => {
        if (userdata !== null && userdata.companies && userdata.companies.length > 0) {
            setUserDataCompanies(userdata.companies);
        }
        if (userdata !== null && userdata.acls) {
            // 89 - менеджер
            // 91 - администратор
            // 90 - бухгалтер
            const found = userdata.acls.filter((num) => [89, 90, 91].includes(num));
            if (found) {
                console.log('found', found.length);
                setIsOneRole(found.length === 1);
            }
        }
        if (userdata !== null && userdata.user && userdata.user.sales_role) {
            setUserInfo(userdata.user);
            setActiveRole(userdata.user.sales_role);
        }
    }, [userdata]);

    const fetchChangeRole = async (sales_role) => {
        if (PRODMODE) {
            const path = `/auth/me`;
            try {
                let response = await PROD_AXIOS_INSTANCE.post(path, {
                    place: sales_role,
                    _token: CSRF_TOKEN,
                });
                console.log('response', response);
                if (response.data) {
                    if (props.changed_user_data) {
                        props.changed_user_data(response.data);
                    }
                }
            } catch (e) {
                console.log(e);
                setIsAlertVisible(true);
                setAlertMessage(`Произошла ошибка! ${path}`);
                setAlertDescription(e.response?.data?.message || e.message || 'Неизвестная ошибка');
                setAlertType('error');
            }
        } else {
            userdata.user.sales_role = sales_role;
            props.changed_user_data(userdata);
        }
    };

    const fetchStartScript = async () => {
        if (PRODMODE) {
            const path = `/api/cron/savebidsfiles`;
            try {
                let response = await PROD_AXIOS_INSTANCE.get(path);
                if (response.data.count === 0) {
                    setIsAlertVisible(true);
                    setAlertMessage(`Предупреждение!`);
                    setAlertDescription('Нет файлов на обработку!');
                    setAlertType('warning');
                } else {
                    const { problemFiles, noProblemFiles } = response.data.content.messages.reduce((acc, item) => {
                        if (item.status === 1) {
                            acc.noProblemFiles.push(item);
                        } else {
                            acc.problemFiles.push(item);
                        }
                        return acc;
                    }, { problemFiles: [], noProblemFiles: [] });

                    setProblemFiles(problemFiles);
                    setNoProblemFiles(noProblemFiles);

                }
            } catch (e) {
                console.log(e);
                setIsAlertVisible(true);
                setAlertMessage(`Произошла ошибка! ${path}`);
                setAlertDescription(e.response?.data?.message || e.message || 'Неизвестная ошибка');
                setAlertType('error');
            }

        } else {
            setIsAlertVisible(true);
            setAlertMessage(`Успех`);
            setAlertDescription('Скрипт успешно завершил обработку');
            setAlertType('success');
        }
    }

    const handleUploadChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

    const handleRemoveFile = (file) => {
        setFileList(fileList.filter(f => f.uid !== file.uid));
    };


    return (
        <div className={`app-page sa-app-page`}>
            <Affix>
                <div style={{padding: '0', backgroundColor: '#b4c9e1'}}>
                    <div className={'sa-control-panel sa-flex-space sa-pa-12 sa-list-header'}>
                        <div className={'sa-header-label-container'}>
                            <div className={'sa-header-label-container-small'}>
                                <h1 className={'sa-header-label'}>Файлы</h1>
                                <div>
                                    <CurrencyMonitorBar/>
                                </div>
                            </div>
                            <div className={'sa-header-label-container-small'}>
                                <div className={'sa-vertical-flex'}>
                                    <Button onClick={fetchStartScript}> Запустить скрипт обработки </Button>
                                </div>
                                <div style={{display: 'flex', alignItems: 'end'}}>
                                    {activeRole > 0 && (
                                        <div>
                                            {isOneRole ? (
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '5px',
                                                        justifyContent: 'end',
                                                    }}
                                                >
                                                    Роль:
                                                    <Tag
                                                        className={`
                                    sa-tag-custom
                                    ${activeRole === 1 ? 'sa-select-custom-manager' : ''}
                                    ${activeRole === 2 ? 'sa-select-custom-admin' : ''}
                                    ${activeRole === 3 ? 'sa-select-custom-bugh' : ''}
                                  `}
                                                    >
                                                        {roles.find((role) => role.value === activeRole)?.label ||
                                                            'Неизвестная роль'}
                                                    </Tag>
                                                </div>
                                            ) : (
                                                <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                                                    Роль:
                                                    <Select
                                                        className={`
                                        ${activeRole === 1 ? 'sa-select-custom-manager' : ''}
                                        ${activeRole === 2 ? 'sa-select-custom-admin' : ''}
                                        ${activeRole === 3 ? 'sa-select-custom-bugh' : ''}
                                      `}
                                                        style={{width: '150px', marginRight: '8px'}}
                                                        options={roles.filter((role) => userdata.acls.includes(role.acl))}
                                                        value={activeRole}
                                                        onChange={fetchChangeRole}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Affix>

            <Layout className={'sa-layout sa-w-100'}>
                <div style={{display: 'flex', gap: '20px', alignItems: 'flex-start'}}>
                    <Content style={{flex: 1, backgroundColor: '#ffffff'}}>

                        <Upload
                            multiple
                            beforeUpload={(file) => {
                                const isAllowed = file.type.includes('image/') ||
                                    file.type.includes('application/') ||
                                    file.type.includes('text/');
                                if (!isAllowed) {
                                    message.error('Вы можете загружать только документы и изображения');
                                }
                                return false;
                            }}
                            onChange={handleUploadChange}
                            fileList={fileList}
                            onRemove={handleRemoveFile}
                        >
                            <Button icon={<UploadOutlined/>}>Загрузить файлы</Button>
                        </Upload>
                    </Content>

                    <Content style={{width: '300px', flexShrink: 0}}>
                        <h1> Файлы, которые успешно загрузились: </h1>
                        {noProblemFiles.map((index) => (
                            <div key={index.id}>
                                {index.id}
                            </div>
                        ))}

                        <h1> Файлы, с которыми есть проблемы: </h1>
                        {problemFiles.map((index) => (
                            <div key={index.id}>
                                {index.id}
                            </div>
                        ))}
                    </Content>
                </div>
            </Layout>

            {isAlertVisible && (
                <Alert
                    message={alertMessage}
                    description={alertDescription}
                    type={alertType}
                    showIcon
                    closable
                    style={{
                        position: 'fixed',
                        top: 20,
                        right: 20,
                        zIndex: 9999,
                        width: 350,
                    }}
                    onClose={() => setIsAlertVisible(false)}
                />
            )}
        </div>
    );
}

export default FilesBuhPage