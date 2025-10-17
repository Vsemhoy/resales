import React, { useEffect, useState } from 'react';
import TorgPageSectionRow from '../../../TorgPageSectionRow';
import { Button, Input } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { TORG_DELETE_SIZE, TORG_MAX_ROWS_TEXTAREA, TORG_MIN_ROWS_TEXTAREA } from '../../../TorgConfig';
import { TrashIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';

const RequisiteMicroSectionTorg = (props) => {
  const [editMode, setEditMode] = useState(true);

  const [baseData, setBaseData] = useState(null);
  const [itemId, setItemId] = useState(null);
  const [orgId, setOrgId] = useState(null);
  const [allowDelete, setAllowDelete] = useState(true);

  const [requisites, setRequisites] = useState('');
  const [orgName, setOrgName] = useState('');
  const [inn, setInn] = useState('');
  const [kpp, setKpp] = useState(null);
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

      setKpp(props.data?.kpp);
      setOrgName(props.data?.nameorg);
      setRequisites(props.data?.requisites);
      setInn(props.data?.inn);
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

    const timer = setTimeout(() => {
      if (editMode && baseData && props.on_change) {
        const payload = {
          ...baseData,
          kpp: kpp,
          nameorg: orgName,
          requisites: requisites,
          inn: inn,
          deleted: deleted,
          command:
            baseData.command === 'create'
              ? 'create'
              : deleted
              ? 'delete'
              : 'update',
        };
        props.on_change(itemId, payload, 'org_requisite');
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
          kpp: kpp,
          nameorg: orgName?.trim(),
          requisites: requisites?.trim(),
          inn: inn?.trim(),
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
  }, [orgName, inn, kpp, requisites, deleted]);

  return (
    <div
      className={`sa-org-sub-sub-section-row ${deleted ? 'deleted' : ''} 
       ${baseData?.command === 'create' ? 'sa-brand-new-row' : ''}`}
    >
      <TorgPageSectionRow
        key={`totoreddtl_${itemId}`}
        edit_mode={editMode}
        inputs={[
          {
            edit_mode: editMode,
            label: 'Организация',
            input: (
              <Input
                key={`orgreques_1_${baseData?.id}_${orgId}`}
                value={orgName}
                onChange={(e) => {
                  setOrgName(e.target.value);
                  if (!ACTION_FLAG) setACTION_FLAG(1);
                }}
                readOnly={!editMode}
                variant="borderless"
                maxLength={200}
                required={true}
                onBlur={() => setBLUR_FLAG(dayjs().unix())}
              />
            ),
            required: true,
            value: orgName,
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
        key={`rertotoddtl_${itemId}`}
        explabel={'Реквизиты'}
        edit_mode={editMode}
        inputs={[
          {
            edit_mode: editMode,
            label: 'ИНН',
            input: (
              <Input
                key={`orgreques_2_${baseData?.id}_${orgId}`}
                value={inn}
                onChange={(e) => {
                  setInn(e.target.value);
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
            value: inn,
          },
          {
            edit_mode: editMode,
            label: 'КПП',
            input: (
              <Input
                key={`orgreques_3_${baseData?.id}_${orgId}`}
                value={kpp}
                onChange={(e) => {
                  setKpp(e.target.value);
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
            value: kpp,
          },
        ]}
        extratext={[
          {
            edit_mode: editMode,
            label: 'Реквизиты',
            input: (
              <TextArea
                key={`orgreques_4_${baseData?.id}_${orgId}`}
                value={requisites}
                onChange={(e) => {
                  setRequisites(e.target.value);
                  if (!ACTION_FLAG) setACTION_FLAG(1);
                }}
                readOnly={!editMode}
                variant="borderless"
                autoSize={{ minRows: TORG_MIN_ROWS_TEXTAREA, maxRows: TORG_MAX_ROWS_TEXTAREA }}
                maxLength={5000}
                required={true}
                onBlur={() => setBLUR_FLAG(dayjs().unix())}
              />
            ),
            required: true,
            value: requisites,
          },
        ]}
      />
    </div>
  );
};

export default RequisiteMicroSectionTorg;