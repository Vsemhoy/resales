import React, { useEffect, useState } from 'react';
import { PROD_AXIOS_INSTANCE } from '../../../../config/Api';
import { CSRF_TOKEN, PRODMODE } from '../../../../config/config';
import dayjs from 'dayjs';
import { Button, Empty, Pagination, Spin } from 'antd';
import { ANTD_PAGINATION_LOCALE } from '../../../../config/Localization';
import CallTabSectionTorg from '../sections/CallTabSectionTorg';
import { PlusOutlined } from '@ant-design/icons';
import { MODAL_CALLS_LIST } from '../../../ORG_LIST/components/mock/MODALCALLSTABMOCK';

const TabCallsTorg = (props) => {
    const [refreshMark, setRefreshMark] = useState(null);
  const [userdata, setUserData] = useState(null);
  /**
   * Как только таб становится активным и у нас установлено orgId, мы загружаем в него данные один раз
   */
  const [isTabActive, setIsTabActive] = useState(false);
  const [editMode, setEditMode] = useState(false); // true|false - режим редактирования
    /**
   * При сбросе orgId мы перегружаем данные
   */
  const [orgId, setOrgId] = useState(null);
  const [selects, setSelects] = useState(null);  // Данные для селектов

  /**
   * Массив с основными объектами, которые внутри можно изменять
   */
  const [baseData, setBaseData] = useState([]);
  /**
   * Массив с оригиналами объкектов, которые не меняются и используются для сравнения
   */
  const [originalData, setOriginalData] = useState([]);
  /**
   * Массив с временными, новыми объектами, которые добавляются, меняются, удаляются, но очищаются при смене орг-ИД
   */
  const [tempData, setTempData] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [onPage, setOnPage] = useState(50);
  const [total, setTotal] = useState(1);

  const [loading, setLoading] = useState(false);
  const [newLoading, setNewLoading] = useState(false);
  
  
    const [departaments, setDepartaments] = useState([]);
    const [orgContacts, setOrgContacts] = useState([]);


  
  // ██    ██ ███████ ███████ 
  // ██    ██ ██      ██      
  // ██    ██ █████   █████   
  // ██    ██ ██      ██      
  //  ██████  ██      ██      
  // UseEffects

  useEffect(() => {
    setUserData(props.userdata)
  }, [props.userdata]);


  // Сброс временных при входе в режим редактирования
  useEffect(() => {
    setEditMode(props.edit_mode);
    // Режим редактирования управляется снаружи
    // Но при отсутствии ID, устанавливает false, чтобы
    // юзер ничего не менял в форме
    if (!props.edit_mode){
      setTempData([]);
    }
  }, [props.edit_mode]);


  useEffect(() => {
    setRefreshMark(props.refresh_mark);
  }, [props.refresh_mark]);


  // Перегрузка данных при смене айдишника
  useEffect(() => {
    if (orgId){
      const timer = setTimeout(() => {
        get_org_calls_action();
      }, 1000);
    return () => clearTimeout(timer);
    };
  }, [orgId, currentPage, onPage]);


  useEffect(() => {
    if (!orgId){
      setTempData([]);
    }
  }, [orgId]);

  useEffect(() => {
    if (props.selects){
      setSelects(props.selects);
    }
  }, [props.selects]);


  useEffect(() => {
    setDepartaments(props.departaments)
  }, [props.departaments]);

  /**
   * Смена или сброс на ноль/нулл org_id приводит к перегрузке формы + загрузке данных с сервака/очистке временных массивов
   */
  useEffect(() => {
    setOrgId(props.org_id);
    if (props.org_id){
      if (PRODMODE){
        get_org_calls_action(props.org_id);
      } else {
        let arr = [];
        if (MODAL_CALLS_LIST?.calls.length){
          for (let i = 0; i < MODAL_CALLS_LIST?.calls.length; i++) {
            const element = MODAL_CALLS_LIST?.calls[i];
            element._type = "call";
            arr.push(element);
          }
        };
        if (MODAL_CALLS_LIST?.meetings.length){
          for (let i = 0; i < MODAL_CALLS_LIST?.meetings.length; i++) {
            const element = MODAL_CALLS_LIST?.meetings[i];
            element._type = "meeting";
            arr.push(element);
          }
        };
        setBaseData(arr.sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf()));
      }
    }
  }, [props.org_id]);



  // useEffect(() => {
  //   if (props.on_save_command && props.on_save_command > 0){
  //     if (props.on_change_data){
  //       props.on_change_data({tab: 'projects', section: 'main', data: {}});
  //     }
  //   }
  // }, [props.on_save_command]);

  
  useEffect(() => {
    if (props.selects){
      setSelects(props.selects);
    }
  }, [props.selects]);  

  useEffect(() => {
    setIsTabActive(props.active_tab);
  }, [props.active_tab]);


  useEffect(() => {
    if (props.main_data?.contacts){
      setOrgContacts(props.main_data.contacts);
    } else {
      setOrgContacts([]);
    }

  }, [props.main_data]);

  // ██    ██ ███████ ███████       ██   ██ 
  // ██    ██ ██      ██             ██ ██  
  // ██    ██ █████   █████   █████   ███   
  // ██    ██ ██      ██             ██ ██  
  //  ██████  ██      ██            ██   ██ 

    // ------------------------------------------------------------------- //

  // ███████ ███████ ████████  ██████ ██   ██ 
  // ██      ██         ██    ██      ██   ██ 
  // █████   █████      ██    ██      ███████ 
  // ██      ██         ██    ██      ██   ██ 
  // ██      ███████    ██     ██████ ██   ██ 


  const get_org_calls_action = async (id) => {
    if (!id){return;}
    if (PRODMODE){
      setLoading(true);
      try {
        let response = await PROD_AXIOS_INSTANCE.post('/api/sales/v2/orglist/' + id + '/c', {
          data: {
            page: currentPage,
            limit: onPage,
          },
          _token: CSRF_TOKEN,
        });
        if (response.data) {
  
          let arr = [];
          if (response.data.content?.calls.length){
            for (let i = 0; i < response.data.content?.calls.length; i++) {
              const element = response.data.content?.calls[i];
              element._type = "call";
              arr.push(element);
            }
          };
          if (response.data.content?.meetings.length){
            for (let i = 0; i < response.data.content?.meetings.length; i++) {
              const element = response.data.content?.meetings[i];
              element._type = "meeting";
              arr.push(element);
            }
          };
          setBaseData(arr.sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf()));
          setTotal(response.data.total);
          // setBaseData(response.data.content.calls);
          setLoading(false);
  
        }
      } catch (e) {
        console.log(e);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    } else {
      setBaseData(MODAL_CALLS_LIST.calls.concat(MODAL_CALLS_LIST.meetings));
      setLoading(false);
    }

  };


  // ███████ ███████ ████████  ██████ ██   ██       ██   ██ 
  // ██      ██         ██    ██      ██   ██        ██ ██  
  // █████   █████      ██    ██      ███████ █████   ███   
  // ██      ██         ██    ██      ██   ██        ██ ██  
  // ██      ███████    ██     ██████ ██   ██       ██   ██ 

  // ------------------------------------------------------------------- //


