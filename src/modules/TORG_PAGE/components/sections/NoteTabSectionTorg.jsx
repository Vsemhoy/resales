import React, { useEffect, useState } from 'react';
import TorgPageSectionRow from '../TorgPageSectionRow';
import { Input } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { TORG_MAX_ROWS_TEXTAREA, TORG_MIN_ROWS_TEXTAREA } from '../TorgConfig';

const NoteTabSectionTorg = (props) => {
  const [collapsed, setCollapsed] = useState(false);
  const [editMode, setEditMode] = useState(true); // true|false - режим редактирования

  const [data, setData] = useState(null);

  const [theme, setTheme] = useState('');
  const [author, setAuthor] = useState(1);
  const [date, setDate] = useState(null);
  const [note, setNote] = useState('');


  // ██    ██ ███████ ███████ 
  // ██    ██ ██      ██      
  // ██    ██ █████   █████   
  // ██    ██ ██      ██      
  //  ██████  ██      ██      
  useEffect(() => {
    setEditMode(props.edit_mode);
  }, [props.edit_mode]);

  useEffect(() => {
    setData(props.data);
  }, [props.data]);

  // ██    ██ ███████ ███████       ██   ██ 
  // ██    ██ ██      ██             ██ ██  
  // ██    ██ █████   █████   █████   ███   
  // ██    ██ ██      ██             ██ ██  
  //  ██████  ██      ██            ██   ██ 




  return (
    <div className={`sa-org-collapse-item ${collapsed ? 'sa-collapsed-item' : 'sa-opened-item'}`}>
      <div className={'sa-org-collpase-header sa-flex-space'}>
        <div className={'sa-flex'}>
          Name of the sheep
        </div>
        <div className={'sa-flex'}>
          Delete?
        </div>
      </div>
      <div className={'sa-org-collpase-body'}>
        <div className={'sa-org-collapse-content'}>
          <TorgPageSectionRow
            labels={['Gosha']}
            edit_mode={editMode}
            inputs={[
              {
                label: 'Gesha Pidaroq',
                input: 
              <TextArea
                key={'textar_1_' + data?.id}
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Controlled autosize"
                autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                readOnly={!editMode}
                variant="underlined"
          />,



          }
        ]} />
        </div>
      </div>
    </div>
  );
};

export default NoteTabSectionTorg;