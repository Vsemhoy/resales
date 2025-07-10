import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import ScheduleFlexIcon from '../../../assets/Comicon/Schedule/ScheduleFlexIcon';
import ScheduleEmptyIcon from '../../../assets/Comicon/Schedule/ScheduleEmptyIcon';
import ScheduleFreeIcon from '../../../assets/Comicon/Schedule/ScheduleFreeIcon';
import ScheduleShiftIcon from '../../../assets/Comicon/Schedule/ScheduleShiftIcon';
import ScheduleStandardIcon from '../../../assets/Comicon/Schedule/ScheduleStandardIcon';
import ScheduleSumIcon from '../../../assets/Comicon/Schedule/ScheduleSumIcon';
import BullZodiacIcon from '../../../assets/Comicon/Zodiac/BullZodiacIcon';
import CatZodiacIcon from '../../../assets/Comicon/Zodiac/CatZodiacIcon';
import GazelleZodiacIcon from '../../../assets/Comicon/Zodiac/GazelleZodiacIcon';
import { Affix, Button } from 'antd';
import DogRunZodiacIcon from '../../../assets/Comicon/Zodiac/DogRunZodiacIcon';
import HorseZodiacIcon from '../../../assets/Comicon/Zodiac/HorseZodiacIcon';
import MonkeyZodiacIcon from '../../../assets/Comicon/Zodiac/MonkeyZodiacIcon';
import MouseZodiacIcon from '../../../assets/Comicon/Zodiac/MouseZodiacIcon';
import OwlZodiacIcon from '../../../assets/Comicon/Zodiac/OwlZodiacIcon';
import PigZodiacIcon from '../../../assets/Comicon/Zodiac/PigZodiacIcon';
import PigeonZodiacIcon from '../../../assets/Comicon/Zodiac/PigeonZodiacIcon';
import RabbitZodiacIcon from '../../../assets/Comicon/Zodiac/RabbitZodiacIcon';
import SnakeZodiacIcon from '../../../assets/Comicon/Zodiac/SnakeZodiacIcon';
import TyranosaurusZodiacIcon from '../../../assets/Comicon/Zodiac/TyranosaurusZodiacIcon';
import DragonZodiacIcon from '../../../assets/Comicon/Zodiac/DragonZodiacIcon';
import TigerZodiacIcon from '../../../assets/Comicon/Zodiac/TigerZodiacIcon';
import BedRuleIcon from '../../../assets/Comicon/Rule/BedRuleIcon';
import BirdRuleIcon from '../../../assets/Comicon/Rule/BirdRuleIcon';
import AshtrayRuleIcon from '../../../assets/Comicon/Rule/AshtrayRuleIcon';
import TrashbinMorningRuleIcon from '../../../assets/Comicon/Rule/TrashbinMorningRuleIcon';
import TrashbinEveningRuleIcon from '../../../assets/Comicon/Rule/TrashbinEveningRuleIcon';
import PiggyBankRuleIcon from '../../../assets/Comicon/Rule/PiggyBankRuleIcon';
import LockRuleIcon from '../../../assets/Comicon/Rule/LockRuleIcon';

const baseIcons = [
    {name: 'ScheduleEmptyIcon', Icon: ScheduleEmptyIcon },
    {name: 'ScheduleFlexIcon', Icon: ScheduleFlexIcon },
    {name: 'ScheduleFreeIcon', Icon: ScheduleFreeIcon },
    {name: 'ScheduleShiftIcon', Icon: ScheduleShiftIcon},
    {name: 'ScheduleStandardIcon', Icon: ScheduleStandardIcon},
    {name: 'ScheduleSumIcon', Icon: ScheduleSumIcon},
    {name: 'BullZodiacIcon', Icon: BullZodiacIcon},
    {name: 'CatZodiacIcon', Icon: CatZodiacIcon},
    {name: 'GazelleZodiacIcon', Icon: GazelleZodiacIcon},
    {name: 'DogRunZodiacIcon', Icon: DogRunZodiacIcon},
    {name: 'HorseZodiacIcon', Icon: HorseZodiacIcon},
    {name: 'MonkeyZodiacIcon', Icon: MonkeyZodiacIcon},
    {name: 'MouseZodiacIcon', Icon: MouseZodiacIcon},
    {name: 'OwlZodiacIcon', Icon: OwlZodiacIcon},
    {name: 'PigZodiacIcon', Icon: PigZodiacIcon},
    {name: 'PigeonZodiacIcon', Icon: PigeonZodiacIcon},
    {name: 'RabbitZodiacIcon', Icon: RabbitZodiacIcon},
    {name: 'SnakeZodiacIcon', Icon: SnakeZodiacIcon},
    {name: 'TyranosaurusZodiacIcon', Icon: TyranosaurusZodiacIcon},
    {name: 'DragonZodiacIcon', Icon: DragonZodiacIcon},
    {name: 'TigerZodiacIcon', Icon: TigerZodiacIcon},
    {name: 'BedRuleIcon', Icon: BedRuleIcon},
    {name: 'BirdRuleIcon', Icon: BirdRuleIcon},
    {name: 'AshtrayRuleIcon', Icon: AshtrayRuleIcon},
    {name: 'TrashbinMorningRuleIcon', Icon: TrashbinMorningRuleIcon},
    {name: 'TrashbinEveningRuleIcon', Icon: TrashbinEveningRuleIcon},
    {name: 'PiggyBankRuleIcon', Icon: PiggyBankRuleIcon},
    {name: 'LockRuleIcon', Icon: LockRuleIcon},
]

