import React, { useEffect, useState } from 'react';
import TorgPageSectionRow from '../../../TorgPageSectionRow';
import { Button, DatePicker, Input, Select } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { TORG_DELETE_SIZE, TORG_MAX_ROWS_TEXTAREA, TORG_MIN_ROWS_TEXTAREA } from '../../../TorgConfig';
import { TrashIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';

const BoLicenseMicroSectionTorg = (props) => {
  const [editMode, setEditMode] = useState(true);

  const [baseData, setBaseData] = useState(null);
  const [itemId, setItemId] = useState(null);
  const [options, setOptions] = useState([]);
  const [selects, setSelects] = useState(null);
  const [allowDelete, setAllowDelete] = useState(true);

  const [id, setId] = useState(null);
  const [id_an_orgs, setId_an_orgs] = useState(null);
  const [comment, setComment] = useState('');
  const [type, setType] = useState(1);
  const [docType, setDocType] = useState(1);
  const [name, setName] = useState('');
  const [deleted, setDeleted] = useState(0);
  const [start_date, setStart_date] = useState(null);
  const [end_date, setEnd_date] = useState(null);

  // Флаги
  const [BLUR_FLAG, setBLUR_FLAG] = useState(null);
  const [ACTION_FLAG, setACTION_FLAG] = useState(null);

  // ██    ██ ███████ ███████ 
  useEffect(() => {
    setEditMode(props.edit_mode);
  }, [props.edit_mode]);

  useEffect(() => {
    setBaseData(JSON.parse(JSON.stringify(props.data)));

    if (props.data.id) {
      setId(props.data.id);
      setItemId(props.data.id);
      setId_an_orgs(props.data.id_an_orgs);
      setType(props.data.type);
      setDocType(props.data.document_type);
      setComment(props.data.comment);
      setDeleted(props.data.deleted);
      setName(props.data.name);
      setStart_date(props.data.start_date ? dayjs.unix(props.data.start_date) : null);
      setEnd_date(props.data.end_date ? dayjs.unix(props.data.end_date) : null);
    }
  }, [props.data]);

  useEffect(() => {
    if (deleted && props.on_delete) {
      props.on_delete(itemId);
    }
  }, [deleted]);

  useEffect(() => {
    setAllowDelete(props.allow_delete);
  }, [props.allow_delete]);

  // Формирование опций
  useEffect(() => {
    if (!props.selects?.tollic) {
      setOptions([]);
      return;
    }

    const arrak = [];
    const prefix = String(docType);
    for (const key in props.selects.tollic) {
      if (props.selects.tollic.hasOwnProperty(key) && key.startsWith(prefix)) {
        const value = Number(key.split('-')[1]);
        arrak.push({
          key: `kivala_k${key}_${id}`,
          value: value,
          label: props.selects.tollic[key],
        });
      }
    }
    setOptions(arrak);
  }, [props.selects, docType, id]);

  // Сброс флагов при смене контекста
  useEffect(() => {
    setBLUR_FLAG(null);
    setACTION_FLAG(null);
  }, [docType, id]);

  // ██    ██ ███████ ███████       ██   ██ 
  // Синхронизация с родителем — по BLUR_FLAG
  useEffect(() => {
    if (!BLUR_FLAG && Boolean(deleted) === Boolean(props.data?.deleted)) return;

    const timer = setTimeout(() => {
      if (editMode && baseData && props.on_change) {
        const payload = { ...baseData };
        payload.id_an_orgs = id_an_orgs;
        payload.type = type;
        payload.document_type = docType;
        payload.name = name?.trim();
        payload.comment = comment?.trim();
        payload.deleted = deleted;
        payload.start_date = start_date ? start_date.unix() : null;
        payload.end_date = end_date ? end_date.unix() : null;

        payload.command =
          baseData.command === 'create'
            ? 'create'
            : deleted
            ? 'delete'
            : 'update';

        props.on_change(id, payload, 'bo_license');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [BLUR_FLAG, deleted]);

  // Синхронизация с коллектором — по ACTION_FLAG (дебаунс)
  useEffect(() => {
    if (!editMode) return;

    const timer = setTimeout(() => {
      if (ACTION_FLAG && props.on_collect && baseData) {
        const payload = { ...baseData };
        payload.id_an_orgs = id_an_orgs;
        payload.type = type;
        payload.document_type = docType;
        payload.name = name?.trim();
        payload.comment = comment?.trim();
        payload.deleted = deleted;
        payload.start_date = start_date ? start_date.unix() : null;
        payload.end_date = end_date ? end_date.unix() : null;

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
  }, [name, type, comment, start_date, end_date, deleted]);

  // Универсальный хендлер для установки ACTION_FLAG
  const setActionFlagOnce = () => {
    if (!ACTION_FLAG) setACTION_FLAG(1);
  };

  return (
    <div
      className={`sa-org-sub-sub-section-row ${deleted ? 'deleted' : ''} 
       ${baseData?.command === 'create' ? 'sa-brand-new-row' : ''}`}
    >
      <TorgPageSectionRow
        explabel={'комм'}
        edit_mode={editMode}
        inputs={[
          {
            edit_mode: editMode,
            label: docType === 1 ? 'Лицензия' : 'Допуск СРО',
            input: (
              <Input
                size="small"
                key={`bodicden_2_${baseData?.id}_${id}`}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setActionFlagOnce();
                }}
                readOnly={!editMode}
                variant="borderless"
                maxLength={255}
                required={true}
                onBlur={() => setBLUR_FLAG(dayjs().unix())}
              />
            ),
            required: true,
            value: name,
          },
          {
            edit_mode: editMode,
            label: 'Начало действия',
            input: (
              <DatePicker
                size="small"
                key={`bodicfden_2_${baseData?.id}_${id}`}
                value={start_date}
                onChange={(date) => {
                  setStart_date(date);
                  setBLUR_FLAG(dayjs().unix());
                  setActionFlagOnce();
                }}
                readOnly={!editMode}
                variant="borderless"
                required={false}
              />
            ),
            required: false,
            value: start_date,
          },
        ]}
        action={
          <Button
            className="sa-org-sub-sub-section-row-action"
            size="small"
            color="danger"
            variant="outlined"
            icon={<TrashIcon height={TORG_DELETE_SIZE} />}
            onClick={() => {
              setDeleted(!deleted);
              setBLUR_FLAG(dayjs().unix());
              setACTION_FLAG(1);
            }}
          />
        }
      />

      <TorgPageSectionRow
        key={`toto45234676eddtl_${itemId}`}
        explabel={'комм'}
        edit_mode={editMode}
        inputs={[
          {
            edit_mode: editMode,
            label: 'Вид лицензии/допуска',
            input: (
              <Select
                key={`bodicdend_2_${baseData?.id}_${id}`}
                value={type}
                options={options}
                onChange={(value) => {
                  setType(value);
                  setBLUR_FLAG(dayjs().unix());
                  setActionFlagOnce();
                }}
                size="small"
                variant="borderless"
                disabled={!editMode}
              />
            ),
            required: true,
            value: type,
          },
          {
            edit_mode: editMode,
            label: 'Конец действия',
            input: (
              <DatePicker
                size="small"
                key={`bodicfddn_2_${baseData?.id}_${id}`}
                value={end_date}
                onChange={(date) => {
                  setEnd_date(date);
                  setBLUR_FLAG(dayjs().unix());
                  setActionFlagOnce();
                }}
                readOnly={!editMode}
                variant="borderless"
                required={false}
              />
            ),
            required: false,
            value: end_date,
          },
        ]}
        extratext={[
          {
            edit_mode: editMode,
            label: 'Комментарий',
            input: (
              <TextArea
                key={`bodicdesan_1_${baseData?.id}_${id}`}
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                  setActionFlagOnce();
                }}
                readOnly={!editMode}
                variant="borderless"
                autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                maxLength={5000}
                onBlur={() => setBLUR_FLAG(dayjs().unix())}
              />
            ),
            required: false,
            value: comment,
          },
        ]}
        action={<div></div>}
      />
    </div>
  );
};

export default BoLicenseMicroSectionTorg;