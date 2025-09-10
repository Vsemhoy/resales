import React, { useEffect, useState } from 'react';
import { ANTD_PAGINATION_LOCALE } from '../../../config/Localization';
import { Button, Collapse, Pagination, Spin } from 'antd';
import OrgNoteModalRow from '../../ORG_LIST/components/OrgModal/Tabs/TabComponents/RowTemplates/OrgNoteModalRow';
import dayjs from 'dayjs';
import { getMonthName } from '../../../components/helpers/TextHelpers';
import { PlusCircleFilled, PlusOutlined } from '@ant-design/icons';
import OrgNoteEditorSectionBox from '../components/sections/NotesTabSections/Rows/OrgNoteEditorSectionBox';


const NotesTabPage = (props) => {
    const {userdata} = props;

    const [orgId, setOrgId] = useState(null);
    const [show, setShow] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(1);
    const [onPage, setOnPage] = useState(30);
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    
    const [newLoading, setNewLoading] = useState(false);

    // Структурированные в коллапсы юниты
    const [structureItems, setStructureItems] = useState([]);
    const [originalData, setOriginalData] = useState([]);
    const [baseData, setBaseData] = useState([]);

    // Новые юниты
    const [temporaryUnits, setTemporaryUnits] = useState([]);
    const [newStructureItems, setNewStructureItems] = useState([]);

    const [editedItemsIds, setEditedItemsIds] = useState([]);
    const [openedNewSections, setOpenedNewSections] = useState([]);
  
    useEffect(() => {
      setShow(props.show);
    }, [props.show]);

    useEffect(() => {
      setCurrentPage(props.current_page);
    }, [props.current_page]);

    useEffect(() => {
        if (props.item_id){
          setOrgId(props.item_id);
        }
    }, [props.item_id]);


    useEffect(() => {
      if (props.current_page && props.current_page !== currentPage)
        setCurrentPage(props.current_page);
    }, [props.current_page]);


    useEffect(() => {
      
      if (props.edit_mode === false){
        if (editedItemsIds.length > 0 || newStructureItems.length > 0){
          if (window.confirm("У вас есть несохраненные заметки! Отменить изменения?")){
            setEditMode(props.edit_mode);
            setTemporaryUnits([]);
            setBaseData([]);
            // setBaseData(originalData);
            console.log(originalData);
          } else {
            // alert('Нажмите кнопку [Редактировать] и заново сохраните данные');
            if (props.on_break_discard){
              props.on_break_discard();
            }
          }
        } else {
          setEditMode(props.edit_mode);
        }

      } else {
        setEditMode(props.edit_mode);
      }
    }, [props.edit_mode]);





      useEffect(() => {
      if (props.base_data?.notes !== null && props.base_data?.notes?.length > 0){
        let secids = [];
        // setDataList(baseOrgData.projects);
        let strdata = baseData.map((item)=>{
            secids.push('norprow_' + item.id);
            return {
                key: 'norprow_' + item.id,
                label: <div className={`sa-flex-space ${item.deleted === 1 && editMode ? "sa-orgrow-deleted" : ""}`}>
                  <div>{item.theme}
                    <span className='sa-date-text'>{item?.date ? " - " + getMonthName(dayjs(item.date).month() + 1) + " " + dayjs(item.date).format("YYYY"): ""}</span>  <span className={'sa-text-phantom'}>({item.id})</span></div>
                    {editMode && (
                    <>
                    { item.deleted === 1 ? (
                      <Button size='small'
                         color="danger" variant="filled"
                        onClick={(ev)=>{
                          ev.stopPropagation();
                          console.log(item.id);
                          handleDeleteRealUnit(item.id, 0);
                        }}
                      >ВЕРНУТЬ</Button>
                    ) : (
                      <Button size='small' 
                      color="danger" variant="outlined"
                      onClick={(ev)=>{
                        ev.stopPropagation();
                        console.log(item.id);
                        handleDeleteRealUnit(item.id, 1);
                      }}
                    >Удалить</Button>
                    )}
                    </>)}
                    </div>,
                children: <OrgNoteEditorSectionBox
                  color={null}
                  data={item}
                  on_delete={handleDeleteRealUnit}
                  on_change={handleUpdateRealUnit}
                  edit_mode={editMode}
                  // selects_data={props.selects_data}
                />
            }
          });

          
          setStructureItems(strdata);
      } else {
        
        setStructureItems([]);
      }
      setLoading(false);
    }, [baseData, editMode]);


    useEffect(() => {
      console.log('original' , baseData, originalData);
      console.log("BASE SETTER NNN");
      setOriginalData(props.base_data?.notes ? props.base_data.notes : []);
      setBaseData(props.base_data?.notes ? JSON.parse(JSON.stringify(props.base_data.notes)) : []);
    }, [props.base_data]);

    useEffect(() => {
      console.log("ORIGINAL DATA", originalData);
      console.log("BASE DATA",  baseData);
    }, [originalData, baseData]);


    useEffect(() => {
      let secids = [];
      setNewStructureItems(temporaryUnits.map((item)=>{
        console.log(item);
        let nkey = 'new_norprow_' + item.id;
        secids.push(nkey);
            return {
                key: nkey,
                label: <div className='sa-flex-space'>
                  <div>{item.theme ? item.theme : "..."}
                    <span className='sa-date-text'>{item?.date ? " - " + getMonthName(dayjs(item.date).month() + 1) + " " + dayjs(item.date).format("YYYY"): ""}</span>  <span className={'sa-text-phantom'}>({item.id})</span></div>
                    <Button size='small' 
                      onClick={(ev)=>{
                        ev.stopPropagation();
                        console.log(item.id);
                        handleDeleteBlankUnit(item.id);
                      }}
                    >Удалить</Button>
                    </div>,
                children: <OrgNoteEditorSectionBox
                  color={'#2196F3'}
                  data={item}
                  on_delete={handleDeleteBlankUnit}
                  on_change={handleUpdateBlankUnit}
                  on_blur={handleUpdateBlankUnit}
                  edit_mode={editMode}
                  // selects_data={props.selects_data}
                />
            }
          })
        );
        // secids.reverse();
        console.log(secids);
        if (JSON.stringify(openedNewSections) !== JSON.stringify(secids)){
          setOpenedNewSections(secids);
        }
        setNewLoading(false);
    }, [temporaryUnits, editMode]);





    const get_org_data_action = (org_id, ev, on) => {
      if (props.on_change_page && ev !== currentPage){
        props.on_change_page(ev);
      };
    }


    const handleAddUnitBlank = () => {
      setNewLoading(true);
      console.log('ADDED NEW DDDDDDDDDD')
      setTimeout(() => {
        let spawn = {
              "command": "create",
              "id": 'new_' + dayjs().unix() + dayjs().millisecond() + temporaryUnits.length,
              "id_orgs": props.item_id,
              "id8staff_list": userdata.user.id,
              "theme": "",
              "date": dayjs().format('YYYY-MM-DD HH:mm:ss'), //"2016-09-04T21:00:00.000000Z",
              "notes": "",
              "deleted": 0,
              "creator": {
                  "id": userdata.user.id,
                  "surname": userdata?.user.surname,
                  "name": userdata?.user.name,
                  "secondname": userdata?.user.secondname,
              }
            };
  
            setTemporaryUnits(prevItems => [spawn, ...prevItems]);
            console.log(spawn);
        
      }, 760);
    }


    const handleDeleteBlankUnit = (id) => {
      setTemporaryUnits(temporaryUnits.filter((item) => item.id !== id));
    }


    const handleDeleteRealUnit = (id, value) => {
      // const updata = {command: 'delete', id: id, deleted: 1};
      if (!editedItemsIds.includes(id)){
        setEditedItemsIds([...editedItemsIds, id]);
      };
      // const uitem = baseData.find((item)=> item.id === id);
      // if (uitem){
      //   uitem.deleted = value;
      //   uitem.command =  value === 1 ? 'delete' : 'update';
      //   let udata = originalData.filter((item) => item.id !== id);
      //   udata.push(uitem);
      //   setBaseData(udata);
      // };
      setBaseData(prevData => {
        // Удаляем элемент
        const filtered = prevData.filter(item => item.id !== id);
        
        // Находим элемент для обновления
        const uitem = prevData.find(item => item.id === id);
        if (uitem) {
          // Создаем обновленную версию
          const updatedItem = {
            ...uitem,
            deleted: value,
            command: value === 1 ? 'delete' : 'update'
          };
          
          // Находим индекс оригинального элемента
          const originalIndex = prevData.findIndex(item => item.id === id);
          
          // Вставляем на ту же позицию
          const newData = [...filtered];
          newData.splice(originalIndex, 0, updatedItem);
          
          return newData;
        }
        
        return filtered;
      });
    }


    const handleUpdateBlankUnit = (id, data) => {
      console.log('id, data', id, data, temporaryUnits);
      setTemporaryUnits(prevUnits => {
        const exists = prevUnits.some(item => item.id === id);
        
        if (!exists) {
          // Добавляем новый элемент
          return [...prevUnits, data];
        } else {
          // Обновляем существующий
          return prevUnits.map(item => 
            item.id === id ? data : item
          );
        }
      });
    }
    

    const handleUpdateRealUnit = (id, data) => {
      // let udata = originalData.filter((item) => item.id !== id);
      // udata.push(data);
      if (!editedItemsIds?.includes(id)){
        setEditedItemsIds([...editedItemsIds, id]);
      };
      console.log(data);
      data.command = 'update';
      setBaseData(
        prevUnits => {
          const exists = prevUnits.some(item => item.id === id);
          if (!exists) {
            return[...prevUnits, data];
          } else {
            return prevUnits.map(item => 
              item.id === id ? data : item
            );
          }
        }
      );
    }


    useEffect(() => {
      console.log(baseData);
    }, [baseData]);


    // если в call_to_save не null, а timestamp, отправляем данные на обновление
    useEffect(() => {
      console.log('basedata', baseData, temporaryUnits);
      if (props.call_to_save !== null && props.on_save !== null){
        props.on_save(baseData, temporaryUnits);
      }
    }, [props.call_to_save]);



  return (
    <div>
      {show && (

         <Spin spinning={loading}>
            <div className={'sa-orgtab-container'}>
                <div className={'sa-pa-6 sa-flex-space'} style={{paddingTop: '9px'}}>
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
                      onChange={(ev, on)=>{
                        if (ev !== currentPage){
                          setCurrentPage(ev);
                        };
                        if (on !== onPage){
                          setOnPage(on);
                        };
                        get_org_data_action(orgId, ev, on);
                      }}
                    />
                    </div>
                    <div>
                      {editMode && (
                        <Button type={'primary'} 
                          icon={<PlusOutlined/>} 
                          onClick={handleAddUnitBlank}
                          disabled={newStructureItems.length > 7 || newLoading}
                        >
                          Cоздать заметку
                        </Button>
                      )}
                    </div>
                </div>
                <div>
                {newStructureItems.length > 0 && (
                  <div className={'sa-org-temp-stack-collapse'}>
                    <div className={'sa-org-temp-stack-collapse-header'}>Новые заметки</div>
                    <Spin spinning={newLoading} delay={500}>
                    <Collapse 
                    size={'small'}
                    items={newStructureItems}
                      activeKey={openedNewSections}
                    /></Spin>
                   </div>

                )}

                <Collapse
                    // defaultActiveKey={['st_commoninfo', 'st_departinfo', 'st_contactinfo']}
                    // activeKey={modalSectionsOpened}
                    size={'small'}
                    // onChange={handleSectionChange}
                    // onMouseDown={handleSectionClick}
                    items={structureItems} />
                    

                </div>
            </div>
            </Spin>
      )}
    </div>
  );
};

export default NotesTabPage;