import React, { useEffect, useState } from 'react';

const TabCallsTorg = (props) => {
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
  const onPage = 20;
  const [loading, setLoading] = useState(false);
  
  
  // ██    ██ ███████ ███████ 
  // ██    ██ ██      ██      
  // ██    ██ █████   █████   
  // ██    ██ ██      ██      
  //  ██████  ██      ██      
  // UseEffects
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
    // При загрузке сливаем все Встречи и Звонки в единый массив и назначаем кажому элементу тип

  }


  return (
    <div className={`${isTabActive ? '' : 'sa-orgpage-tab-hidder'}`}>
      <h1>Hello Wolf from TabCallsTorg</h1>
    </div>
  );
};

export default TabCallsTorg;