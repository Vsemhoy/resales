import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './components/style/bugmodal.css';
import { Modal, Tabs, Table, Select, Button, Form, Input, Space, Tag, Tooltip, DatePicker, Pagination, Empty } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { CSRF_TOKEN, PRODMODE } from '../../../config/config';
import { PROD_AXIOS_INSTANCE } from '../../../config/Api';
import { BUMMODALMOCK } from './components/BUMODALMOCK';
import { forIn } from 'lodash';
import { ANTD_PAGINATION_LOCALE } from '../../../config/Localization';
import dayjs from 'dayjs';
import HighlightText from '../../../components/helpers/HighlightText';
const { TabPane } = Tabs;
const { TextArea } = Input;

function BugModal(props) {

  const [userdata, setUserdata] = useState(props.userdata);
	const [visible, setVisible] = useState(false);
	const [bugReports, setBugReports] = useState([]);
	// const [loading, setLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [onPage, setOnPage] = useState(30);
	const [total, setTotal] = useState();
	const [sortBy, setSortBy] = useState(''); // column name to sort by
	const [order, setOrder] = useState('ascending'); // ascending or descending
	const [filterName, setFilterName] = useState(null); // filter value for the username column
	const formRef = React.useRef();

	const [form] = Form.useForm();
	const [mform] = Form.useForm();


  const [filterCreated,  setFilterCreated] = useState([null, null]);
  const [filterFinish,   setFilterFinish] = useState([null, null]);
  const [filterUserName, setFilterUserName] = useState(null);
  const [filterText,     setFilterText] = useState(null);
  const [filterStatus,   setFilterStatus] = useState(null);
  const [filterUserId,   setFilterUserId] = useState([]);

  useEffect(() => {
    setUserdata(props.userdata);
  }, [props.userdata]);

const statusConfig = {
    0: {
      text: "Все",
      color: "default", // серый
      className: "status-created"
    },
    1: {
      text: "Создано",
      color: "default", // серый
      className: "status-created"
    },
    2: {
      text: "В работе",
      color: "processing", // синий (в Ant Design желтый - 'gold', но processing лучше выглядит)
      className: "status-in-progress"
    },
    3: {
      text: "Завершено",
      color: "success", // зеленый
      className: "status-completed"
    },
    4: {
      text: "Отклонено",
      color: "error", // красный
      className: "status-rejected"
    }
  };

const getStatusConfig = () => {
  return Object.values(statusConfig);
};

// Компонент для отображения статуса с бейджем
  const StatusBadge = ( status ) => {
  

  const config = statusConfig[status] || statusConfig[1];
  
  return (
    <Tag
      color={config.color}
      className={`status-badge ${config.className}`}
      style={{
        margin: 0,
        borderRadius: '12px',
        padding: '2px 8px',
        fontSize: '12px',
        fontWeight: 500
      }}
    >
      {config.text}
    </Tag>
  );
};


  useEffect(() => {
  const timer = setTimeout(() => {
      getReportsAction()
		}, 1000);

		// Очищаем таймер, если эффект пересоздаётся (чтобы не было утечек)
		return () => clearTimeout(timer);
  }, [
    filterCreated, 
    filterFinish,  
    filterUserName,
    filterText,    
    filterStatus,  
    filterUserId, 
    onPage,
    currentPage,
  ]);


	const handleTableChange = () => {};

	useEffect(() => {
		setVisible(props.visible);
	}, [props.visible]);


useEffect(() => {
  if (PRODMODE){
    getReportsAction();
  } else {
    setBugReports(BUMMODALMOCK);
  }

}, []);

useEffect(() => {
  if (PRODMODE && visible){
    getReportsAction();
  } else {
    // setBugReports(BUMMODALMOCK);
  }

}, [visible]);

  
    const writeReportAction = async (data) => {
      try {
        const format_data = {
          content: data,
          _token: CSRF_TOKEN,
        };
        let response = await PROD_AXIOS_INSTANCE.post('/api/sales/bugs/report', format_data);
        if (response) {
          getReportsAction();
        }
      } catch (e) {
        console.log(e);
      }
    };


  const getReportsAction = async () => {
      try {
			const obj = {
        content: filterText,
        username: filterUserName,
        created_at: filterCreated,
        finished_at: filterFinish,
        user_ids: filterUserId,
        status: filterStatus
      };

        const format_data = {
          page: currentPage,
          pagesize: onPage,
          filters: obj,
          _token: CSRF_TOKEN,
        };
        let response = await PROD_AXIOS_INSTANCE.post('/api/sales/bugs/getreports', format_data);
        if (response) {
          setBugReports(response.data.conten);
          setTotal(response.data.total);
        }
      } catch (e) {
        console.log(e);
      }
    };



	const onFinishSingle = (ee) => {
    if (ee.content){
      writeReportAction([ee]);
      form.resetFields();
    }
	};



  const onFinishMulti = (ee) => {
    writeReportAction(ee.bugs);
    mform.resetFields();
  }

	return (
		<div className="sa-bug-modal">
			<Modal
        modalRender={(modal) => (
          React.cloneElement(modal, {
            style: { 
              ...modal.props.style, 
              padding: 0 ,
              height: 'calc(100vh - 100px)',
              maxWidth: '1300px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }
          })
        )}
				title=""
				visible={visible}
				onCancel={() => props.onClose()} // call the parent's close function when user clicks Cancel button
				footer={null} // hide default modal footer buttons (Ok and Cancel)
				width={'100%'}
				className="sa-bug-modal-oda"
				centered
			>
				<Tabs
					defaultActiveKey="1"
					style={{ height: 'Calc(100vh - 300px)' }}
					className={'sa-bug-modal-tabs'}
				>
					{/* List of bug reports */}
					<TabPane tab={(<span style={{paddingLeft: '12px'}}>Список багов и обращений</span>)} key="1">
						{/* Search input for username column */}
						<div className="sa-bug-page-container-body">
              <div className={'sa-flex-space sa-pa-9'}>
                <div style={{gridGap: '6px', display: 'flex'}}>
                  <Pagination
										defaultPageSize={onPage}
										defaultCurrent={1}
										current={currentPage}
										total={total}
										onChange={setCurrentPage}
										showQuickJumper
										locale={ANTD_PAGINATION_LOCALE}
										size={'small' }
									/>
                  <Tag
                  size={'small'}
									style={{
					
										lineHeight: '22px',
										textAlign: 'center',
										fontSize: '14px',
									}}
									color="geekblue"
								>
									Всего найдено: {total ? total : '0'}
								</Tag>
                </div>
                <div style={{gridGap: '6px', display: 'flex'}}>

                <Button 
                  color="default" 
                  variant={
                    filterCreated[0] && filterCreated[1] && 
                    dayjs(filterCreated[0]).isSame(dayjs(), 'day') && 
                    dayjs(filterCreated[1]).isSame(dayjs(), 'day') 
                    ? 'solid' : 'filled'
                  }
                  onClick={() => {
                    if (filterCreated[0] === null && filterCreated[1] === null) {
                      // Пусто -> установить сегодня
                      setFilterCreated([dayjs(), dayjs()]);
                    } else if (
                      filterCreated[0] && filterCreated[1] && 
                      dayjs(filterCreated[0]).isSame(dayjs(), 'day') && 
                      dayjs(filterCreated[1]).isSame(dayjs(), 'day')
                    ) {
                      // Уже сегодня -> очистить
                      setFilterCreated([null, null]);
                    } else {
                      // Другое значение -> установить сегодня
                      setFilterCreated([dayjs(), dayjs()]);
                    }
                  }}
                >
                  Сегодня
                </Button>

                <Button 
                  color="default" 
                  variant={
                    filterCreated[0] && filterCreated[1] && 
                    dayjs(filterCreated[0]).isSame(dayjs().startOf('week'), 'day') && 
                    dayjs(filterCreated[1]).isSame(dayjs().endOf('week'), 'day') 
                    ? 'solid' : 'filled'
                  }
                  onClick={() => {
                    const startWeek = dayjs().startOf('week');
                    const endWeek = dayjs().endOf('week');
                    
                    if (filterCreated[0] === null && filterCreated[1] === null) {
                      setFilterCreated([startWeek, endWeek]);
                    } else if (
                      filterCreated[0] && filterCreated[1] && 
                      dayjs(filterCreated[0]).isSame(startWeek, 'day') && 
                      dayjs(filterCreated[1]).isSame(endWeek, 'day')
                    ) {
                      setFilterCreated([null, null]);
                    } else {
                      setFilterCreated([startWeek, endWeek]);
                    }
                  }}
                >
                  Эта неделя
                </Button>

                  <Button color="default" variant={filterUserId.length === 1 && filterUserId.includes(userdata?.user?.id) ? 'solid' : 'filled'}
                    onClick={()=>{
                      if (filterUserId.length === 0){
                        setFilterUserId([userdata?.user?.id]);
                      } else {
                        if (filterUserId.length === 1 && filterUserId.includes(userdata?.user?.id)){
                          setFilterUserId([]);
                        } else {
                          setFilterUserId([userdata?.user?.id]);
                        }
                      }
                    }}
                  >Мои заявки</Button>
                </div>
              </div>
              <div className={'sa-bug-table-head'}>
                <div className={'sa-bug-table-row'} >
                  <div className={'sa-bug-table-cell'}>
                    <div>
                      <Tooltip title={'Дата добавления'} placement={'bottom'}>
                        <DatePicker.RangePicker
                          value={filterCreated}
                          onChange={setFilterCreated}
                          allowClear
                        />
                      </Tooltip>
                    </div>
                  </div>
                  <div className={'sa-bug-table-cell'}>
                    <div>
                      <Tooltip title={'Имя'} placement={'bottom'}>
                        <Input 
                          value={filterUserName || ''}
                          onChange={(e) => setFilterUserName(e.target.value || null)}
                          placeholder="Имя пользователя"
                          allowClear
                        />
                      </Tooltip>
                    </div>
                  </div>
                  <div className={'sa-bug-table-cell'}>
                    <div>
                      <Tooltip title={'Текст заявки'} placement={'bottom'}>
                        <Input 
                          value={filterText || ''}
                          onChange={(e) => setFilterText(e.target.value || null)}
                          placeholder="Текст заявки"
                          allowClear
                        />
                      </Tooltip>
                    </div>
                  </div>
                  <div className={'sa-bug-table-cell'}>
                    <div>
                      <Tooltip title={'Статус'} placement={'bottom'}>
                        <Select 
                          value={filterStatus}
                          onChange={setFilterStatus}
                          allowClear
                          style={{width: '100%'}}
                          placeholder="Все статусы"
                          options={getStatusConfig().map((opt, index) => ({
                            value: index,  // или opt.id если добавите в statusConfig
                            label: opt.text,
                          }))}
                          allowClear
                        />
                      </Tooltip>
                    </div>
                  </div>
                  <div className={'sa-bug-table-cell'}>
                    <div>
                      <Tooltip title={'Дата выполнения/обработки/отклонения'} placement={'bottom'}>
                        <DatePicker.RangePicker
                          value={filterFinish}
                          onChange={setFilterFinish}
                          allowClear
                        />
                      </Tooltip>
                    </div>
                    </div>
                  </div>
              </div>
              <div className={'sa-bug-table-body-wrap'}>
							<div className={'sa-bug-table-body'}>
                {bugReports.map((item)=>(
                  <div className={'sa-bug-table-row'} >
                    <div className={'sa-bug-table-cell'}>
                      <div>
                        {item.created_at}
                      </div>
                    </div>
                    <div className={'sa-bug-table-cell'}>
                      <div>
                        <HighlightText text={item.username} highlight={filterUserName} /> 
                      </div>
                    </div>
                    <div className={'sa-bug-table-cell'}>
                      <div>
                      <HighlightText text={item.content} highlight={filterText} 
                        breakLines={true}
                      /> 
                        
                      </div>
                    </div>
                    <div className={'sa-bug-table-cell'}>
                      <div>
                        <Tooltip title={item.comment}>

                        {StatusBadge(item.status)}
                        </Tooltip>
                      </div>
                    </div>
                    <div className={'sa-bug-table-cell'}>
                      <div>
                        {item.finished_at}
                      </div>
                    </div>

                  </div>
                ))}
                {bugReports.length === 0 ? (
                  <Empty />
                ):('')}
              
								{/* Table with bug reports */}
                



							    </div>
                <div className={'sa-bug-table-footer'}>
								<Form
									form={form}
									onFinish={onFinishSingle}
									layout="vertical"
									style={{ width: '100%' }}
                  
								>
									<div className={'sa-flex-space'}>
                  <div style={{ width: '100%' }}>
										<Form.Item
											name="content"
											rules={[
                        // { required: true, message: 'Поле обязательно'},
                        {  message: 'Минимум 35 знаков в сообщении', min: 35 }
                      
                      ]}
											style={{ width: '100%' }}
										>
											<TextArea
												autoSize={{ minRows: 2, maxRows: 6 }}
												placeholder="Введите описание бага..."
											/>
										</Form.Item></div>
										<Form.Item>
											<Button htmlType="submit" ghost color={'default'} title="Отправить на сервер">
												<PaperAirplaneIcon height={'32px'} />
											</Button>
										</Form.Item>
									</div>
								</Form>
                </div>
                </div>
							<div>
							</div>
						</div>
					</TabPane>

					{/* Form for adding a new bug report */}
					<TabPane tab="Форма заявки" key="2">
                <div className='sa-pa-12'>
                  <Form
                  form={mform}
                    name="dynamic_form_nest_item"
                    onFinish={onFinishMulti}
                    style={{ width: '100%' }}
                    autoComplete="off"
                  >
                    <Form.List name="bugs">
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map(({ key, name, ...restField }) => (
                            <Space key={key} style={{ display: 'grid', marginBottom: 8, gridTemplateColumns: '1fr auto'  }} align="baseline">

                              

                              <Form.Item
                                name={[name, "content"]}
                                rules={[{ required: true, message: 'Поле обязательно' }]}
                                style={{ width: '100%' }}
                              >
                                <TextArea
                                  autoSize={{ minRows: 2, maxRows: 6 }}
                                  placeholder="Введите описание бага..."
                                />
                              </Form.Item>

                            
                              <MinusCircleOutlined
                                style={{fontSize: '28px', padding: '12px'}}
                              onClick={() => remove(name)} />
                            </Space>
                          ))}
                          <Form.Item>
                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                              Добавить поле
                            </Button>
                          </Form.Item>
                        </>
                      )}
                    </Form.List>
                    <Form.Item>
                      <Button type="primary" htmlType="submit">
                        Отправить <PaperAirplaneIcon height={'32px'} />
                      </Button> 
                    </Form.Item>
                  </Form>

                </div>

          </TabPane>
				</Tabs>
			</Modal>
		</div>
	);
}

export default BugModal;
