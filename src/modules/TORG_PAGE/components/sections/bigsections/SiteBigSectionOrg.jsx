import React, { useEffect, useState } from 'react';
import TorgPageSectionRow from '../../TorgPageSectionRow';
import { Input } from 'antd';
import dayjs from 'dayjs';

const SiteBigSectionOrg = (props) => {
  const [editMode, setEditMode] = useState(false);

  const [site, setSite] = useState('');

  const [itemId, setItemId] = useState(null);

  const [BLUR_FLAG, setBLUR_FLAG] = useState(null);
  const [ACTION_FLAG, setACTION_FLAG] = useState(null);

  useEffect(() => {
    setEditMode(props.edit_mode)
  }, [props.edit_mode]);

  useEffect(() => {
    if (props.data?.id !== itemId){
      setItemId(props.data?.id);
    }
    if (site !== props.data?.site){
      setSite(props.data?.site)
    }
  }, [props.data]);

  

  useEffect(() => {
      setBLUR_FLAG(null);
      setACTION_FLAG(null);
    }, [props.data.id, props.org_id]);

  useEffect(() => {
    if (BLUR_FLAG === null){ return; }
      if (props.on_blur){
        props.on_blur(site);
      }

  }, [
    BLUR_FLAG,
  ]);


    // Для отправки прямо в коллектор по кейдауну
    useEffect(() => {
      if (ACTION_FLAG && props.on_change && editMode){
        const timer = setTimeout(() => {
          props.on_change({site: site});
      }, 500);
      return () => clearTimeout(timer);
      }
    }, [   
      site
    ]);

  return (
    <div>
      <TorgPageSectionRow
              explabel={'Реквизиты'}
              edit_mode={editMode}
              inputs={[
              {
                edit_mode: editMode,
                label: 'Веб-Сайт',
                input:
                  
                  <Input
                    key={'sitefield_2_' + itemId}
                    value={site}
                    onChange={e => {
                      setACTION_FLAG(1);
                      setSite(e.target.value);
                    }}
                    // placeholder="Controlled autosize"
                    disabled={!editMode}
                    variant="borderless"
                    maxLength={128}
                    required={false}
                    onBlur={()=>{setBLUR_FLAG(dayjs().unix());}}
                  />,
                  required: false,
                  value: site
              },
             
            ]}
                      
          />
    </div>
  );
};

export default SiteBigSectionOrg;