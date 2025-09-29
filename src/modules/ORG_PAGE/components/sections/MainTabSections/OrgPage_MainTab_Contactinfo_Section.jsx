import React, { useEffect, useState } from 'react';
import OrgPageSectionRow, { OPS_TYPE } from '../OrgPageSectionRow';
import { PRODMODE } from '../../../../../config/config';
import { OM_ORG_FILTERDATA } from '../../../../ORG_LIST/components/mock/ORGLISTMOCK';
import { BuildingLibraryIcon, BuildingOfficeIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { Affix, Button } from 'antd';
import dayjs from 'dayjs';
import { compareObjects } from '../../../../../components/helpers/CompareHelpers';
import OPMTinfoContactEmailSection from './subsections/OPMTinfoContactEmailSection';
import OPMTinfoContactPhoneSection from './subsections/OPMTinfoContactPhoneSection';
import OPMTinfoContactLegalAddressSection from './subsections/OPMTinfoContactLegalAddressSection';
import OPMTinfoContactAddressSection from './subsections/OPMTinfoContactAddressSection';



const OrgPage_MainTab_Contactinfo_Section = (props) => {
	const [editMode, seteditMode] = useState(props.edit_mode ? props.edit_mode : false);

  const [itemId,         setItemId]           = useState(0);

  const [id8org_towns,   setId8org_towns]   = useState(0);
  const [id8org_regions, setId8org_regions] = useState(0);
  const [site,           setSite]           = useState('');

  const [legaladdresses, setLegaladdresses] = useState([]);
  const [phones,         setPhones]         = useState([]);
  const [addresses,      setAddresses]      = useState([]);
  const [emails,         setEmails]         = useState([]);

  const [newLegaladdresses, setNewLegaladdresses] = useState([]);
  const [newPhones,         setNewPhones]         = useState([]);
  const [newAddresses,      setNewAddresses]      = useState([]);
  const [newEmails,         setNewEmails]         = useState([]);

  const [originalLegaladdresses, setOriginalLegaladdresses] = useState([]);
  const [originalPhones,         setOriginalPhones]         = useState([]);
  const [originalAddresses,      setOriginalAddresses]      = useState([]);
  const [originalEmails,         setOriginalEmails]         = useState([]);

  const [editedLegalIds,        setEditedLegalIds]    = useState([]);
  const [editedEmailIds,        setEditedEmailIds]    = useState([]);
  const [editedPhoneIds,        setEditedPhoneIds]    = useState([]);
  const [editedAddressIds,      setEditedAddressIds]  = useState([]);

	useEffect(() => {
		seteditMode(props.edit_mode);
	}, [props.edit_mode]);


 const [selects, setSelects] = useState(null);

  const [objectResult, setObjectResult] = useState({});

  const [mount, setMount] = useState(false);



  useEffect(() => {
    if (props.selects){
      setSelects(props.selects);
    }
  }, [props.selects]);

  useEffect(() => {
    console.log('CALLBACK CALLBACK', props.data)
    if (props.data?.id){
      setItemId(props.data?.id);
      setObjectResult(props.data);

      // setName(props.data?.name);
      setSite(props.data?.site);
      setId8org_regions(props.data?.id8org_regions);
      setId8org_towns(props.data?.id8org_towns);

      setAddresses(props.data?.address);
      setLegaladdresses(props.data?.legaladdresses);
      setPhones(props.data?.phones);
      setEmails(props.data?.emails);

      if (!mount){
        setOriginalAddresses(      JSON.parse(JSON.stringify(props.data.address    )));
        setOriginalLegaladdresses( JSON.parse(JSON.stringify(props.data.legaladdresses )));
        setOriginalPhones(         JSON.parse(JSON.stringify(props.data.phones     )));
        setOriginalEmails(         JSON.parse(JSON.stringify(props.data.emails )));
        setMount(true);
      }

    }
  }, [props.data, selects]);



  useEffect(() => {
    const timer = setTimeout(() => {
      if (objectResult.id == null) {
        // Объект ещё не смонтировался. воизбежание гонок
        return;
      }
      let result = newAddresses.concat(addresses);
      if (props.on_change) {
        props.on_change('address', result);
      }
    }, 220);
    return () => clearTimeout(timer);
    
  }, [
    addresses,
    newAddresses
  ]);

    useEffect(() => {
    const timer = setTimeout(() => {
      if (objectResult.id == null) {
        // Объект ещё не смонтировался. воизбежание гонок
        return;
      }
      let result = newLegaladdresses.concat(legaladdresses);
      if (props.on_change) {
        console.log('118', legaladdresses, newLegaladdresses);
        props.on_change('legaladdresses', result);
      }
    }, 220);
    return () => clearTimeout(timer);
    
  }, [
    legaladdresses,
    newLegaladdresses
  ]);

    useEffect(() => {
    const timer = setTimeout(() => {
      if (objectResult.id == null) {
        // Объект ещё не смонтировался. воизбежание гонок
        return;
      }
      let result = newPhones.concat(phones);
      if (props.on_change) {
        props.on_change('phones', result);
      }
    }, 220);
    return () => clearTimeout(timer);
    
  }, [
    phones,
    newPhones
  ]);

    useEffect(() => {
    const timer = setTimeout(() => {
      if (objectResult.id == null) {
        // Объект ещё не смонтировался. воизбежание гонок
        return;
      }
      let result = newEmails.concat(emails);
      if (props.on_change) {
        props.on_change('emails', result);
      }
    }, 220);
    return () => clearTimeout(timer);
    
  }, [
    emails,
    newEmails
  ]);


// ░█████████  ░██                                                    
// ░██     ░██ ░██                                                    
// ░██     ░██ ░████████   ░███████  ░████████   ░███████   ░███████  
// ░█████████  ░██    ░██ ░██    ░██ ░██    ░██ ░██    ░██ ░██        
// ░██         ░██    ░██ ░██    ░██ ░██    ░██ ░█████████  ░███████  
// ░██         ░██    ░██ ░██    ░██ ░██    ░██ ░██               ░██ 
// ░██         ░██    ░██  ░███████  ░██    ░██  ░███████   ░███████  
  /* ----------------- PHONES --------------------- */
/**
   * Добавление нового элемента в стек новых
   */
  const handleAddPhone = ()=>{
    let item = {
          id: 'new_' + dayjs().unix() + '_' + newPhones.length ,
          id_orgs:  itemId,
          number: '',
          ext: '',
          comment: '',
          deleted: 0,
          command: "create",
        };
    setNewPhones([...newPhones, item]);
  }

  /**
   * Удаление напрочь только что добавленной записи
   * @param {*} id 
   */
  const handleDeleteNewPhone = (id) => {
    console.log('delete', id)
    setNewPhones(newPhones.filter((item)=>item.id !== id));
  }

  /**
   * Обновление новой только что добавленной записи
   * @param {*} id 
   * @param {*} data 
   * @returns 
   */
  const handleUpdateNewPhoneUnit = (id, data) => {
    // let udata = originalData.filter((item) => item.id !== id);
    // udata.push(data);
    console.log('CALL TU NEW UPDATE');
    if (!editMode) {
      return;
    }

    data.command = 'create';

    setNewPhones((prevUnits) => {
      const exists = prevUnits.some((item) => item.id === id);
      if (!exists) {
        return [...prevUnits, data];
      } else {
        return prevUnits.map((item) => (item.id === id ? data : item));
      }
    });
  };

  /**
   * Обновление и удаление существующей записи
   * @param {*} id 
   * @param {*} data 
   * @returns 
   */
  const handleUpdatePhoneUnit = (id, data) => {
    // let udata = originalData.filter((item) => item.id !== id);
    // udata.push(data);
    console.log('CALL TU REAL UPDATE');
    if (!editMode) {
      return;
    }

    const excluders = ['command', 'date'];
    let is_original = false;

    originalPhones.forEach((element) => {
      if (element.id === id) {
        console.log('element, data', element, data)
        is_original = compareObjects(element, data, {
          excludeFields: excluders,
          compareArraysDeep: false,
          ignoreNullUndefined: true,
        });
      }
    });
    console.log('is_original', is_original)
    if (is_original === false) {
      if (!editedPhoneIds?.includes(id)) {
        setEditedPhoneIds([...editedPhoneIds, id]);
      }
      data.command = "update";
    } else {
      if (editedPhoneIds?.includes(id)) {
        setEditedPhoneIds(editedPhoneIds.filter((item) => item !== id));
      }
      data.command = '';
    }
    if (data.deleted === true){
      data.command = "delete";
    } 

    console.log('data phone', data)
    setPhones((prevUnits) => {
      const exists = prevUnits.some((item) => item.id === id);
      if (!exists) {
        return [...prevUnits, data];
      } else {
        return prevUnits.map((item) => (item.id === id ? data : item));
      }
    });
  };


  /* ----------------- PHONES END --------------------- */






// ░██         ░██████████   ░██████     ░███    ░██         
// ░██         ░██          ░██   ░██   ░██░██   ░██         
// ░██         ░██         ░██         ░██  ░██  ░██         
// ░██         ░█████████  ░██  █████ ░█████████ ░██         
// ░██         ░██         ░██     ██ ░██    ░██ ░██         
// ░██         ░██          ░██  ░███ ░██    ░██ ░██         
// ░██████████ ░██████████   ░█████░█ ░██    ░██ ░██████████ 
  /* ----------------- LAWADDRESS --------------------- */
/**
   * Добавление нового элемента в стек новых
   */
  const handleAddLegalad = ()=>{
    let item = {
          id: 'new_' + dayjs().unix() + '_' + newLegaladdresses.length ,
          id_orgs:  itemId,
          address: '',
          post_index: '',
          comment: '',
          deleted: 0,
          command: "create",
        };
    setNewLegaladdresses([...newLegaladdresses, item]);
  }

  /**
   * Удаление напрочь только что добавленной записи
   * @param {*} id 
   */
  const handleDeleteNewLegalad = (id) => {
    console.log('delete', id)
    setNewLegaladdresses(newLegaladdresses.filter((item)=>item.id !== id));
  }

  /**
   * Обновление новой только что добавленной записи
   * @param {*} id 
   * @param {*} data 
   * @returns 
   */
  const handleUpdateNewLegaladUnit = (id, data) => {
    // let udata = originalData.filter((item) => item.id !== id);
    // udata.push(data);
    console.log('CALL TU NEW UPDATE');
    if (!editMode) {
      return;
    }

    data.command = 'create';

    setNewLegaladdresses((prevUnits) => {
      const exists = prevUnits.some((item) => item.id === id);
      if (!exists) {
        return [...prevUnits, data];
      } else {
        return prevUnits.map((item) => (item.id === id ? data : item));
      }
    });
  };

  /**
   * Обновление и удаление существующей записи
   * @param {*} id 
   * @param {*} data 
   * @returns 
   */
  const handleUpdateLegaladUnit = (id, data) => {
    // let udata = originalData.filter((item) => item.id !== id);
    // udata.push(data);
    console.log('CALL TU REAL UPDATE');
    if (!editMode) {
      return;
    }

    const excluders = ['command', 'date'];
    let is_original = false;

    originalLegaladdresses.forEach((element) => {
      if (element.id === id) {
        console.log('element, data', element, data)
        is_original = compareObjects(element, data, {
          excludeFields: excluders,
          compareArraysDeep: false,
          ignoreNullUndefined: true,
        });
      }
    });
    console.log('is_original', is_original)
    if (is_original === false) {
      if (!editedLegalIds?.includes(id)) {
        setEditedLegalIds([...editedLegalIds, id]);
      }
      data.command = "update";
    } else {
      if (editedLegalIds?.includes(id)) {
        setEditedLegalIds(editedLegalIds.filter((item) => item !== id));
      }
      data.command = '';
    }
    if (data.deleted === true){
      data.command = "delete";
    } 

    console.log('data legal', data)
    setLegaladdresses((prevUnits) => {
      const exists = prevUnits.some((item) => item.id === id);
      if (!exists) {
        return [...prevUnits, data];
      } else {
        return prevUnits.map((item) => (item.id === id ? data : item));
      }
    });
  };


  /* ----------------- LAWADDRESS END --------------------- */





//    ░███    ░███████   ░███████   ░█████████  ░██████████   ░██████     ░██████   
//   ░██░██   ░██   ░██  ░██   ░██  ░██     ░██ ░██          ░██   ░██   ░██   ░██  
//  ░██  ░██  ░██    ░██ ░██    ░██ ░██     ░██ ░██         ░██         ░██         
// ░█████████ ░██    ░██ ░██    ░██ ░█████████  ░█████████   ░████████   ░████████  
// ░██    ░██ ░██    ░██ ░██    ░██ ░██   ░██   ░██                 ░██         ░██ 
// ░██    ░██ ░██   ░██  ░██   ░██  ░██    ░██  ░██          ░██   ░██   ░██   ░██  
// ░██    ░██ ░███████   ░███████   ░██     ░██ ░██████████   ░██████     ░██████   
  /* ----------------- ADDRESS --------------------- */
/**
   * Добавление нового элемента в стек новых
   */
  const handleAddAddress = ()=>{
    let item = {
          id: 'new_' + dayjs().unix() + '_' + newAddresses.length ,
          id_orgs:  itemId,
          address: '',
          post_index: '',
          comment: '',
          deleted: 0,
          command: "create",
        };
    setNewAddresses([...newAddresses, item]);
  }

  /**
   * Удаление напрочь только что добавленной записи
   * @param {*} id 
   */
  const handleDeleteNewAddress = (id) => {
    console.log('delete', id)
    setNewAddresses(newAddresses.filter((item)=>item.id !== id));
  }

  /**
   * Обновление новой только что добавленной записи
   * @param {*} id 
   * @param {*} data 
   * @returns 
   */
  const handleUpdateNewAddressUnit = (id, data) => {
    // let udata = originalData.filter((item) => item.id !== id);
    // udata.push(data);
    console.log('CALL TU NEW UPDATE');
    if (!editMode) {
      return;
    }

    data.command = 'create';

    setNewAddresses((prevUnits) => {
      const exists = prevUnits.some((item) => item.id === id);
      if (!exists) {
        return [...prevUnits, data];
      } else {
        return prevUnits.map((item) => (item.id === id ? data : item));
      }
    });
  };

  /**
   * Обновление и удаление существующей записи
   * @param {*} id 
   * @param {*} data 
   * @returns 
   */
  const handleUpdateAddressUnit = (id, data) => {
    // let udata = originalData.filter((item) => item.id !== id);
    // udata.push(data);
    console.log('CALL TU REAL UPDATE');
    if (!editMode) {
      return;
    }

    const excluders = ['command', 'date'];
    let is_original = false;

    originalAddresses.forEach((element) => {
      if (element.id === id) {
        console.log('element, data', element, data)
        is_original = compareObjects(element, data, {
          excludeFields: excluders,
          compareArraysDeep: false,
          ignoreNullUndefined: true,
        });
      }
    });
    console.log('is_original', is_original)
    if (is_original === false) {
      if (!editedAddressIds?.includes(id)) {
        setEditedAddressIds([...editedAddressIds, id]);
      }
      data.command = "update";
    } else {
      if (editedAddressIds?.includes(id)) {
        setEditedAddressIds(editedAddressIds.filter((item) => item !== id));
      }
      data.command = '';
    }
    if (data.deleted === true){
      data.command = "delete";
    } 

    console.log('data email', data)
    setAddresses((prevUnits) => {
      const exists = prevUnits.some((item) => item.id === id);
      if (!exists) {
        return [...prevUnits, data];
      } else {
        return prevUnits.map((item) => (item.id === id ? data : item));
      }
    });
  };


  /* ----------------- ADDRESS END --------------------- */




// ░██████████ ░███     ░███    ░███    ░██████░██           ░██████   
// ░██         ░████   ░████   ░██░██     ░██  ░██          ░██   ░██  
// ░██         ░██░██ ░██░██  ░██  ░██    ░██  ░██         ░██         
// ░█████████  ░██ ░████ ░██ ░█████████   ░██  ░██          ░████████  
// ░██         ░██  ░██  ░██ ░██    ░██   ░██  ░██                 ░██ 
// ░██         ░██       ░██ ░██    ░██   ░██  ░██          ░██   ░██  
// ░██████████ ░██       ░██ ░██    ░██ ░██████░██████████   ░██████   
  /* ----------------- EMAILS --------------------- */
/**
   * Добавление нового элемента в стек новых
   */
  const handleAddEmail = ()=>{
    let item = {
          id: 'new_' + dayjs().unix() + '_' + newEmails.length ,
          id_orgs:  itemId,
          email: '',
          comment: '',
          deleted: 0,
          command: "create",
        };
    setNewEmails([...newEmails, item]);
  }

  /**
   * Удаление напрочь только что добавленной записи
   * @param {*} id 
   */
  const handleDeleteNewEmail = (id) => {
    console.log('delete', id)
    setNewEmails(newEmails.filter((item)=>item.id !== id));
  }

  /**
   * Обновление новой только что добавленной записи
   * @param {*} id 
   * @param {*} data 
   * @returns 
   */
  const handleUpdateNewEmailUnit = (id, data) => {
    // let udata = originalData.filter((item) => item.id !== id);
    // udata.push(data);
    console.log('CALL TU NEW UPDATE');
    if (!editMode) {
      return;
    }

    data.command = 'create';

    setNewEmails((prevUnits) => {
      const exists = prevUnits.some((item) => item.id === id);
      if (!exists) {
        return [...prevUnits, data];
      } else {
        return prevUnits.map((item) => (item.id === id ? data : item));
      }
    });
  };

  /**
   * Обновление и удаление существующей записи
   * @param {*} id 
   * @param {*} data 
   * @returns 
   */
  const handleUpdateEmailUnit = (id, data) => {
    // let udata = originalData.filter((item) => item.id !== id);
    // udata.push(data);
    console.log('CALL TU REAL UPDATE 453645');
    if (!editMode) {
      return;
    }

    const excluders = ['command', 'date'];
    let is_original = false;

    originalEmails.forEach((element) => {
      if (element.id === id) {
        console.log('element, data', element, data)
        is_original = compareObjects(element, data, {
          excludeFields: excluders,
          compareArraysDeep: false,
          ignoreNullUndefined: true,
        });
      }
    });
    console.log('is_original', is_original)
    if (is_original === false) {
      if (!editedEmailIds?.includes(id)) {
        setEditedEmailIds([...editedEmailIds, id]);
      }
      data.command = "update";
    } else {
      if (editedEmailIds?.includes(id)) {
        setEditedEmailIds(editedEmailIds.filter((item) => item !== id));
      }
      data.command = '';
    }
    if (data.deleted === true){
      data.command = "delete";
    } 

    console.log('data email', data)
    setEmails((prevUnits) => {
      const exists = prevUnits.some((item) => item.id === id);
      if (!exists) {
        return [...prevUnits, data];
      } else {
        return prevUnits.map((item) => (item.id === id ? data : item));
      }
    });
  };


  /* ----------------- EMAILS END --------------------- */







	return (
		<div className={'sk-omt-stack'} style={{ borderLeft: '0px solid ' + props.color }}>

			<OrgPageSectionRow
        key={'opcontin_112'}
				edit_mode={editMode}
				titles={['Город', "Регион"]}
				datas={[
          {
						type: OPS_TYPE.SELECT,
						value: id8org_towns,
						max: 2150,
            // options: selects?.towns.filter((item)=>item.id_region === id8org_regions).map((item)=>({
            options: selects?.towns.map((item)=>({
              key: "twnitm_" + item.value,
              value: parseInt(item.value),
              label: item.name
            })),
						required: false,
						nullable: true,
						placeholder: '',
            showSearch: true,
						name: 'id8org_towns',
					},
          {
						type: OPS_TYPE.SELECT,
						value: id8org_regions,
						max: 2150,
						required: false,
						nullable: true,
            options: selects?.regions.map((item)=>({
              key: "regitm_" + item.value,
              value: parseInt(item.value),
              label: item.name
            })),
						placeholder: '',
            showSearch: true,
						name: 'id8org_regions',
					}
				]}
        

        // on_change={(data)=>{
        //   console.log(data);
        // }}
        on_blur={(data)=>{
          console.log(data, selects.towns);
          if (data.id8org_towns) { setId8org_towns(data.id8org_towns);
            let ttown = selects?.towns.find((item)=> item.value === data.id8org_towns);
            if (ttown){
              if (ttown.id_region !== id8org_regions){
                setId8org_regions(ttown.id_region);
              }
            }

           };
          if (data.id8org_regions) {setId8org_regions(data.id8org_regions) };


          if (props.on_blur){
            props.on_blur(data);
          }
        }}
			/>

      <div>
      {addresses.map((item)=>(
        <OPMTinfoContactAddressSection
          key={'OPMTinfoContactAddressSection' + item.id}
          data={item}
          edit_mode={editMode}
          on_change={handleUpdateAddressUnit}
        />
      ))}</div>
      {newAddresses.length > 0 && (
        <div className='sa-org-temp-stack-collapse'>
        {newAddresses.map((item)=>(
          <OPMTinfoContactAddressSection
            key={'newOPMTinfoContactAddressSection' + item.id}
            data={item}
            edit_mode={editMode}
            on_delete={handleDeleteNewAddress}
            on_change={handleUpdateNewAddressUnit}
          />
        ))}</div>
      )}

      <div>
      {legaladdresses.map((item)=>(
        <OPMTinfoContactLegalAddressSection
          key={'OPMTinfoContactLegalAddressSection' + item.id}
          data={item}
          edit_mode={editMode}
          on_change={handleUpdateLegaladUnit}
        />
      ))}</div>
      {newLegaladdresses.length > 0 && (
        <div className='sa-org-temp-stack-collapse'>
        {newLegaladdresses.map((item)=>(
          <OPMTinfoContactLegalAddressSection
            key={'newOPMTinfoContactLegalAddressSection' + item.id}
            data={item}
            edit_mode={editMode}
            on_delete={handleDeleteNewLegalad}
            on_change={handleUpdateNewLegaladUnit}
          />
        ))}</div>
      )}

      <div>
      {phones.map((item)=>(
        <OPMTinfoContactPhoneSection
          key={'OPMTCcontactemailsSection' + item.id}
          data={item}
          edit_mode={editMode}
          on_change={handleUpdatePhoneUnit}
        />
      ))}</div>
      {newPhones.length > 0 && (
        <div className='sa-org-temp-stack-collapse'>
        {newPhones.map((item)=>(
          <OPMTinfoContactPhoneSection
            key={'newOPMTinfoContactEmailSection' + item.id}
            data={item}
            edit_mode={editMode}
            on_delete={handleDeleteNewPhone}
            on_change={handleUpdateNewPhoneUnit}
          />
        ))}</div>
      )}

      <div>
      {emails.map((item)=>(
        <OPMTinfoContactEmailSection
          key={'OPMTinfoContactEmailSection' + item.id}
          data={item}
          edit_mode={editMode}
          on_change={handleUpdateEmailUnit}
        />
      ))}</div>
      {newEmails.length > 0 && (
        <div className='sa-org-temp-stack-collapse'>
        {newEmails.map((item)=>(
          <OPMTinfoContactEmailSection
            key={'newOPMTinfoContactEmailSection' + item.id}
            data={item}
            edit_mode={editMode}
            on_delete={handleDeleteNewEmail}
            on_change={handleUpdateNewEmailUnit}
          />
        ))}</div>
      )}


			<OrgPageSectionRow
        key={'opcontin_111'}
				edit_mode={editMode}
				titles={['Сайт']}
				datas={[

          {
						type: OPS_TYPE.STRING,
						value: site,
						max: 150,
						required: false,
						nullable: true,
						placeholder: '',
						name: 'site',
					}
				]}
        
        on_blur={(data)=>{
          if (data.site) {setSite(data.site) };
          if (props.on_blur){
            props.on_blur(data);
          }
        }}
			/>




    {editMode && (
      <Affix offsetBottom={0}>
      <div className={'sk-omt-stack-control sa-flex-space'}>
        <div></div>
        <div>
          <div className={'sa-org-contactstack-addrow'}>
            Добавить
            <div>


              <Button
                title='Добавить адрес'
                size='small'
                color="primary"
                variant="outlined"
                icon={<BuildingOfficeIcon height={'20px'}/>}
                onClick={(ev) => {
                  ev.stopPropagation();
                  handleAddAddress();
                }}
                >Адрес</Button>
                {legaladdresses.length + newLegaladdresses < 1 && (
                  <Button
                  title='Добавить юр. адрес'
                  size='small'
                  icon={<BuildingLibraryIcon height={'20px'}/>}
                  color="primary"
                  variant="outlined"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    handleAddLegalad();
                  }}
                  >Юр. Адрес</Button>
                )}

              <Button
                title='Добавить контактный телефон'
                size='small'
                color="primary"
                variant="outlined"
                icon={<PhoneIcon height={'20px'}/>}
                onClick={(ev) => {
                  ev.stopPropagation();
                  handleAddPhone();
                }}
                >Телефон</Button>
              <Button
                title='Добавить эл. почту'
                size='small'
                color="primary"
                variant="outlined"
                icon={<EnvelopeIcon height={'20px'}/>}
                onClick={(ev) => {
                  ev.stopPropagation();
                  handleAddEmail();
                }}
                >Эл. почту</Button>

                </div>
            </div>
        </div>
      </div>
    </Affix>
      )}
		</div>
	);
};

export default OrgPage_MainTab_Contactinfo_Section;