const CustomIconPage = (props) => {
  const [iconToFind, setIconToFind] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('SmileOutlined');
  const [filteredIcons, setFilteredIcons] = useState([]);
  const [type, setType] = useState('Outlined');

    useEffect(() => {
      setFilteredIcons(baseIcons);
    }, [baseIcons]);

  return (
    <div style={{background: 'white'}}>
        <h1>Custom Icon Ultra Pro Pack 3 <NavLink to="/dev/icons/antdicons">{`>>>`}</NavLink></h1>
        <h3>
            <div className={'sa-flex-space sa-flex-gap'}>
                <div></div>
                <div>
                    <NavLink to={'/dev/icons/customicons'} >
                        <Button variant="link" color="danger" size='large' >Custom</Button>
                    </NavLink>
                    <NavLink to={'/dev/icons/antdicons'} >
                        <Button variant="link" color="primary" size='large'>ANTD</Button>
                    </NavLink>
                    <NavLink to={'/dev/icons/heroicons24'} >
                        <Button variant="link" color="primary" size='large'>Hero24</Button>
                    </NavLink>
                </div>
                <div></div>
            </div>
            </h3>

        <Affix offsetTop={0}>      <div style={{background: '#770000bb', color: 'white', padding: '12px', fontFamily: 'monospace', fontSize: '1.3em', backdropFilter: 'blur(20px)' }}>{`
            import { ${selectedIcon} } from '../../../assets/Comicon/Schedule/${selectedIcon}';
        `}</div>
        </Affix>

        <br />
        <br />
        <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '32px',
        }}>
            {filteredIcons.length > 0 ? (
          filteredIcons.map(({name, Icon}) => (
            <div
              key={name}
              onClick={() => setSelectedIcon(name)}
              style={{
                width: 120,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                color: name === selectedIcon ? '#1890ff' : '#333',
                userSelect: 'none',
                transition: 'color 0.3s',
              }}
              title={name}
            >
              <Icon height={'88px'}/>
              {/* <ScheduleStandardIcon  height='88px'/> */}
              <div
                style={{
                  marginTop: 8,
                  fontSize: 'medium',
                  textAlign: 'center',
                  wordBreak: 'break-word',
                }}
              >
                {name}
              </div>
            </div>
          ))
        ) : (
          <div style={{ fontSize: 16, color: '#999' }}>Иконки не найдены</div>
        )}

        </div>
              <Affix offsetBottom={0}>
                <p style={{background: '#00709f94', padding: '6px', fontFamily: 'monospace', fontSize: 'xx-large', height:'32px', marginTop: '2px', backdropFilter: 'blur(20px)'}}>{`
                <${selectedIcon} />
              `}</p>
              </Affix>
        </div>
  );
};

export default CustomIconPage;


        {/* <p style={{background: '#e3e3e3', padding: '12px', fontFamily: 'monospace', fontSize: '1.3em'}}>{`
            <Icon style={{ width: 48, height: 48 }} />FaceSmileIcon</Icon>
        `}</p> */}
        {/* <Affix offsetTop={0}>      <div style={{background: '#770000bb', color: 'white', padding: '12px', fontFamily: 'monospace', fontSize: '1.3em', backdropFilter: 'blur(20px)' }}>{`
            import { ${selectedIcon} } from '@heroicons/react/24/${type}';
        `}</div>
        </Affix> */}

{/* 
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
        </Card> */}