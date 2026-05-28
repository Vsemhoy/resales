import React, { useEffect, useState } from 'react';
import { PROD_AXIOS_INSTANCE } from '../../../../config/Api';
import {CSRF_TOKEN, PRODMODE, ROUTE_PREFIX} from '../../../../config/config';
import { MODAL_NOTES_LIST } from '../../../ORG_LIST/components/mock/MODALNOTESTABMOCK';
import NoteTabSectionTorg from '../sections/NoteTabSectionTorg';
import dayjs from 'dayjs';
import { Button, Empty, Pagination, Spin } from 'antd';
import { ANTD_PAGINATION_LOCALE } from '../../../../config/Localization';
import { PlusOutlined } from '@ant-design/icons';


const TabNotesTorg = (props) => {
  /**
   * Как только таб становится активным и у нас установлено orgId, мы загружаем в него данные один раз
   */
  const [isTabActive, setIsTabActive] = useState(false);
    /**
   * При сбросе orgId мы перегружаем данные
   */
  const [editMode, setEditMode] = useState(false); // true|false - режим редактирования
  /**
   * При сбросе orgId мы перегружаем данные
   */
  const [orgId, setOrgId] = useState(null);
  const [selects, setSelects] = useState(null); // Данные для селектов

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


  const [userdata, setUserData] = useState(null);



  // ██    ██ ███████ ███████ 
  // ██    ██ ██      ██      
  // ██    ██ █████   █████   
  // ██    ██ ██      ██      
  //  ██████  ██      ██      




  // Перегрузка данных при смене айдишника
  useEffect(() => {
    if (orgId){
      const timer = setTimeout(() => {
        get_notes_data_action();
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
    setUserData(props.userdata)
  }, [props.userdata]);

  /**
   * Смена или сброс на ноль/нулл org_id приводит к перегрузке формы + загрузке данных с сервака/очистке временных массивов
   */
  useEffect(() => {
    setOrgId(props.org_id);
  }, [props.org_id]);
  // Перегрузка данных при смене айдишника


  // Смена режима на редактировние - сброс временных
  useEffect(() => {
    setEditMode(props.edit_mode);
    if (!props.edit_mode){
      setTempData([]);
    }
  }, [props.edit_mode]);

  // Сигнал от TorgPage: восстановить данные из лога
  // Сигнал восстановления из лога
  useEffect(() => {
    if (!props.pending_restore?.length) return;

    const isNew = (item) => String(item?.id ?? '').startsWith('new_');

    // Новые записи (new_xxx) → в tempData (секция "только что добавленных")
    const newItems = props.pending_restore.filter(isNew);
    if (newItems.length) setTempData(newItems);

    // Существующие отредактированные (числовые ID) → мёрджим в baseData
    const updatedItems = props.pending_restore.filter(item => !isNew(item));
    if (updatedItems.length) {
      setBaseData(prev => prev.map(item => {
        const restored = updatedItems.find(u => String(u.id) === String(item.id));
        return restored ? { ...item, ...restored } : item;
      }));
    }

    props.on_pending_restore_done?.();
  }, [props.pending_restore]);

  useEffect(() => {
    if (props.on_save_command && props.on_save_command > 0){
      if (props.on_change_data){
        props.on_change_data({tab: 'projects', section: 'main', data: {}});
      }
    }
  }, [props.on_save_command]);

  
  useEffect(() => {
    if (props.selects){
      setSelects(props.selects);
    }
  }, [props.selects]);

  useEffect(() => {
    setIsTabActive(props.active_tab);
    if (props.active_tab && editMode){
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [props.active_tab]);




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

  const get_notes_data_action = async () => {
    if (PRODMODE){
      try {
        let response = await PROD_AXIOS_INSTANCE.post(`${ROUTE_PREFIX}/sales/v2/orglist/` + orgId + '/n', {
          data: {
            page: currentPage,
            limit: onPage,
          },
          _token: CSRF_TOKEN,
        });
        if (response.data && response.data.content) {
          setOriginalData(JSON.parse(JSON.stringify(response.data.content.notes)));
          setBaseData(response.data.content.notes);
          setLoading(false);
          setTotal(response.data.total);
        }
      } catch (e) {
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    } else {
      setOriginalData(JSON.parse(JSON.stringify(MODAL_NOTES_LIST.notes)));
      setBaseData(MODAL_NOTES_LIST.notes);
    }

  };

  // ███████ ███████ ████████  ██████ ██   ██       ██   ██ 
  // ██      ██         ██    ██      ██   ██        ██ ██  
  // █████   █████      ██    ██      ███████ █████   ███   
  // ██      ██         ██    ██      ██   ██        ██ ██  
  // ██      ███████    ██     ██████ ██   ██       ██   ██ 

  // ------------------------------------------------------------------- //



  const MAKE_BLANK = () => {
     setNewLoading(true);
          setTimeout(() => {
            let spawn = {
                  "command": "create",
                  "id": 'new_' + dayjs().unix() + dayjs().millisecond() + tempData.length,
                  "id_orgs": props.org_id,
                  "id8staff_list": userdata.user.id,
                  "theme": "",
                  "date": dayjs().format('YYYY-MM-DD HH:mm:ss'), //"2016-09-04T21:00:00.000000Z",
                  "note": "",
                  "deleted": 0,
                  "creator": {
                      "id": userdata.user.id,
                      "surname": userdata?.user.surname,
                      "name": userdata?.user.name,
                      "secondname": userdata?.user.secondname,
                  }
                };
      
                setTempData(prevItems => [spawn, ...prevItems]);
                setNewLoading(false);
          }, 460);
  }

  const handleDeleteNewItem = (id) => {
    setTempData(tempData.filter((item)=> item.id !== id));
    if (props.on_delete_section){
      props.on_delete_section('notes', id);
    };
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
							<div>
								{editMode && (
									<Button
										type={'primary'}
										icon={<PlusOutlined />}
										onClick={MAKE_BLANK}
										disabled={tempData.length > 7 || newLoading}
									>
										Cоздать заметку
									</Button>
								)}
							</div>
						</div>
            <div className={'sa-orgpage-tab-container'}>
            <Spin spinning={newLoading}>
              {tempData && tempData.length > 0 && (
                <div className='sa-org-temp-stack-collapse'>
                  <div className={'sa-org-temp-stack-collapse-header'}>Новые заметки</div>
                  {tempData.map((item)=>(
                    <NoteTabSectionTorg
                      edit_mode={editMode}
                      collapsed={false}
                      org_id={orgId}
                      data={item}
                      key={ "no5totas_n_" +  item.id }
                      on_delete={handleDeleteNewItem}
                      on_change={props.on_change_section}
                      allow_delete={true}
                      selects={selects}
                      user_data={userdata}
                      // on_collect={(payload)=>{if (payload){ props.on_change_section('notes', payload)}}}
                      />
                  ))}
                </div>
              )}</Spin>
              {baseData && baseData.length > 0 && (
                <div className='sa-org-stack-collapse'>
                  
                  {baseData.map((item)=>(
                    <NoteTabSectionTorg
                      edit_mode={editMode && (userdata?.user?.id === item.id8staff_list  || userdata?.user?.id === item?.creator?.id)}
                      org_id={orgId}
                      data={item}
                      collapsed={true}
                      key={ "noto5tas_" +  item.id }
                      on_change={props.on_change_section}
                      // on_delete={handleDeleteNewItem}
                      // on_collect={(payload)=>{if (payload){props.on_change_section('notes', payload)}}}
                      selects={selects}
                      user_data={userdata}
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

export default TabNotesTorg;