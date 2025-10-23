import React, { useEffect, useState } from 'react';
import TorgPageSectionRow from '../../../TorgPageSectionRow';
import { Button, Input, Select } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { TORG_DELETE_SIZE, TORG_MAX_ROWS_TEXTAREA, TORG_MIN_ROWS_TEXTAREA } from '../../../TorgConfig';
import { TrashIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';

const ContactMessangerMicroSectionTorg = (props) => {
  const [editMode, setEditMode] = useState(true);

  const [baseData, setBaseData] = useState(null);
  const [itemId, setItemId] = useState(null);
  const [orgId, setOrgId] = useState(null);
  const [allowDelete, setAllowDelete] = useState(true);

  const [identifier, setIdentifier] = useState('');
  const [messangers_id, setMessangers_id] = useState(1);
  const [id_orgsusers, setIdOrgsusers] = useState(null);
  const [deleted, setDeleted] = useState(0);

  const [selects, setSelects] = useState(null);

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
      setItemId(props.data.id);
      setOrgId(props.data.id_orgs);
      setIdOrgsusers(props.data?.id_orgsusers);
      setIdentifier(props.data.identifier);
      setMessangers_id(props.data.messangers_id);
      setDeleted(props.data?.deleted);
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

  useEffect(() => {
    if (props.selects) {
      setSelects(props.selects);
    }
  }, [props.selects]);

  // Сброс флагов при смене org_id
  useEffect(() => {
    setBLUR_FLAG(null);
    setACTION_FLAG(null);
  }, [props.org_id]);


  // Синхронизация с родителем — по BLUR_FLAG
  useEffect(() => {
    if (!BLUR_FLAG && Boolean(deleted) === Boolean(props.data?.deleted)) return;

    const timer = setTimeout(() => {
      if (editMode && baseData && props.on_change) {
        const payload = {
          ...baseData,
          id_orgsusers: id_orgsusers,
          identifier: identifier,
          messangers_id: messangers_id,
          deleted: deleted,
          command:
            baseData.command === 'create'
              ? 'create'
              : deleted
              ? 'delete'
              : 'update',
        };
        props.on_change(itemId, payload, 'contact_messanger');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [BLUR_FLAG, deleted]);

  // Синхронизация с коллектором — по ACTION_FLAG (дебаунс)
  useEffect(() => {
    if (!editMode) return;

    const timer = setTimeout(() => {
      if (ACTION_FLAG && props.on_collect && baseData) {
        const payload = {
          ...baseData,
          id_orgsusers: id_orgsusers,
          identifier: identifier?.trim(),
          messangers_id: messangers_id,
          deleted: deleted,
          command:
            baseData.command === 'create'
              ? 'create'
              : deleted
              ? 'delete'
              : 'update',
        };
        props.on_collect(payload);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [identifier, messangers_id, deleted]);

  return (
    <div className={`sa-org-sub-sub-section-row ${deleted ? 'deleted' : ''}`}>
      <TorgPageSectionRow
        key={`pupupu_${itemId}`}
        explabel={'комм'}
        edit_mode={editMode}
        inputs={[
          {
            edit_mode: editMode,
            label: 'Идентификатор пользователя',
            input: (
              <Input
                key={`contdnumber_${baseData?.id}_${orgId}`}
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (!ACTION_FLAG) setACTION_FLAG(1);
                }}
                placeholder="@contact_id"
                disabled={!editMode}
                variant="borderless"
                maxLength={250}
                required={true}
                onBlur={() => setBLUR_FLAG(dayjs().unix())}
              />
            ),
            required: true,
            value: identifier,
          },
          {
            edit_mode: editMode,
            label: 'Мессенджер',
            input: (
              <Select
                size="small"
                key={`contdfnumber_${baseData?.id}_${orgId}`}
                value={messangers_id}
                onChange={(value) => {
                  setMessangers_id(value);
                  setBLUR_FLAG(dayjs().unix());
                  if (!ACTION_FLAG) setACTION_FLAG(1);
                }}
                disabled={!editMode}
                variant="borderless"
                options={
                  selects?.messangers?.map((item) => ({
                    key: `messsages_${item.id}`,
                    value: item.id,
                    label: item.name,
                  })) || []
                }
              />
            ),
            required: true,
            value: messangers_id, // ← было setMessangers_id — ошибка!
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

export default ContactMessangerMicroSectionTorg;