const MAKE_BLANK = (type) => {
     setNewLoading(true);
          // console.log('ADDED NEW DDDDDDDDDD')
          setTimeout(() => {
            let spawn = {
                    _type: type,
                    command: 'create',
                    id: 'new_' + dayjs().unix() + dayjs().millisecond() + tempData.length,
                    id_orgs: orgId,
                    id8staff_list: userdata?.user.id,
                    id8ref_departaments: 5,
                    theme: '',
                    date: dayjs().format('YYYY-MM-DD HH:mm:ss'), //"2016-09-04T21:00:00.000000Z",
                    post: '',
                    phone: '',
                    note: '',
                    result: '',
                    subscriber: '',
                    deleted: 0,
                    creator: {
                      id: userdata?.user.id,
                      surname: userdata?.user.surname,
                      name: userdata?.user.name,
                      secondname: userdata?.user.secondname,
                    },
                    departament: {
                      id: 5,
                      name: 'Отдел оптовых продаж',
                      rang: 50,
                      visible: true,
                      deleted: false,
                      position: null,
                      icon: null,
                    },
                  };
      
                setTempData(prevItems => [spawn, ...prevItems]);
                // console.log(spawn);
              }, 460);
              setNewLoading(false);
  }

  const handleDeleteNewItem = (id) => {
        setNewLoading(true);
    setTempData(tempData.filter((item)=> item.id !== id));
    if (props.on_delete_section){
      props.on_delete_section('notes', id);
    };
          setTimeout(() => {
        setNewLoading(false);
      }, 500);
  };




  return (
    <div className={`${isTabActive ? '' : 'sa-orgpage-tab-hidder'}`}>
       <Spin spinning={loading}>
					<div className={'sa-orgtab-container'}>
						<div className={'sa-pa-6 sa-flex-space'} style={{ paddingTop: '9px' }}>
							<div>
								<Pagination
									disabled={editMode}
									size={'small'}
									current={currentPage}
									pageSizeOptions={[50, 100]}
									defaultPageSize={onPage}
									locale={ANTD_PAGINATION_LOCALE}
									showQuickJumper
									total={total}
									onChange={(ev, on) => {
										if (ev !== currentPage) {
											setCurrentPage(ev);
										}
										if (on !== onPage) {
											setOnPage(on);
										}
										// get_org_data_action(orgId, ev, on);
									}}
								/>
							</div>
							<div className={'sa-flex'}>
								{editMode && (
									<Button
										type={'primary'}
										icon={<PlusOutlined />}
										onClick={()=>{MAKE_BLANK('call')}}
										disabled={tempData.length > 7 || newLoading}
									>
										Cоздать звонок
									</Button>
								)}
                {editMode && (
									<Button
										type={'primary'}
										icon={<PlusOutlined />}
										onClick={()=>{MAKE_BLANK('meeting')}}
										disabled={tempData.length > 7 || newLoading}
									>
										Cоздать встречу
									</Button>
								)}
							</div>
						</div>
            <div className={'sa-orgpage-tab-container'}>
            <Spin spinning={newLoading}>
              {tempData && tempData.length > 0 && (
                <div className='sa-org-temp-stack-collapse'>
                  <div className={'sa-org-temp-stack-collapse-header'}>Новые события</div>
                  {tempData.map((item)=>(
                    <CallTabSectionTorg
                      edit_mode={editMode}
                      collapsed={false}
                      org_id={orgId}
                      data={item}
                      key={ "cotonatas_n_" +  item.id }
                      on_delete={handleDeleteNewItem}
                      // on_change={props.on_change_section}
                      allow_delete={true}
                      selects={selects}

                      org_contacts={orgContacts}
                      user_data={userdata}
                      on_collect={(payload)=>{props.on_change_section('calls', payload.id, payload)}}
                      departaments={departaments}
                      />
                  ))}
                </div>
              )}</Spin>
              {baseData && baseData.length > 0 && (
                
                <div className='sa-org-stack-collapse'>
                  
                  {baseData.map((item)=>(
                    <CallTabSectionTorg
                      edit_mode={editMode}
                      org_id={orgId}
                      data={item}
                      collapsed={true}
                      key={ "comatonatas_" +  item.id }
                      // on_change={props.on_change_section}
                      // on_delete={handleDeleteNewItem}
                      on_collect={(payload)=>{props.on_change_section('calls', payload.id, payload)}}
                      selects={selects}
                      org_contacts={orgContacts}
                      user_data={userdata}
                      departaments={departaments}
                      />
                  ))}
                </div>
              )}
              {baseData.length === 0 && tempData.length === 0 && (
                <Empty />
              )}
            </div>
					</div>
				</Spin>
    </div>
  );
};

export default TabCallsTorg;