import React, { useEffect, useState } from 'react';
import TorgPageSectionRow from '../TorgPageSectionRow';
import { Input } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { TORG_MAX_ROWS_TEXTAREA, TORG_MIN_ROWS_TEXTAREA } from '../TorgConfig';
import { ChevronDownIcon, ChevronUpIcon, TrashIcon } from '@heroicons/react/24/outline';

const NoteTabSectionTorg = (props) => {
  const [collapsed, setCollapsed] = useState(false);
  const [editMode, setEditMode] = useState(true); // true|false - режим редактирования

  const [data, setData] = useState(null);

  const [itemId, setItemId]  = useState(null);
  const [theme, setTheme] = useState('');
  const [author, setAuthor] = useState(1);
  const [date, setDate] = useState(null);
  const [note, setNote] = useState('');
  const [deleted, setDeleted] = useState(0);

  const [allowDelete, setAllowDelete] = useState(true);


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
    setItemId(props.data.id);
  }, [props.data]);

  // ██    ██ ███████ ███████       ██   ██ 
  // ██    ██ ██      ██             ██ ██  
  // ██    ██ █████   █████   █████   ███   
  // ██    ██ ██      ██             ██ ██  
  //  ██████  ██      ██            ██   ██ 




  return (
    <div className={`sa-org-collapse-item
       ${collapsed ? 'sa-collapsed-item' : 'sa-opened-item'}
       ${deleted ? 'deleted' : ''}`}
      
    >
      <div className={'sa-org-collpase-header sa-flex-space'}
        onDoubleClick={(ev)=>{
          ev.preventDefault();
          ev.stopPropagation();
          setCollapsed(!collapsed)}
        }
      >
        <div className={'sa-flex'}>
          <div className={'sa-pa-6'}>
            {collapsed ? (
              <span className={'sa-pa-3 sa-org-trigger-button'}
                onClick={()=>{setCollapsed(!collapsed)}}
              >
                <ChevronDownIcon height={'22px'} />
              </span>

            ):(
              <span className={'sa-pa-3 sa-org-trigger-button'}
                onClick={()=>{setCollapsed(!collapsed)}}
              >
                <ChevronUpIcon height={'22px'} />
              </span>
            )}
            
            
          </div>
          <div className={'sa-pa-6 sa-flex-space'}>
            <div>
            Name of the sheep

            </div>
            {itemId && (
              <div className={'sa-org-row-header-id '}>
                ({itemId})
              </div>

            )}
            
            </div>
          
        </div>
        <div className={'sa-flex'}>
          {allowDelete && editMode && (
            <span className={'sa-pa-3 sa-org-remove-button'}
              onClick={()=>{setDeleted(!deleted)}}
            >
              <TrashIcon height={'22px'} />
            </span>
          )}
        </div>
      </div>
      <div className={'sa-org-collapse-body'}>
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