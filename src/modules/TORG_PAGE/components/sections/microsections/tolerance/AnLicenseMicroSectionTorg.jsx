import React, { useEffect, useState } from 'react';
import TorgPageSectionRow from '../../../TorgPageSectionRow';
import { Button, Input, Select } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { TORG_DELETE_SIZE, TORG_MAX_ROWS_TEXTAREA, TORG_MIN_ROWS_TEXTAREA } from '../../../TorgConfig';
import { TrashIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';

const AnLicenseMicroSectionTorg = (props) => {
  const [editMode, setEditMode] = useState(true);

  const [baseData, setBaseData] = useState(null);
  const [itemId, setItemId] = useState(null);
  const [options, setOptions] = useState([]);
  const [selects, setSelects] = useState(null);

  const [allowDelete, setAllowDelete] = useState(true);

  const [comment, setComment] = useState('');
  const [number, setNumber] = useState('');
  const [id_orgs, setIdOrgs] = useState(null);
  const [type, setType] = useState(1);
  const [docType, setDocType] = useState(1);
  const [deleted, setDeleted] = useState(0);

  // Флаг для блюра — обновление в массиве уровнем ниже
  const [BLUR_FLAG, setBLUR_FLAG] = useState(null);
  // Флаг для действия — отправка в глобальный коллектор
  const [ACTION_FLAG, setACTION_FLAG] = useState(null);

  // ██    ██ ███████ ███████ 
  useEffect(() => {
    setEditMode(props.edit_mode);
  }, [props.edit_mode]);

  useEffect(() => {
    setBaseData(JSON.parse(JSON.stringify(props.data)));

    if (props.data.id) {
      setItemId(props.data.id);
      setIdOrgs(props.data.id_orgs);
      setDocType(props.doc_type);

      if (props.doc_type === 1) {
        setType(parseInt(props.data.id8an_typelicenses) || 1);
      } else {
        setType(parseInt(props.data.id8an_typetolerance) || 1);
      }

      setComment(props.data.comment);
      setDeleted(props.data.deleted);
      setNumber(props.data.number);
    }
  }, [props.data, props.doc_type]);

  useEffect(() => {
    if (deleted && props.on_delete) {
      props.on_delete(itemId);
    }
  }, [deleted]);

  useEffect(() => {
    setAllowDelete(props.allow_delete);
  }, [props.allow_delete]);

  // Формирование опций для Select
  useEffect(() => {
    if (!props.selects || !props.selects.tollic) {
      setOptions([]);
      return;
    }

    const arrak = [];
    const prefix = String(docType);
    for (const key in props.selects.tollic) {
      if (props.selects.tollic.hasOwnProperty(key) && key.startsWith(prefix)) {
        const value = Number(key.split('-')[1]);
        arrak.push({
          key: `kivalas3_k${key}_${itemId}`,
          value: value,
          label: props.selects.tollic[key],
        });
      }
    }
    setOptions(arrak);
  }, [props.selects, docType, itemId]);

  // Сброс флагов при смене doc_type или id_orgs (контекста)
  useEffect(() => {
    setBLUR_FLAG(null);
    setACTION_FLAG(null);
  }, [props.doc_type, id_orgs]);

  // ██    ██ ███████ ███████       ██   ██ 
  // Синхронизация с родителем (массивом секций) — по BLUR_FLAG
  useEffect(() => {
    if (!BLUR_FLAG && Boolean(deleted) === Boolean(props.data?.deleted)) return;

    const timer = setTimeout(() => {
      if (editMode && baseData && props.on_change) {
        const payload = { ...baseData };
        payload.id_orgs = id_orgs;
        payload.document_type = docType;
        payload.comment = comment;
        payload.deleted = deleted;
        payload.number = number;

        if (docType === 1) {
          payload.id8an_typelicenses = type;
          delete payload.id8an_typetolerance;
        } else {
          payload.id8an_typetolerance = type;
          delete payload.id8an_typelicenses;
        }

        payload.command =
          baseData.command === 'create'
            ? 'create'
            : deleted
            ? 'delete'
            : 'update';

        props.on_change(itemId, payload, 'an_license');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [BLUR_FLAG, deleted, docType]);

  // Синхронизация с коллектором — по ACTION_FLAG (дебаунс)
  useEffect(() => {
    if (!editMode) return;

    const timer = setTimeout(() => {
      if (ACTION_FLAG && props.on_collect && baseData) {
        const payload = { ...baseData };
        payload.id_orgs = id_orgs;
        payload.document_type = docType;
        payload.comment = comment?.trim();
        payload.deleted = deleted;
        payload.number = number?.trim();

        if (docType === 1) {
          payload.id8an_typelicenses = type;
          delete payload.id8an_typetolerance;
        } else {
          payload.id8an_typetolerance = type;
          delete payload.id8an_typelicenses;
        }

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
  }, [type, number, comment, deleted]);

  return (
    <div className={`sa-org-sub-sub-section-row ${deleted ? 'deleted' : ''}`}>
      <TorgPageSectionRow
        key={`tot4525eddtl_${itemId}`}
        explabel={'комм'}
        edit_mode={editMode}
        inputs={[
          {
            edit_mode: editMode,
            label: docType === 1 ? 'Лицензия' : 'Допуск',
            input: (
              <Select
                key={`analicensde_2_${baseData?.id}_${id_orgs}`}
                value={type}
                options={options}
                onChange={(value) => {
                  setType(value);
                  setBLUR_FLAG(dayjs().unix());
                  if (!ACTION_FLAG) setACTION_FLAG(1);
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
            label: 'Номер',
            input: (
              <Input
                size="small"
                key={`analicense_2_${baseData?.id}_${id_orgs}`}
                value={number}
                onChange={(e) => {
                  setNumber(e.target.value);
                  if (!ACTION_FLAG) setACTION_FLAG(1);
                }}
                readOnly={!editMode}
                variant="borderless"
                maxLength={55}
                required={false}
                onBlur={() => setBLUR_FLAG(dayjs().unix())}
              />
            ),
            required: false,
            value: number,
          },
        ]}
        extratext={[
          {
            edit_mode: editMode,
            label: 'Комментарий',
            input: (
              <TextArea
                key={`analicense_1_${baseData?.id}_${id_orgs}`}
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                  if (!ACTION_FLAG) setACTION_FLAG(1);
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
    </div>
  );
};

export default AnLicenseMicroSectionTorg;