import { Button, Collapse, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { PROD_AXIOS_INSTANCE } from '../../../../../config/Api';
import { CSRF_TOKEN, PRODMODE } from '../../../../../config/config';
import OrgModalContactsSection from './MainTabSections/OrgModalContactsSection';
import OrgModalCommonSection from './MainTabSections/OrgModalCommonSection';
import OrgModalDepartSection from './MainTabSections/OrgModalDepartSection';
import OrgModalContactinfoSection from './MainTabSections/OrgModalContactinfoSection';
import { PlusCircleOutlined } from '@ant-design/icons';
import { BarsArrowDownIcon } from '@heroicons/react/16/solid';
import OrgModalPayersSection from './MainTabSections/OrgModalPayersSection';
import OrgModalSupplyContractSection from './MainTabSections/OrgModalSupplyContractSection';
import { ORGLIST_MODAL_MOCK_MAINTAB } from '../../mock/ORGLISTMODALMOCK';


const OrgListMainTab = (props) => {
  const [orgId, setOrgId] = useState(null);
  const [baseOrgData, setBaseOrgData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (props.data?.id){
      setLoading(true);
      setOrgId(props.data.id);

      if (PRODMODE){
        get_org_data_action(props.data.id);
      } else {
        setBaseOrgData(ORGLIST_MODAL_MOCK_MAINTAB);
        setLoading(false);
      }

    } else {
      setOrgId(null);
      setBaseOrgData(null);
    }
    console.log(props.data);
  }, [props.data]);
















  const contactItems = [
  {
    key: 'contitems_0N_1',
    label: <div className='sk-omt-sub-title'>Трастов Василий Петрович</div>,
    children: <OrgModalContactsSection
      id={4532}
    />,
    open: true,
  },
  {
    key: 'contitems_0N_2',
    label: <div className='sk-omt-sub-title'>Клименко Игорь Степаныч</div>,
    children: <OrgModalContactsSection
    id={453232}
    />,
  },
  {
    key: 'contitems_0N_3',
    label: <div className='sk-omt-sub-title'>Суворов Севчик Лютый</div>,
    children: <OrgModalContactsSection
    id={45532}
    />,
  },
    {
    key: 'contitems_0N_4',
    label: <div className='sk-omt-sub-title'>Клименко Игорь Виталич</div>,
    children: <OrgModalContactsSection
    id={455432}
    />,
  },
  {
    key: '1contitems_0N_233',
    label: <div className='sk-omt-sub-title'>Дебонияр Руслан Сугран</div>,
    children: <OrgModalContactsSection
    id={4565432}
    />,
  },
];



  const structureItems = [
    {
      key: 'st_commoninfo',
      label: 'Общая информация',
      children: <OrgModalCommonSection
        data={baseOrgData}
      />
    },
        {
      key: 'st_departinfo',
      label: 'Информация отдела',
      children: <OrgModalDepartSection

      />
    },
        {
      key: 'st_contactinfo',
      label: 'Контактная информация',
      children: <OrgModalContactinfoSection

      />
    },
      {
      key: 'st_contacts',
      label: <div className={'sa-flex-space'}><div>Контактные лица</div>
      <div className={'sa-flex-space'}>
        <Button
          onClick={(ev)=>{
            ev.preventDefault();
            ev.stopPropagation();
          }}
        size={'small'} icon={<PlusCircleOutlined />}>Добавить контакт</Button>
        <BarsArrowDownIcon height={'24px'}/>
        </div>
      </div>,
      children: (<div className='sk-omt-subs'><Collapse
                  size={'small'}
                  items={contactItems} /></div>)
    },
        {
      key: 'st_firmspayers',
      label: 'Фирмы/плательщики',
      children: <OrgModalPayersSection


      />
    },
        {
      key: 'st_dogpost',
      label: 'Договор поставки',
      children: <OrgModalSupplyContractSection />
    },
  ]















  /** ----------------------- FETCHES -------------------- */

  const get_org_data_action = async (id) => {

  
      try {
          let response = await PROD_AXIOS_INSTANCE.post('/api/sales/v2/orglist/' + id + '/m', {
            data: {},
            _token: CSRF_TOKEN
          });
          console.log('response', response);
          if (response.data){
              // if (props.changed_user_data){
              //     props.changed_user_data(response.data);
              // }
              setBaseOrgData(response.data.content);
              setLoading(false);
          }
      } catch (e) {
          console.log(e)
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }

  }


  /** ----------------------- FETCHES -------------------- */





  

  return (
    <div>
      <Spin spinning={loading}>

        <Collapse
            defaultActiveKey={['st_commoninfo', 'st_departinfo', 'st_contactinfo']}
            size={'small'}
            items={structureItems} />
        </Spin>
    </div>
  );
};

export default OrgListMainTab;