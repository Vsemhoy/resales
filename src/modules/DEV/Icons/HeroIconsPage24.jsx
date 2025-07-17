import React, { useEffect, useState } from 'react';
import * as HeroIcons from '@heroicons/react/24/outline';
import * as HeroIconsSolid from '@heroicons/react/24/solid';
import { Affix, Button, Card, Input } from 'antd';
import { NavLink } from 'react-router-dom';
import { AtSymbolIcon } from '@heroicons/react/16/solid';



const HeroIconsPage24 = () => {
  const [type, setType] = useState('solid');
  const [selectedIcon, setSelectedIcon] = useState('SunIcon');
  const [iconToFind, setIconToFind] = useState('');

  const beMap = (items)=>{
    return Object.entries(items).map(([name, Icon]) => [name, Icon]);
  }

  const [baseIcons, setBaseIcons] = useState(beMap(HeroIconsSolid));


  useEffect(() => {
    const iconsSet = (type === 'solid' ? beMap(HeroIconsSolid) : beMap(HeroIcons));
    if (iconToFind !== null && iconToFind.trim() !== '' && iconToFind.trim().length > 1){
      const filteredIcons = iconsSet.filter(([name, icon]) =>
        typeof(name) === 'string' &&
        (name.toString()).toLowerCase().includes(iconToFind.toLowerCase())
        // && console.log('name', name)
      );
      setBaseIcons(filteredIcons);
    } else {
      setBaseIcons(iconsSet);
    }
  }, [iconToFind, type]);



  return (
    <div style={{background: 'white'}}>
      <h1>Hero Icons 24 {type === "solid"? "solid" : 'outline'} <NavLink to="/dev/icons/antdicons"><AtSymbolIcon width={'32px'} /></NavLink></h1>
              <h3>
                  <div className={'sa-flex-space sa-flex-gap'}>
                      <div></div>
                      <div>
                          <NavLink to={'/dev/icons/customicons'} >
                              <Button variant="link" color="primary" size='large' >Custom</Button>
                          </NavLink>
                          <NavLink to={'/dev/icons/antdicons'} >
                              <Button variant="link" color="primary" size='large'>ANTD</Button>
                          </NavLink>
                          <NavLink to={'/dev/icons/heroicons24'} >
                              <Button variant="link" color="danger" size='large'>Hero24</Button>
                          </NavLink>
                      </div>
                      <div></div>
                  </div>
                </h3>
      {/* <p style={{background: '#e3e3e3', padding: '12px', fontFamily: 'monospace', fontSize: '1.3em'}}>{`
        <Icon style={{ width: 48, height: 48 }} />FaceSmileIcon</Icon>
      `}</p> */}
      <Affix offsetTop={0}>      <div style={{background: '#770000bb', color: 'white', padding: '12px', fontFamily: 'monospace', fontSize: '1.3em', backdropFilter: 'blur(20px)' }}>{`
        import { ${selectedIcon} } from '@heroicons/react/24/${type}';
      `}</div>
      </Affix>


      <Card>
        <div>
          <Input value={iconToFind} onChange={(ev)=> {setIconToFind(ev.target.value)}} allowClear style={{textAlign: 'center'}} size='large'/>
        </div>
        <br/>
        <div style={{display: 'flex', gridGap: '12px', alignItems: "center", justifyContent: 'center'}}>
        <Button
          color="default" variant="solid"
          onClick={()=>{setType("solid")}}
        >Solid</Button>
        <Button
          color="default" variant="outlined"
        onClick={()=>{setType("outline")}}
        >Outlined</Button>
        </div>
      </Card>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '32px',
        
      }}>
        {baseIcons.map(([name, Icon]) => (
          <div
            onClick={()=>{setSelectedIcon(name)}}
            key={name} style={{
            width: 120,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: `${(name === selectedIcon) ? "#1976D2" : "#333" }`
          }}>
            <Icon style={{ width: 48, height: 48 }} />
            <div style={{
              marginTop: 8,
              fontSize: 12,
              textAlign: 'center',
              wordBreak: 'break-all',
              fontSize: 'medium'
            }}>
              {name}
            </div>
          </div>
        ))}
      </div>

      <Affix offsetBottom={0}>
        <p style={{background: '#00709f94', padding: '6px', fontFamily: 'monospace', fontSize: 'xx-large', height:'32px', marginTop: '2px', backdropFilter: 'blur(20px)'}}>{`
        <${selectedIcon} />
      `}</p>
      </Affix>

    </div>
  );
};

export default HeroIconsPage24;