import React, { useEffect, useState } from 'react';

const TabProjectsTorg = (props) => {

  const [editMode, setEditMode] = useState(false);
  const [orgId, setOrgId] = useState(null);
  const [baseData, setBaseData] = useState(null);
  const [selects, setSelects] = useState(null);
  
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



  return (
    <h1>Hello Wolf from TabProjectsTorg</h1>
  );
};

export default TabProjectsTorg;