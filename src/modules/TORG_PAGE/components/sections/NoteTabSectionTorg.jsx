import React, { useEffect, useState } from 'react';
import TorgPageSectionRow from '../TorgPageSectionRow';
import { DatePicker, Input } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { TORG_CHEVRON_SIZE, TORG_MAX_ROWS_TEXTAREA, TORG_MIN_ROWS_TEXTAREA } from '../TorgConfig';
import { ChevronDownIcon, ChevronUpIcon, TrashIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import { getMonthName } from '../../../../components/helpers/TextHelpers';

const NoteTabSectionTorg = (props) => {
  const [collapsed, setCollapsed] = useState(false);
  const [editMode, setEditMode] = useState(true); // true|false - режим редактирования

  const [data, setData] = useState(null);

  const [itemId, setItemId] = useState(null);
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

    if (props.data.id) {
      setItemId(props.data.id);
      setTheme(props.data.theme);
      setAuthor(props.data.id8staff_list);
      setDate(props.data?.date ? dayjs(props.data.date) : null);
      setNote(props.data.notes);
      setDeleted(props.data.deleted);
    }
  }, [props.data]);




  // ██    ██ ███████ ███████       ██   ██ 
  // ██    ██ ██      ██             ██ ██  
  // ██    ██ █████   █████   █████   ███   
  // ██    ██ ██      ██             ██ ██  
  //  ██████  ██      ██            ██   ██ 



  const handleDeleteItem = () => {
    if (props.on_delete) {
      props.on_delete(itemId);
    };
    if (allowDelete) {
      setDeleted(!deleted);
    }
  }

  useEffect(() => {
    setCollapsed(props.collapsed);
  }, [props.collapsed]);


  useEffect(() => {
    if (editMode && !collapsed && data && data.command === 'create' && deleted){
      // Лазейка для удаления созданных в обход таймаута - позволяет избежать гонок при очень быстром удалении
          if (props.on_change){
            data.deleted = deleted;
                data.command = 'delete';
                props.on_change('notes', itemId, data);
                return;
          }
        }

      const timer = setTimeout(() => {
        // При сверх-быстром изменении полей в разных секциях могут быть гонки
			  if (editMode && !collapsed && data){
          if (props.on_change){
            data.theme = theme;
            data.date = date ? date.format('DD.MM.YYYY HH:mm:ss') : null;
            data.notes = note;
            data.deleted = deleted;

            if (data.command === undefined || data.command !== 'create'){
              if (deleted){
                data.command = 'delete';
              } else {
                data.command = 'update';
              }
            }

            props.on_change('notes', itemId, data);
          }
        }
			}, 500);

			return () => clearTimeout(timer);

  }, [
    date,
    theme,
    note,
    deleted
  ]);


  return (
    <div className={`sa-org-collapse-item
       ${collapsed ? 'sa-collapsed-item' : 'sa-opened-item'}
       ${deleted ? 'deleted' : ''}`}

    >
      <div className={'sa-org-collpase-header sa-flex-space'}
        onDoubleClick={(ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          setCollapsed(!collapsed)
        }
        }
      >
        <div className={'sa-flex'}>
          <div className={'sa-pa-6'}>
            {collapsed ? (
              <span className={'sa-pa-3 sa-org-trigger-button'}
                onClick={() => { setCollapsed(!collapsed) }}
              >
                <ChevronDownIcon height={TORG_CHEVRON_SIZE} />
              </span>

            ) : (
              <span className={'sa-pa-3 sa-org-trigger-button'}
                onClick={() => { setCollapsed(!collapsed) }}
              >
                <ChevronUpIcon height={TORG_CHEVRON_SIZE} />
              </span>
            )}


          </div>
          <div className={'sa-pa-6 sa-org-section-text'}>
            <div className='sa-org-section-label'>
              {theme ? theme : "Без темы "}
            </div>
            <span className="sa-date-text">
              {date !== null
                ? ` - ` +
                  getMonthName(dayjs(date).month() + 1) +
                  ' ' +
                  date.format('YYYY')
                : ''}
            </span>{' '}
            {itemId && (
              <div className={'sa-org-row-header-id sa-text-phantom'}>
                ({itemId})
              </div>
            )}
 

          </div>

        </div>
        <div className={'sa-flex'}>
          {allowDelete && editMode && (
            <span className={'sa-pa-3 sa-org-remove-button'}
              onClick={handleDeleteItem}
            >
              <TrashIcon height={TORG_CHEVRON_SIZE} />
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
                edit_mode: editMode,
                label: 'Тема',
                input:
                  <Input
                    key={'textard_1_' + data?.id}
                    value={theme}
                    onChange={e => setTheme(e.target.value)}
                    // placeholder="Controlled autosize"
                    autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                    readOnly={!editMode}
                    variant="borderless"
                    maxLength={200}
                  />,
                  required: true,
                  value: theme
              },


            ]}
            extratext={[]}
          />


          <TorgPageSectionRow
            edit_mode={editMode}
            inputs={[
              {
                label: 'Автор',
                input:
                  <Input
                    key={'textard_2_' + data?.id}
                    value={
                      data?.creator
                      ? data.creator.surname +
                        ' ' +
                        data.creator.name +
                        ' ' +
                        data.creator.secondname
                      : ''
                    }
                    // onChange={e => setNote(e.target.value)}
                    autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                    readOnly={true}
                    variant="borderless"
                  />,
              },
              {
                label: 'Дата',
                input:
                  <DatePicker
                    key={'textard_3_' + data?.id}
                    value={date}
                    // onChange={e => setNote(e.target.value)}
                    autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                    readOnly={true}
                    variant="borderless"
                    disabled={true}
                    format={'DD-MM-YYYY'}
                  />,
              },

            ]}
            extratext={[]}
          />


          <TorgPageSectionRow
            labels={['Gosha']}
            edit_mode={editMode}
            inputs={[
              {
                edit_mode: editMode,
                label: 'Заметка',
                input:
                  <TextArea
                    key={'textard_4_' + data?.id}
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    // placeholder="Controlled autosize"
                    autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                    readOnly={!editMode}
                    variant="borderless"
                    maxLength={5000}
                    required={true}
                  />,
                  required: true,
                  value: note
              },


            ]}
            extratext={[]}
          />
        </div>
      </div>
    </div>
  );
};

export default NoteTabSectionTorg;