import React, { useEffect, useState } from 'react';
import TorgPageSectionRow from '../../../TorgPageSectionRow';
import { Button, Input } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { TORG_DELETE_SIZE, TORG_MAX_ROWS_TEXTAREA, TORG_MIN_ROWS_TEXTAREA } from '../../../TorgConfig';
import { TrashIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';

const OrgAddressMicroSectionTorg = (props) => {
  const [editMode, setEditMode] = useState(true);

  const [baseData, setBaseData] = useState(null);
  const [itemId, setItemId] = useState(null);
  const [orgId, setOrgId] = useState(null);
  const [allowDelete, setAllowDelete] = useState(true);

  const [comment, setComment] = useState('');
  const [address, setAddress] = useState('');
  const [post_index, setPostIndex] = useState('');
  const [id_orgsusers, setIdOrgsusers] = useState(null);
  const [deleted, setDeleted] = useState(0);

  // Флаг для блюра — обновление в массиве уровнем ниже
  const [BLUR_FLAG, setBLUR_FLAG] = useState(null);
  // Флаг для действия — отправка в глобальный коллектор
  const [ACTION_FLAG, setACTION_FLAG] = useState(null);


  useEffect(() => {
    setEditMode(props.edit_mode);
  }, [props.edit_mode]);

  useEffect(() => {
    setBaseData(JSON.parse(JSON.stringify(props.data)));

    if (props.data.id) {
      setItemId(props.data.id);
      setOrgId(props.data.id_orgs);

      setIdOrgsusers(props.data?.id_orgsusers);
      setAddress(props.data?.address);
      setComment(props.data?.comment);
      setPostIndex(props.data?.post_index);
      setDeleted(props.data?.deleted);
    }
  }, [props.data]);

  useEffect(() => {
    setAllowDelete(props.allow_delete);
  }, [props.allow_delete]);

  useEffect(() => {
    if (deleted && props.on_delete) {
      props.on_delete(itemId);
    }
  }, [deleted]);

  // Сброс флагов при смене org_id
  useEffect(() => {
    setBLUR_FLAG(null);
    setACTION_FLAG(null);
  }, [props.org_id]);


  // Синхронизация с родителем (массивом секций) — по BLUR_FLAG
  useEffect(() => {
    if (!BLUR_FLAG && Boolean(deleted) === Boolean(props.data?.deleted)) return;

    // // Лазейка для мгновенного удаления новых записей
    // if (editMode && baseData && baseData.command === 'create' && deleted) {
    //   if (props.on_change) {
    //     const payload = { ...baseData, deleted };
    //     props.on_change(itemId, payload, 'org_address');
    //     return;
    //   }
    // }

    const timer = setTimeout(() => {
      if (editMode && baseData && props.on_change) {
        const payload = {
          ...baseData,
          id_orgsusers: id_orgsusers,
          address: address,
          comment: comment,
          post_index: post_index,
          deleted: deleted,
          command:
            baseData.command === 'create'
              ? 'create'
              : deleted
              ? 'delete'
              : 'update',
        };
        props.on_change(itemId, payload, 'org_address');
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
          address: address?.trim(),
          comment: comment?.trim(),
          post_index: post_index?.trim(),
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
  }, [address, comment, post_index, deleted]);

  return (
    <div
      className={`sa-org-sub-sub-section-row ${deleted ? 'deleted' : ''} 
       ${baseData?.command === 'create' ? 'sa-brand-new-row' : ''}`}
    >
      <TorgPageSectionRow
        key={`toto655tl_${itemId}`}
        explabel={'комм'}
        edit_mode={editMode}
        inputs={[
          {
            edit_mode: editMode,
            label: 'Адрес',
            input: (
              <Input
                key={`oaddress1_${baseData?.id}_${orgId}`}
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  if (!ACTION_FLAG) setACTION_FLAG(1);
                }}
                onBlur={() => setBLUR_FLAG(dayjs().unix())}
                readOnly={!editMode}
                variant="borderless"
                maxLength={250}
                required={true}
              />
            ),
            required: true,
            value: address,
          },
          {
            edit_mode: editMode,
            label: 'Индекс',
            input: (
              <Input
                key={`oaddress2_${baseData?.id}_${orgId}`}
                value={post_index}
                // type="address" — такого типа нет, убираем или ставим "text"
                onChange={(e) => {
                  setPostIndex(e.target.value);
                  if (!ACTION_FLAG) setACTION_FLAG(1);
                }}
                onBlur={() => setBLUR_FLAG(dayjs().unix())}
                readOnly={!editMode}
                variant="borderless"
                maxLength={25}
                required={false}
              />
            ),
            required: false,
            value: post_index,
          },
        ]}
        extratext={[
          {
            edit_mode: editMode,
            label: 'Комментарий',
            input: (
              <TextArea
                key={`oaddress3_${baseData?.id}_${orgId}`}
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                  if (!ACTION_FLAG) setACTION_FLAG(1);
                }}
                readOnly={!editMode}
                variant="borderless"
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

export default OrgAddressMicroSectionTorg;