import React, { useEffect, useState } from 'react';
import TorgPageSectionRow from '../../TorgPageSectionRow';
import { Input } from 'antd';
import dayjs from 'dayjs';

const SiteBigSectionOrg = (props) => {
  const [editMode, setEditMode] = useState(false);

  const [site, setSite] = useState('');

  const [itemId, setItemId] = useState(null);

    const [BLUR_FLAG, setBLUR_FLAG] = useState(null);

  useEffect(() => {
    setEditMode(props.edit_mode)
  }, [props.edit_mode]);

  useEffect(() => {
    setItemId(props.data?.id);
    setSite(props.data?.site)
  }, [props.data]);

  useEffect(() => {
    if (BLUR_FLAG === null){ return; }
      if (props.on_blur){
        props.on_blur(site);
      }

  }, [
    BLUR_FLAG,
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
                    onChange={e => setSite(e.target.value)}
                    // placeholder="Controlled autosize"
                    readOnly={!editMode}
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