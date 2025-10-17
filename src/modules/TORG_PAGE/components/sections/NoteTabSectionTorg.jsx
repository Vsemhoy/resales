import React, { useEffect, useState } from 'react';
import TorgPageSectionRow from '../TorgPageSectionRow';
import { Button, DatePicker, Input } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { TORG_CHEVRON_SIZE, TORG_MAX_ROWS_TEXTAREA, TORG_MIN_ROWS_TEXTAREA } from '../TorgConfig';
import { ChevronDownIcon, ChevronUpIcon, TrashIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import { getMonthName } from '../../../../components/helpers/TextHelpers';

const NoteTabSectionTorg = (props) => {
  const [refreshMark, setRefreshMark] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [editMode, setEditMode] = useState(true);

  // Единый источник истины — baseData (как во всех компонентах)
  const [baseData, setBaseData] = useState(null);

  const [itemId, setItemId] = useState(null);
  const [theme, setTheme] = useState('');
  const [author, setAuthor] = useState(1);
  const [date, setDate] = useState(null);
  const [note, setNote] = useState('');
  const [deleted, setDeleted] = useState(0);
  const [allowDelete, setAllowDelete] = useState(true);

  // Флаги
  const [BLUR_FLAG, setBLUR_FLAG] = useState(null);
  const [ACTION_FLAG, setACTION_FLAG] = useState(null);

  // ██    ██ ███████ ███████ 
  useEffect(() => {
    setEditMode(props.edit_mode);
  }, [props.edit_mode]);

  useEffect(() => {
    setRefreshMark(props.refresh_mark);
  }, [props.refresh_mark]);

  useEffect(() => {
    setBaseData(JSON.parse(JSON.stringify(props.data)));

    if (props.data.id) {
      setItemId(props.data.id);
      setTheme(props.data.theme || '');
      setAuthor(props.data.id8staff_list || 1);
      setDate(props.data.date ? dayjs(props.data.date) : null);
      setNote(props.data.notes || '');
      setDeleted(props.data.deleted || 0);
    }
  }, [props.data]);

  useEffect(() => {
    setAllowDelete(props.allow_delete);
  }, [props.allow_delete]);

  useEffect(() => {
    setCollapsed(props.collapsed);
  }, [props.collapsed]);

  // Сброс флагов при смене itemId (контекста)
  useEffect(() => {
    setBLUR_FLAG(null);
    setACTION_FLAG(null);
  }, [itemId]);

  // ██    ██ ███████ ███████       ██   ██ 
  // Синхронизация с родителем — по BLUR_FLAG или при удалении
  useEffect(() => {
    if (!editMode || collapsed) return;

    // Лазейка для мгновенного удаления новых записей
    if (baseData && baseData.command === 'create' && deleted) {
      if (props.on_change) {
        const payload = { ...baseData, deleted, command: 'delete' };
        props.on_change('notes', itemId, payload);
        return;
      }
    }

    const timer = setTimeout(() => {
      if (baseData && props.on_change) {
        const payload = { ...baseData };
        payload.theme = theme;
        payload.date = date ? date.format('DD.MM.YYYY HH:mm:ss') : null;
        payload.notes = note;
        payload.deleted = deleted;
        payload.command =
          baseData.command === 'create'
            ? 'create'
            : deleted
            ? 'delete'
            : 'update';

        props.on_change('notes', itemId, payload);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [BLUR_FLAG, deleted]);

  // Синхронизация с коллектором — по ACTION_FLAG (дебаунс)
  useEffect(() => {
    if (!editMode || collapsed) return;

    const timer = setTimeout(() => {
      if (ACTION_FLAG && props.on_collect && baseData) {
        const payload = { ...baseData };
        payload.theme = theme?.trim();
        payload.date = date ? date.format('DD.MM.YYYY HH:mm:ss') : null;
        payload.notes = note?.trim();
        payload.deleted = deleted;
        payload.command =
          baseData.command === 'create'
            ? 'create'
            : deleted
            ? 'delete'
            : 'update';

        props.on_collect(payload);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [theme, note, deleted]);

  const handleDeleteItem = () => {
    if (allowDelete) {
      setDeleted(!deleted);
      setBLUR_FLAG(dayjs().unix());
      setACTION_FLAG(1);
    }
    if (props.on_delete) {
      props.on_delete(itemId);
    }
  };

  const setActionFlagOnce = () => {
    if (!ACTION_FLAG) setACTION_FLAG(1);
  };

  return (
    <div
      className={`sa-org-collapse-item
       ${collapsed ? 'sa-collapsed-item' : 'sa-opened-item'}
       ${deleted ? 'deleted' : ''}`}
    >
      <div
        className={'sa-org-collpase-header sa-flex-space'}
        onClick={(ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          setCollapsed(!collapsed);
        }}
      >
        <div className={'sa-flex'}>
          <div className={'sa-pa-6'}>
            <span
              className={'sa-pa-3 sa-org-trigger-button'}
              onClick={(e) => {
                e.stopPropagation();
                setCollapsed(!collapsed);
              }}
            >
              {collapsed ? (
                <ChevronDownIcon height={TORG_CHEVRON_SIZE} />
              ) : (
                <ChevronUpIcon height={TORG_CHEVRON_SIZE} />
              )}
            </span>
          </div>
          <div className={'sa-pa-6 sa-org-section-text'}>
            <div className="sa-org-section-label">
              {theme ? theme : 'Без темы '}
            </div>
            <span className="sa-date-text">
              {date !== null
                ? ` - ${getMonthName(dayjs(date).month() + 1)} ${date.format('YYYY')}`
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
            <span
              className={'sa-pa-3 sa-org-remove-button'}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Button
                danger
                size="small"
                onClick={handleDeleteItem}
                icon={<TrashIcon height={TORG_CHEVRON_SIZE} />}
              />
            </span>
          )}
        </div>
      </div>
      <div className={'sa-org-collapse-body'}>
        <div className={'sa-org-collapse-content'}>
          <TorgPageSectionRow
            key={`notabu_${itemId}`}
            edit_mode={editMode}
            inputs={[
              {
                edit_mode: editMode,
                label: 'Тема',
                input: (
                  <Input
                    key={`textard_1_${baseData?.id}`}
                    value={theme}
                    onChange={(e) => {
                      setTheme(e.target.value);
                      setActionFlagOnce();
                    }}
                    readOnly={!editMode}
                    variant="borderless"
                    maxLength={200}
                    onBlur={() => setBLUR_FLAG(dayjs().unix())}
                  />
                ),
                required: true,
                value: theme,
              },
            ]}
          />

          <TorgPageSectionRow
            key={`nottaky_${itemId}`}
            edit_mode={editMode}
            inputs={[
              {
                label: 'Автор',
                input: (
                  <Input
                    key={`textard_2_${baseData?.id}`}
                    value={
                      baseData?.creator
                        ? `${baseData.creator.surname} ${baseData.creator.name} ${baseData.creator.secondname}`
                        : ''
                    }
                    readOnly={true}
                    variant="borderless"
                  />
                ),
              },
              {
                label: 'Дата',
                input: (
                  <DatePicker
                    key={`textard_3_${baseData?.id}`}
                    value={date}
                    readOnly={true}
                    variant="borderless"
                    disabled={true}
                    format={'DD-MM-YYYY'}
                  />
                ),
              },
            ]}
          />

          <TorgPageSectionRow
            key={`netakus_${itemId}`}
            edit_mode={editMode}
            inputs={[
              {
                edit_mode: editMode,
                label: 'Заметка',
                input: (
                  <TextArea
                    key={`textard_4_${baseData?.id}`}
                    value={note}
                    onChange={(e) => {
                      setNote(e.target.value);
                      setActionFlagOnce();
                    }}
                    readOnly={!editMode}
                    variant="borderless"
                    autoSize={{
                      minRows: TORG_MIN_ROWS_TEXTAREA,
                      maxRows: TORG_MAX_ROWS_TEXTAREA,
                    }}
                    maxLength={5000}
                    required={true}
                    onBlur={() => setBLUR_FLAG(dayjs().unix())}
                  />
                ),
                required: true,
                value: note,
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default NoteTabSectionTorg;