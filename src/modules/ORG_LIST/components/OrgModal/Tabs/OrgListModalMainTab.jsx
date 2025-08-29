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
import { ORG_DEF_DATA } from '../../mock/ORGDEFDATA';
import { ChevronDoubleDownIcon, ChevronDoubleUpIcon } from '@heroicons/react/24/solid';


const OrgListMainTab = (props) => {
  const [orgId, setOrgId] = useState(null);
  const [baseOrgData, setBaseOrgData] = useState([]);
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
    console.log(ORGLIST_MODAL_MOCK_MAINTAB);
  }, [props.data]);





    useEffect(() => {
      // эффект
      console.log(props.selects_data);
    }, [props.selects_data]);




  // Читаем из локалсторедж или ставим дефолт
    const [modalSectionsOpened, setModalSectionsOpened] = useState(() => {
      const saved = localStorage.getItem("modalOrgSectionsOpened");
      if (saved && saved !== undefined && saved !== "undefined"){
        return JSON.parse(saved);
      } else {
        return ['st_commoninfo','st_departinfo','st_contactinfo','st_contacts'];
      }
    });

    const [modalUsersExpanded, setModalUsersExpanded] = useState(() => {
      const saved = localStorage.getItem("setModalOrgUsersExpanded");
      if (saved && saved !== undefined && saved !== "undefined" && saved !== "false" && saved !== false){
        return JSON.parse(saved);
      } else {
        return false;
      }
    });

    const [modalUsersOpened, setModalUsersOpened] = useState([]);

    // Сохраняем изменения в локалсторедж при изменении modalSectionsOpened
    // useEffect(() => {
    //   localStorage.setItem("setModalOrgUsersExpanded", JSON.stringify());
    // }, [modalUsersExpanded]);





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
      id={45544532}
      />,
    },
    {
      key: '1contitems_0N_233',
      label: <div className='sk-omt-sub-title'>Дебонияр Руслан Сугран</div>,
      children: <OrgModalContactsSection
      id={456546532}
      />,
    },
  ];

  useEffect(() => {
    let ar = [];
    if (modalUsersExpanded){
      for (let i = 0; i < contactItems.length; i++) {
        const element = contactItems[i];
        ar.push(element.key);
      }
    };
    setModalUsersOpened(ar);
  }, [modalUsersExpanded]);


  const handleExpandAll = (state) => {
    setModalUsersExpanded(state);
    localStorage.setItem("setModalOrgUsersExpanded", JSON.stringify(state));
  }

  const handleChangeUserSelection = (val) => {
    setModalUsersOpened(val);
    // localStorage.setItem("setModalOrgUsersExpanded", JSON.stringify());
  }


  const structureItems = [
    {
      key: 'st_commoninfo',
      label: 'Общая информация',
      children: <OrgModalCommonSection
        data={baseOrgData}
        selects_data={props.selects_data}
      />
    },
        {
      key: 'st_departinfo',
      label: 'Информация отдела',
      children: <OrgModalDepartSection
        data={baseOrgData}
        selects_data={props.selects_data}
      />
    },
        {
      key: 'st_contactinfo',
      label: 'Контактная информация',
      children: <OrgModalContactinfoSection
        data={baseOrgData}
        selects_data={props.selects_data}
      />
    },
      {
      key: 'st_contacts',
      label: <div className={'sa-flex-space'}><div>Контактные лица</div>
      <div className={'sa-flex-space'}>
        {modalUsersExpanded ? (
        <Button
          onClick={(ev)=>{
            ev.preventDefault();
            ev.stopPropagation();
            handleExpandAll(false);
          }}
          size={'small'} icon={<ChevronDoubleUpIcon height={'20px'} style={{marginTop: '4px'}} />}>Свернуть всех</Button>
        ) : (
          <Button
          onClick={(ev)=>{
            ev.preventDefault();
            ev.stopPropagation();
            handleExpandAll(true);
          }}
        size={'small'} icon={<ChevronDoubleDownIcon height={'20px'} style={{marginTop: '4px'}} />}>Развернуть всех</Button>
        )}
        </div>
      </div>,
      children: (
        <div className='sk-omt-subs'>
          <Collapse
                  size={'small'}
                  items={contactItems} 
                  activeKey={modalUsersOpened}
                  onChange={handleChangeUserSelection}
          /></div>)
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
              setOrgId(response.data.content.id);
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



  const handleSectionChange = (keys) => {
    console.log(keys);
    setModalSectionsOpened(keys);
    localStorage.setItem("modalOrgSectionsOpened", JSON.stringify(keys));
    // localStorage обновится в useEffect
  };



  return (
    <div>
      <Spin spinning={loading}>

        <Collapse
            defaultActiveKey={['st_commoninfo', 'st_departinfo', 'st_contactinfo']}
            activeKey={modalSectionsOpened}
            size={'small'}
            onChange={handleSectionChange}
            // onMouseDown={handleSectionClick}
            items={structureItems} />
            
        </Spin>
    </div>
  );
};

export default OrgListMainTab;