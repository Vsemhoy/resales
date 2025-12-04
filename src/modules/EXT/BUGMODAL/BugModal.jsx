import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './components/style/bugmodal.css';
import { Modal, Tabs, Table, Select, Button, Form, Input, Space, Tag } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { CSRF_TOKEN, PRODMODE } from '../../../config/config';
import { PROD_AXIOS_INSTANCE } from '../../../config/Api';
import { BUMMODALMOCK } from './components/BUMODALMOCK';
const { TabPane } = Tabs;
const { TextArea } = Input;

function BugModal(props) {
	const [visible, setVisible] = useState(false);
	const [bugReports, setBugReports] = useState([]);
	// const [loading, setLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(30);
	const [totalCount, setTotalCount] = useState();
	const [sortBy, setSortBy] = useState(''); // column name to sort by
	const [order, setOrder] = useState('ascending'); // ascending or descending
	const [filterName, setFilterName] = useState(null); // filter value for the username column
	const formRef = React.useRef();

	const [form] = Form.useForm();
	const [mform] = Form.useForm();



// Компонент для отображения статуса с бейджем
const StatusBadge = ( status ) => {
  const statusConfig = {
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


	const onFinish = (values) => {
		console.log('Сабмит формы, данные:', values);
		// values будет: { textField: "то, что ввёл пользователь" }
		// Делай что хочешь: отправляй на бэк, валидируй и т.д.
	};

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

  
    const writeReportAction = async (data) => {
      try {
        const format_data = {
          content: data,
          _token: CSRF_TOKEN,
        };
        let response = await PROD_AXIOS_INSTANCE.post('/api/sales/bugs/report', format_data);
        if (response) {
          
        }
      } catch (e) {
        console.log(e);

      }
      
    };




  const getReportsAction = async () => {
      try {
        const format_data = {
          page: currentPage,
          pagesize: pageSize,
          filters: {
            user_id: 1,
            status: 1,
            text: null
          },
          _token: CSRF_TOKEN,
        };
        let response = await PROD_AXIOS_INSTANCE.post('/api/sales/bugs/getreports', format_data);
        if (response) {
          setBugReports(response.data.conten);
        }
      } catch (e) {
        console.log(e);

      }
      
    };


  const statuses = [
    {
      id: 1,
      username: '',
      user_id: 243,
      content: "Много больших багов валялись на дороге и сидели на трубе",
      created_at: "2023-12-13",
      status: 1 // from 1 to 4

    }
  ]



	const onFinishSingle = (ee) => {
		writeReportAction([ee]);
    form.resetFields();
	};



  const onFinishMulti = (ee) => {
    writeReportAction(ee.bugs);
    mform.resetFields();
  }

	return (
		<div className="sa-bug-modal">
			<Modal
				title="Bug Reports"
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
					<TabPane tab="Bug Reports" key="1">
						{/* Search input for username column */}
						<div className="sa-bug-page-container-body">
              <div className={'sa-flex-space'}>
                <div>
                  <Input

                  placeholder='Фильтр по тексту' />
                </div>
                <div>
                  
                  <Button 

                  >Мои заявки</Button>
                </div>
              </div>
							<div>
								{/* Table with bug reports */}
								<Table
									style={{ background: '#bbbbbb' }}
									loading={false /* loading */}
									dataSource={bugReports}
									rowKey="id"
                                  scroll={{
                  y: 'calc(100vh - 450px)'
                }}
									// pagination={{
									// 	pageSize: pageSize, // number of items per page
									// 	current: currentPage, // initial page to display
									// 	onChange: (page) => setCurrentPage(page), // update current page when user changes it
									// 	total: totalCount || 0, // total count from server
									// }}
									onChange={handleTableChange} // handle sorting and filtering events
								>
									<Table.Column title="Created At" dataIndex="created_at" />
									<Table.Column title="Username" dataIndex="username" />
									<Table.Column title="Content" dataIndex="content" />
									{/* Custom column to show bug status */}
									<Table.Column
										title="Status"
										render={(text, record) => (
											<span>{StatusBadge(record.status)}</span>
										)}
									/>
								</Table>
							</div>
							<div>
								<Form
									form={form}
									onFinish={onFinishSingle}
									layout="vertical"
									style={{ width: '100%' }}
								>
									<div className={'sa-flex-space'}>
										<Form.Item
											name="content"
											rules={[{ required: true, message: 'Поле обязательно' }]}
											style={{ width: '100%' }}
										>
											<TextArea
												autoSize={{ minRows: 2, maxRows: 6 }}
												placeholder="Введите описание бага..."
											/>
										</Form.Item>
										<Form.Item>
											<Button htmlType="submit" ghost color={'default'} title="Отправить на сервер">
												<PaperAirplaneIcon height={'32px'} />
											</Button>
										</Form.Item>
									</div>
								</Form>
							</div>
						</div>
					</TabPane>

					{/* Form for adding a new bug report */}
					<TabPane tab="New Bug Report" key="2">
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

          </TabPane>
				</Tabs>
			</Modal>
		</div>
	);
}

export default BugModal;
