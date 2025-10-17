import React, { useEffect, useState } from 'react';
import TorgPageSectionRow from '../../../TorgPageSectionRow';
import { Button, Input } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { TORG_DELETE_SIZE, TORG_MAX_ROWS_TEXTAREA, TORG_MIN_ROWS_TEXTAREA } from '../../../TorgConfig';
import { TrashIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';

const ContactEmailMicroSectionTorg = (props) => {
  const [editMode, setEditMode] = useState(true);

  const [baseData, setBaseData] = useState(null);
  const [itemId, setItemId] = useState(null);
  const [orgId, setOrgId] = useState(null);
  const [allowDelete, setAllowDelete] = useState(true);

  const [comment, setComment] = useState('');
  const [email, setEmail] = useState('');
  const [id_orgsusers, setIdOrgsusers] = useState(null);
  const [deleted, setDeleted] = useState(0);

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
      setEmail(props.data?.email);
      setComment(props.data?.comment);
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

  // Сброс флагов при смене org_id
  useEffect(() => {
    setBLUR_FLAG(null);
    setACTION_FLAG(null);
  }, [props.org_id]);

  // ██    ██ ███████ ███████       ██   ██ 
  // Синхронизация с родителем — по BLUR_FLAG
  useEffect(() => {
    if (!BLUR_FLAG && Boolean(deleted) === Boolean(props.data?.deleted)) return;

    const timer = setTimeout(() => {
      if (editMode && baseData && props.on_change) {
        const payload = {
          ...baseData,
          id_orgsusers: id_orgsusers,
          email: email,
          comment: comment,
          deleted: deleted,
          command:
            baseData.command === 'create'
              ? 'create'
              : deleted
              ? 'delete'
              : 'update',
        };
        props.on_change(itemId, payload, 'contact_email');
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
          email: email?.trim(),
          comment: comment?.trim(),
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
  }, [email, comment, deleted]);

  return (
    <div className={`sa-org-sub-sub-section-row ${deleted ? 'deleted' : ''}`}>
      <TorgPageSectionRow
        key={`totofu_${itemId}`}
        explabel={'комм'}
        edit_mode={editMode}
        inputs={[
          {
            edit_mode: editMode,
            label: 'Email',
            input: (
              <Input
                key={`coeentemail_${baseData?.id}_${orgId}`}
                value={email}
                type="email"
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (!ACTION_FLAG) setACTION_FLAG(1);
                }}
                readOnly={!editMode}
                variant="borderless"
                maxLength={64}
                required={true}
                onBlur={() => setBLUR_FLAG(dayjs().unix())}
              />
            ),
            required: true,
            value: email,
          },
        ]}
        extratext={[
          {
            edit_mode: editMode,
            label: 'Комментарий',
            input: (
              <TextArea
                key={`coeentemail_2_${baseData?.id}_${orgId}`}
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
          editMode && (
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
          )
        }
      />
    </div>
  );
};

export default ContactEmailMicroSectionTorg;