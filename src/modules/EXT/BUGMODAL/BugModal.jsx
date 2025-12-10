import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import './components/style/bugmodal.css';
import { Modal, Tabs, Table, Select, Button, Form, Input, Space, Tag, Tooltip, DatePicker, Pagination, Empty } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { CSRF_TOKEN, PRODMODE } from '../../../config/config';
import { PROD_AXIOS_INSTANCE } from '../../../config/Api';
import { BUGMODALMOCK } from './components/BUGMODALMOCK';
import { countBy, forIn } from 'lodash';
import { ANTD_PAGINATION_LOCALE } from '../../../config/Localization';
import dayjs from 'dayjs';
import HighlightText from '../../../components/helpers/HighlightText';
import HighlightTextBreaker from '../../../components/helpers/HighlightTextBreaker';
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

  const [STARTMARK, setSTARTMARK] = useState(0);

  const [filterCreated,  setFilterCreated] = useState([null, null]);
  const [filterFinish,   setFilterFinish] = useState([null, null]);
  const [filterUserName, setFilterUserName] = useState(null);
  const [filterText,     setFilterText] = useState(null);
  const [filterStatus,   setFilterStatus] = useState(1);
  const [filterUserId,   setFilterUserId] = useState([]);

  const [bugMultiCounter, setBugMultiCounter] = useState([0,0,0,0]);

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
      text: "Новая заявка",
      color: "default", // серый
      className: "status-created"
    },
    2: {
      text: "Принята в работу",
      color: "processing", // синий (в Ant Design желтый - 'gold', но processing лучше выглядит)
      className: "status-in-progress"
    },
    3: {
      text: "Решено",
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
    setBugReports(BUGMODALMOCK);
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
      console.log('data', data)
      try {
        const format_data = {
          data: {content: data},
          _token: CSRF_TOKEN,
        };
        let response = await PROD_AXIOS_INSTANCE.post('/api/sales/bugs/report', format_data);
        if (response) {
          getReportsAction();
          let nv = bugMultiCounter;
          nv[0] += data.length;
          setBugMultiCounter(nv);
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
        status: filterStatus ? filterStatus : null
      };

        const format_data = {
          data: {
          page: currentPage,
          pagesize: onPage,
          filters: obj,
          },
          _token: CSRF_TOKEN
          ,
        };
        let response = await PROD_AXIOS_INSTANCE.post('/api/sales/bugs/getreports', format_data);
        if (response) {
          setBugReports(response.data.content?.page);
          setTotal(response.data.total);
          if (STARTMARK < 1){
            setBugMultiCounter([response.data.total, 0,0,0]);
            setSTARTMARK(STARTMARK + 1);
          }
          scrollToTop();
        }
      } catch (e) {
        console.log(e);
      }
    };



    // useEffect(() => {
    //   if (STARTMARK < 2){
    //     if (bugReports && bugReports.length > 0){
    //       let conter = [0,0,0,0];
    //       for (let i = 0; i < bugReports.length; i++) {
    //         const element = bugReports[i];
    //         if (element.status_id === 1) {
    //           conter[0]++;
    //         } else if (element.status_id === 2){
    //           conter[1]++;
    //         } else if (element.status_id === 3){
    //           conter[2]++;
    //         } else if (element.status_id === 4){
    //           conter[3]++;
    //         };
    //       }
    //       setBugMultiCounter(conter);
    //     }

    //     setSTARTMARK(STARTMARK + 1);
    //   }
    // }, [bugReports]);


    useEffect(() => {
          if (props.on_set_counts !== null){
            props.on_set_counts(bugMultiCounter);
          }
    }, [bugMultiCounter]);


	const onFinishSingle = (ee) => {
    if (ee.content){
      writeReportAction([ee]);
      form.resetFields();
    }
	};



  const onFinishMulti = (ee) => {
    let filtered = [];
    
    writeReportAction(ee.bugs.filter((item)=> item.content.trim() !== ""));
    mform.resetFields();
  }


  const scrollRef = useRef(null);

  const scrollToTop = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };


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
                    height: '27px',
										lineHeight: '22px',
										textAlign: 'center',
										fontSize: '14px',
									}}
									color="geekblue"
								>
									Всего найдено: {total ? total : '0'}
								</Tag>
                </div>
                <div style={{gridGap: '6px', display: 'flex',}}>

                <Button 
                  color="default" 
                  variant={
                    filterCreated[0] && filterCreated[1] && 
                    dayjs(filterCreated[0]).isSame(dayjs(), 'day') && 
                    dayjs(filterCreated[1]).isSame(dayjs().add(1,'day'), 'day') 
                    ? 'solid' : 'filled'
                  }
                  onClick={() => {
                    if (filterCreated[0] === null && filterCreated[1] === null) {
                      // Пусто -> установить сегодня
                      setFilterCreated([dayjs(), dayjs().add(1,'day')]);
                    } else if (
                      filterCreated[0] && filterCreated[1] && 
                      dayjs(filterCreated[0]).isSame(dayjs(), 'day') && 
                      dayjs(filterCreated[1]).isSame(dayjs().add(1,'day'), 'day')
                    ) {
                      // Уже сегодня -> очистить
                      setFilterCreated([null, null]);
                    } else {
                      // Другое значение -> установить сегодня
                      setFilterCreated([dayjs(), dayjs().add(1,'day')]);
                    }
                  }}
                >
                  Сегодня
                </Button>
                
                <Button 
                  color="default" 
                  variant={
                    filterCreated[0] && filterCreated[1] && 
                    dayjs(filterCreated[0]).isSame(dayjs().startOf('week').add(1,'day'), 'day') && 
                    dayjs(filterCreated[1]).isSame(dayjs().endOf('week').add(1,'day'), 'day') 
                    ? 'solid' : 'filled'
                  }
                  onClick={() => {
                    const startWeek = dayjs().startOf('week').add(1,'day');
                    const endWeek = dayjs().endOf('week').add(1,'day');
                    
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
                        <DatePicker.RangePicker
                          value={filterCreated}
                          onChange={setFilterCreated}
                          allowClear
                        />
                    </div>
                  </div>
                  <div className={'sa-bug-table-cell'}>
                    <div>
                        <Input 
                          value={filterUserName || ''}
                          onChange={(e) => setFilterUserName(e.target.value || null)}
                          placeholder="Имя пользователя"
                          allowClear
                        />
                    </div>
                  </div>
                  <div className={'sa-bug-table-cell'}>
                    <div>
                        <Input 
                          value={filterText || ''}
                          onChange={(e) => setFilterText(e.target.value || null)}
                          placeholder="Текст заявки"
                          allowClear
                        />
                    </div>
                  </div>
                  <div className={'sa-bug-table-cell'}>
                    <div>
                        <Select 
                          value={filterStatus}
                          onChange={setFilterStatus}
                        
                          style={{width: '100%'}}
                          placeholder="Все статусы"
                          options={getStatusConfig().map((opt, index) => ({
                            value: index,  // или opt.id если добавите в statusConfig
                            label: opt.text,
                          }))}
                        />
                    </div>
                  </div>
                  <div className={'sa-bug-table-cell'}>
                    <div>
                        <DatePicker.RangePicker
                          value={filterFinish}
                          onChange={setFilterFinish}
                          allowClear
                        />
                    </div>
                    </div>
                  </div>
              </div>
              <div className={'sa-bug-table-body-wrap'} ref={scrollRef}>
							<div className={'sa-bug-table-body'}>
                {bugReports?.map((item)=>(
                  <div className={'sa-bug-table-row'} >
                    <div className={'sa-bug-table-cell'}>
                      <div>
                        {item.created_at && (
                          <div>
                            <div>{dayjs(item.created_at).format('DD.MM.YYYY')}</div> <div>{dayjs(item.created_at).format('HH:mm')}</div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={'sa-bug-table-cell'}>
                      <div>
                        <HighlightText text={item.username} highlight={filterUserName} /> 
                      </div>
                    </div>
                    <div className={'sa-bug-table-cell'}>
                      <div>
                      <HighlightTextBreaker text={item.content} highlight={filterText} 
                        breakLines={true}
                      /> 
                        
                      </div>
                    </div>
                    <div className={'sa-bug-table-cell'}>
                      <div>
                        <Tooltip title={item.comment}>

                        {StatusBadge(item.status_id)}
                        </Tooltip>
                      </div>
                    </div>
                    <div className={'sa-bug-table-cell'}>
                      <div>
                        {item.finished_at && (
                          <div>
                            <div>{dayjs(item.finished_at).format('DD.MM.YYYY')}</div> <div>{dayjs(item.finished_at).format('HH:mm')}</div>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                ))}
                {bugReports?.length === 0 ? (
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
                        {  message: 'Минимум 12 знаков в сообщении', min: 12 }
                      
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
                                rules={[{  message: 'Минимум 12 знаков в сообщении', min: 12 }]}
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
