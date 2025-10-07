import React, { useEffect, useState } from 'react';
import { PROD_AXIOS_INSTANCE } from '../../../../config/Api';
import { CSRF_TOKEN, PRODMODE } from '../../../../config/config';
import { MODAL_NOTES_LIST } from '../../../ORG_LIST/components/mock/MODALNOTESTABMOCK';
import NoteTabSectionTorg from '../sections/NoteTabSectionTorg';
import dayjs from 'dayjs';
import { Button, Pagination, Spin } from 'antd';
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
  const [onPage, setOnPage] = useState(20);
  const [total, setTotal] = useState(1);
  const [loading, setLoading] = useState(false);
  const [newLoading, setNewLoading] = useState(false);

  const [openedSections, setOpenedSections] = useState([]);

  const [userdata, setUserData] = useState(null);



  // ██    ██ ███████ ███████ 
  // ██    ██ ██      ██      
  // ██    ██ █████   █████   
  // ██    ██ ██      ██      
  //  ██████  ██      ██      
  // UseEffects
  useEffect(() => {
    setEditMode(props.edit_mode);
    if (!props.edit_mode){
      setTempData([]);
    }
  }, [props.edit_mode]);

  useEffect(() => {
    setUserData(props.userdata)
  }, [props.userdata]);

  /**
   * Смена или сброс на ноль/нулл org_id приводит к перегрузке формы + загрузке данных с сервака/очистке временных массивов
   */
  useEffect(() => {
    setOrgId(props.org_id);
  }, [props.org_id]);



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
        let response = await PROD_AXIOS_INSTANCE.post('/api/sales/v2/orglist/' + orgId + '/n', {
          data: {
            page: currentPage,
            limit: onPage,
          },
          _token: CSRF_TOKEN,
        });
        console.log('response', response);
        if (response.data && response.data.content) {
          setOriginalData(JSON.parse(JSON.stringify(response.data.content.notes)));
          setBaseData(response.data.content.notes);
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


  const reload_all_data = () => {
    if (!orgId){ return; };
    // Flush temporary data
    setTempData([]);
    // Load main data
    
  }

  const MAKE_BLANK = () => {
     setNewLoading(true);
          // console.log('ADDED NEW DDDDDDDDDD')
          setTimeout(() => {
            let spawn = {
                  "command": "create",
                  "id": 'new_' + dayjs().unix() + dayjs().millisecond() + tempData.length,
                  "id_orgs": props.item_id,
                  "id8staff_list": userdata.user.id,
                  "theme": "",
                  "date": dayjs().format('YYYY-MM-DD HH:mm:ss'), //"2016-09-04T21:00:00.000000Z",
                  "note": "",
                  "deleted": 0,
                  "next_call_date" : null,
                  "creator": {
                      "id": userdata.user.id,
                      "surname": userdata?.user.surname,
                      "name": userdata?.user.name,
                      "secondname": userdata?.user.secondname,
                  }
                };
      
                setTempData(prevItems => [spawn, ...prevItems]);
                // console.log(spawn);
                setNewLoading(false);
          }, 760);
          
  }


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
									pageSizeOptions={[10, 30, 50, 100]}
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
              {tempData && tempData.length > 0 && (
                <div className='sa-org-temp-stack-collapse'>
                  <div className={'sa-org-temp-stack-collapse-header'}>Новые заметки</div>
                  {tempData.map((item)=>(
                    <NoteTabSectionTorg
                      edit_mode={editMode}
                      org_id={orgId}
                      data={item}
                      key={ "nototas_" +  item.id }

                      />
                  ))}
                </div>
              )}
            </div>
					</div>
				</Spin>



    </div>
  );
};

export default TabNotesTorg;