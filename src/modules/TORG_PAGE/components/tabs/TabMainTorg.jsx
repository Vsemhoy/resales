import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { FlushOrgData } from '../handlers/OrgPageDataHandler';

const TabMainTorg = (props) => {
   const [refreshMark, setRefreshMark] = useState(null);
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

  const [loading, setLoading] = useState(false);

  /**
   * Оперативные массивы - сюда загружаются все массивы и здесь же они модифицируются
   */
  const [CONTACTS,     setCONTACTS]     = useState([]);
  /**
   * Здесь хранятся как полученные с сервера, так и измененные и добавленные объекты
   * При отправке наверх, данные фильтруются по полю !action
   */
  const [REQUISITES,   setREQUISITES]   = useState([]);
  const [BOLICENSES,   setBOLICENSES]   = useState([]);
  const [ANLICENSES,   setANLICENSES]   = useState([]);
  const [ANTOLERANCES, setANTOLERANCES] = useState([]);

  const [ORGADDRESSES, setORGADDRESSES] = useState([]);
  const [ORGPHONES,    setORGPHONES]    = useState([]);
  const [ORGEMAILS,    setORGEMAILS]    = useState([]);


  // ██    ██ ███████ ███████ 
  // ██    ██ ██      ██      
  // ██    ██ █████   █████   
  // ██    ██ ██      ██      
  //  ██████  ██      ██      
  // UseEffects
  useEffect(() => {
    setEditMode(props.editMode);
  }, [props.editMode]);

  useEffect(() => {
    setEditMode(props.editMode);
  }, [props.editMode]);

  /**
   * Смена или сброс на ноль/нулл org_id приводит к перегрузке формы + загрузке данных с сервака/очистке временных массивов
   */
  useEffect(() => {
    setOrgId(props.org_id);
  }, [props.org_id]);

  useEffect(() => {
    if (props.selects){
      setSelects(props.selects);
    }
  }, [props.selects]);  



  useEffect(() => {
    if (props.on_save_command && props.on_save_command > 0){
      if (props.on_change_data){
        props.on_change_data({tab: 'projects', section: 'main', data: {}});
      }
    }
  }, [props.on_save_command]);

  useEffect(() => {
    setIsTabActive(props.active_tab);
  }, [props.active_tab]);


  useEffect(() => {

    setBaseData(props.base_data);
    // console.log('BASE_DATA ++++++++++++++++++++++',props.base_data);
    if (props.base_data?.contacts){
      setCONTACTS(JSON.parse(JSON.stringify(props.base_data?.contacts)));
    } else { setCONTACTS([])};
    if (props.base_data?.active_licenses_bo){
      setBOLICENSES(JSON.parse(JSON.stringify(props.base_data?.active_licenses_bo)));
    } else {setBOLICENSES([])};
    if (props.base_data?.active_tolerance){
      setANTOLERANCES(JSON.parse(JSON.stringify(props.base_data?.active_tolerance)));
    } else {setANTOLERANCES([])};
    if (props.base_data?.address){
      setORGADDRESSES(JSON.parse(JSON.stringify(props.base_data?.address)));
    } else {setORGADDRESSES([])};
    if (props.base_data?.emails){
      setORGEMAILS(JSON.parse(JSON.stringify(props.base_data?.emails)));
    } else {setORGEMAILS([])};
    if (props.base_data?.legaladdresses){
      setANLICENSES(JSON.parse(JSON.stringify(props.base_data?.legaladdresses)));
    } else {setANLICENSES([])};
    if (props.base_data?.phones){
      setORGPHONES(JSON.parse(JSON.stringify(props.base_data?.phones)));
    } else {setORGPHONES([])};
    if (props.base_data?.requisites){
      setREQUISITES(JSON.parse(JSON.stringify(props.base_data?.requisites)));
    } else {setREQUISITES([])};

    let bdt = FlushOrgData(props.base_data, [
      "warningcmpcount",
      "warningcmpcomment",
      "tv",
      "id_orgs8an_tolerance",
      "id_orgs8an_project",
      "id_orgs8an_phones",
      "id_orgs8an_notes",
      "id_orgs8an_meeting",
      "id_orgs8an_log",
      "id_orgs8an_licenses",
      "id_orgs8an_fax",
      "id_orgs8an_calls",
      "id_orgs8an_email",
      "id_orgs8an_address",
      "contacts"
    ]);

    setBaseData(bdt);
  }, [props.base_data]);



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



  // ███████ ███████ ████████  ██████ ██   ██       ██   ██ 
  // ██      ██         ██    ██      ██   ██        ██ ██  
  // █████   █████      ██    ██      ███████ █████   ███   
  // ██      ██         ██    ██      ██   ██        ██ ██  
  // ██      ███████    ██     ██████ ██   ██       ██   ██ 

  // ------------------------------------------------------------------- //






  /* ----------------- REQUISITES --------------------- */
  /**
   * Добавление нового элемента в стек новых
   */
  const handleAddRequisite = (typedoc)=>{
    let item = {
          id: 'new_' + dayjs().unix() + '_' + REQUISITES.length ,
          id_orgs:  orgId,
          nameorg: '',
          kpp: '',
          inn: '',
          requisites: '',
          deleted: 0,
          command: "create",
        };
    setREQUISITES([...REQUISITES, item]);
  }

  /**
   * Удаление напрочь только что добавленной записи
   * @param {*} id 
   */
  const handleDeleteNewRequisite = (id) => {
    console.log('delete', id)
    setREQUISITES(REQUISITES.filter((item)=>item.id !== id));
  }

  /**
   * Обновление новой только что добавленной записи
   * @param {*} id 
   * @param {*} data 
   * @returns 
   */
  const handleUpdateNewRequisiteUnit = (id, data) => {
    // let udata = originalData.filter((item) => item.id !== id);
    // udata.push(data);
    console.log('CALL TU NEW UPDATE');
    if (!editMode) {
      return;
    }

    data.command = 'create';

    setREQUISITES((prevUnits) => {
      const exists = prevUnits.some((item) => item.id === id);
      if (!exists) {
        return [...prevUnits, data];
      } else {
        return prevUnits.map((item) => (item.id === id ? data : item));
      }
    });
  };







  
  const reload_all_data = () => {
    if (!orgId){ return; };
    // Flush temporary data

    // Load main data
    
  }


  return (
    <div className={`${isTabActive ? '' : 'sa-orgpage-tab-hidder'}`}>
      <h1>Hello Wolf from TabMainTorg</h1>

    </div>
  );
};

export default TabMainTorg;