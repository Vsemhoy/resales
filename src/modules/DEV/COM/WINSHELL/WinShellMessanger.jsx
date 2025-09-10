import React, { useEffect, useState } from 'react';
import WinShell from './WinShell';
import { Avatar, Comment, Card, List, Button } from 'antd';
import Meta from 'antd/es/card/Meta';
import { CheckOutlined, LeftSquareOutlined, UploadOutlined } from '@ant-design/icons';
import Search from 'antd/es/input/Search';
import TextArea from 'antd/es/input/TextArea';
import dayjs from 'dayjs';

const messages = [
  {
    id: 7384,
    username: "Тик Слоу Мэн",
    message: "Я вчера пытался объяснить холодильнику, почему нельзя есть носки, но он меня игнорировал, как будто... ",
    isRead: false
  },
  {
    id: 1923,
    username: "Бабуля В Тапочках",
    message: "Купила лазерную указку для кота, теперь он думает, что это душа его врага и охотится по ночам, пока я... ",
    isRead: true
  },
  {
    id: 4451,
    username: "Пончик Громозека",
    message: "Если бы пончики умели говорить, они бы первым делом потребовали отставки президента вишнёвого джема, потому что его политика... ",
    isRead: false
  },
  {
    id: 8827,
    username: "Сэр Квакус Магнус",
    message: "Мой унитаз сегодня вёл себя подозрительно — булькал на мотив Бетховена и требовал чаевые, так что я начал... ",
    isRead: true
  },
  {
    id: 3095,
    username: "Лунный Йог Капустович",
    message: "Сел медитировать на балконе, но голуби решили, что я — статуя для помета, и теперь моя чакра солнечного сплетения... ",
    isRead: false
  },
  {
    id: 6174,
    username: "Дядя Бульбаш",
    message: "Заказал себе робота-помощника, а он вместо уборки начал писать сонеты про пылесос и требует авторских прав на ковёр, так что... ",
    isRead: true
  },
  {
    id: 2568,
    username: "Принцесса Пельмешка",
    message: "Объявила войну микроволновке, потому что она подмигнула мне, когда я просил разогреть суп, и теперь вся кухня знает, что... ",
    isRead: false
  },
  {
    id: 9342,
    username: "Профессор Бульон",
    message: "Доказал, что чай с молоком — это портал в параллельную вселенную, но забыл, как вернуться, поэтому сижу и жду, пока... ",
    isRead: true
  },
  {
    id: 1059,
    username: "Граф Пыльный",
    message: "Моя подушка сегодня подписала контракт с Netflix и теперь отказывается вставать до полудня, мотивируя это «творческим перерывом», так что... ",
    isRead: false
  },
  {
    id: 7730,
    username: "Тётя Вибрация",
    message: "Купила тапочки с GPS, чтобы не терять их по утрам, но теперь они убегают сами — говорят, ищут лучшую жизнь на... ",
    isRead: true
  },
  {
    id: 5286,
    username: "Капитан Спагетти",
    message: "Попытался навигировать по квартире с компасом, но стрелка показывала на холодильник, и я начал подозревать, что еда управляет моей жизнью, пока... ",
    isRead: false
  },
  {
    id: 3914,
    username: "Мистер Бульк",
    message: "Мой будильник подал мне в суд за нарушение прав на сон, и теперь я должен ему 3 часа REM-фазы и пачку мармеладных мишек, иначе... ",
    isRead: true
  },
  {
    id: 6621,
    username: "Леди Какао",
    message: "Решила стать бариста для белок, но они требуют латте с желудями и оставляют чаевые в виде блестящих крышечек, поэтому я думаю, что... ",
    isRead: false
  },
  {
    id: 8493,
    username: "Доктор Плюх",
    message: "Поставил диагноз своей тени — хроническая лень и зависимость от солнца, выписал ей витамин D и запретил следовать за мной после... ",
    isRead: true
  },
  {
    id: 2750,
    username: "Шеф Бульонка",
    message: "Моя сковородка сегодня отказалась жарить яйца, сказала, что устала от однообразия и мечтает стать арт-объектом в Лувре, так что... ",
    isRead: false
  },
  {
    id: 5037,
    username: "Агент Шлёп",
    message: "Подозреваю, что мой Wi-Fi шпионит за мной — он сегодня лагал именно в моменты, когда я говорил что-то глупое, и я начал... ",
    isRead: true
  },
  {
    id: 9182,
    username: "Магистр Пух",
    message: "Надел шапку наизнанку, и теперь все мои мысли выходят задом наперёд, особенно про то, как приготовить омлет из носков, если... ",
    isRead: false
  },
  {
    id: 4369,
    username: "Баронесса Буль",
    message: "Мой чайник сегодня заявил, что он — перевоплощение Наполеона, и требует завоевать кухню, начиная с тостера, который, по его словам, предатель, потому что... ",
    isRead: true
  },
  {
    id: 1205,
    username: "Генерал Пельмень",
    message: "Объявил голодовку, но холодильник начал петь колыбельные, и я сдался на третьем куплете, потому что оказалось, что моя слабость — это... ",
    isRead: false
  },
  {
    id: 6843,
    username: "Волшебник Шлёп-Шлёп",
    message: "Пытался превратить кофе в золото, но вместо этого превратил тапочки в попкорн, и теперь кот смотрит на меня, как на мессию, пока я... ",
    isRead: true
  }
];


const chatMessages_src = [
  {
    id: 1001,
    user_id: 7384,
    username: "Тик Слоу Мэн",
    message: "Я сегодня договорился с пылесосом о перемирии, но он требует оплату в виде носков и угрожает забрать ковёр, если я... ",
    isRead: true,
    datetime: "2025-04-05T14:23:12Z"
  },
  {
    id: 1002,
    user_id: 1923,
    username: "Бабуля В Тапочках",
    message: "Мой кот вчера подал заявку на получение водительских прав, а сегодня украл мои тапочки и скрылся в шкафу, говоря, что это... ",
    isRead: true,
    datetime: "2025-04-05T14:25:47Z"
  },
  {
    id: 1003,
    user_id: 7384,
    message: "Если бы унитазы умели голосовать, они бы избрали президента туалетной бумаги, который обещает отменить понедельники и ввести налог на... ",
    isRead: true,
    datetime: "2025-04-05T14:27:03Z"
  },
  {
    id: 1004,
    user_id: 1923,
    message: "Я научила микроволновку петь колыбельные, но теперь она отказывается греть еду, пока я не спою ей про любовь и борщ, иначе... ",
    isRead: true,
    datetime: "2025-04-05T14:29:18Z"
  },
  {
    id: 1005,
    user_id: 7384,
    message: "Мой холодильник начал писать мемуары, и первая глава называется «Как я пережил диету хозяина и его попытки есть салат без... ",
    isRead: true,
    datetime: "2025-04-05T14:31:55Z"
  },
  {
    id: 1006,
    user_id: 1923,
    message: "Подозреваю, что моя подушка работает на инопланетян — она каждую ночь меняет позицию, а утром делает вид, что ничего не было, пока я... ",
    isRead: true,
    datetime: "2025-04-05T14:33:42Z"
  },
  {
    id: 1007,
    user_id: 7384,
    message: "Купил будильнику адвоката, потому что он обвинил меня в нарушении прав на сон, и теперь я должен ему дважды поспать и не... ",
    isRead: true,
    datetime: "2025-04-05T14:36:21Z"
  },
  {
    id: 1008,
    user_id: 1923,
    message: "Мой Wi-Fi сегодня заявил, что он — бывший шпион ЦРУ, и знает, где я прятал новогодние носки 2023 года, но не скажет, пока... ",
    isRead: true,
    datetime: "2025-04-05T14:38:09Z"
  },
  {
    id: 1009,
    user_id: 7384,
    message: "Попытался объяснить зеркалу, что я не выгляжу как пандемоний в пижаме, но оно только усмехнулось и показало мне мои тапочки, которые... ",
    isRead: true,
    datetime: "2025-04-05T14:40:33Z"
  },
  {
    id: 1010,
    user_id: 1923,
    message: "Моя кошка создала профсоюз домашних животных и требует 3-часовой обед, массаж шерсти и отмену понедельников, иначе начнётся забастовка... ",
    isRead: true,
    datetime: "2025-04-05T14:42:57Z"
  },
  {
    id: 1011,
    user_id: 7384,
    message: "Сегодня моя лампочка моргнула в ритме Морзе, и я начал подозревать, что она передаёт сообщения пришельцам, особенно когда я говорил про... ",
    isRead: false,
    datetime: "2025-04-05T14:45:14Z"
  },
  {
    id: 1012,
    user_id: 1923,
    message: "Заказала себе говорящий чайник, но он оказался философом и теперь спорит со мной о смысле бытия, пока вода не остыла, и я... ",
    isRead: false,
    datetime: "2025-04-05T14:47:30Z"
  },
  {
    id: 1013,
    user_id: 7384,
    message: "Мой тостер сегодня отказался поджаривать хлеб, сказав, что это форма насилия над злаками, и предложил перейти на медитацию и... ",
    isRead: false,
    datetime: "2025-04-05T14:49:02Z"
  },
  {
    id: 1014,
    user_id: 1923,
    message: "Обнаружила, что мои тапочки ведут дневник. Вчера записали: «Хозяйка опять пыталась нас надеть на левую ногу. Это уже третий раз. Мы... ",
    isRead: false,
    datetime: "2025-04-05T14:51:18Z"
  },
  {
    id: 1015,
    user_id: 7384,
    message: "Пытался научить холодильник играть в шахматы, но он съел все белые фигуры и заявил, что это «стратегический захват молочного сектора», пока... ",
    isRead: false,
    datetime: "2025-04-05T14:53:44Z"
  },
  {
    id: 1016,
    user_id: 1923,
    message: "Мой будильник теперь ставит мне ультиматумы: «Проснёшься сам — получишь кофе. Не проснёшься — включу Бетховена на полную громкость и... ",
    isRead: false,
    datetime: "2025-04-05T14:55:29Z"
  },
  {
    id: 1017,
    user_id: 7384,
    message: "Сегодня моя тень подала заявление на отпуск, сказав, что устала следовать за мной в дождь и хочет отдохнуть в стране, где... ",
    isRead: false,
    datetime: "2025-04-05T14:57:53Z"
  },
  {
    id: 1018,
    user_id: 1923,
    message: "Моя сковородка начала вести YouTube-канал «Жизнь на плите». Первое видео — «Как я пережила яичницу и не сошла с ума», и... ",
    isRead: false,
    datetime: "2025-04-05T15:00:11Z"
  },
  {
    id: 1019,
    user_id: 7384,
    message: "Купил зеркалу очки, чтобы оно перестало меня критиковать, но теперь оно говорит, что я выгляжу ещё хуже в аксессуарах, и... ",
    isRead: false,
    datetime: "2025-04-05T15:02:37Z"
  },
  {
    id: 1020,
    user_id: 1923,
    message: "Мой кот сегодня подписал контракт с Netflix на роль главного антагониста в сериале про борьбу с пылесосами, и теперь требует... ",
    isRead: false,
    datetime: "2025-04-05T15:04:59Z"
  }
];



const WinShellMessanger = (props) => {

    const [chatMessages, setChatMessages] = useState(chatMessages_src);

    const [isOpen, setIsOpen] = useState(true);
    
    const [activeChat, setActiveChat] = useState(null);
    const [contrName, setContrName] = useState(null);
    const [messageText, setMessageText] = useState("");
    
    const handleOpenChat = (val) => {
        setActiveChat(val);
    }

    const [currentUserId, setCurrentUserId] = useState(7384);

    const handleTexting = (ev) => {
        setMessageText(ev.target.value);
    }
const handleKeying = (ev) => {
  if (ev.key === 'Enter' && ev.ctrlKey) {
    if (ev.shiftKey) {
      // Shift+Enter — разрешаем перенос
      return;
    } else {
      // Просто Enter — отправляем
      ev.preventDefault();
      if (messageText.trim()) {
        // handleSendMessage(messageText);
        setChatMessages([...chatMessages, {
              id: 1020,
                user_id: activeChat,
                message:messageText.trim(),
                isRead: false,
                datetime: dayjs(),
        } ]);
        setMessageText('');
      }
    }
  }
};



  return (
        <>
            {isOpen && (

        <WinShell
          title='Hello wolf!'
          on_close={()=>{
            setIsOpen(false)
          }}
        >
            {activeChat === null ? (
          <div className={'winshell-stack'}>
            <div className='winshell-stack-top'>
                <Search ></Search>
            </div>

                <>
                    {messages.map((item) => (
                        <Card
                            key={item.id}
                            style={{ width: '100%', textAlign: 'left' }}
                            onClick={()=>{handleOpenChat(item.id);
                                setContrName(item.username)
                            }}

                        >
                            <Meta
                            title=<div className={'sa-flex-space'}><div>{item.username}</div>
                            <div>
                                {item.isRead ? <CheckOutlined /> : <UploadOutlined />}
                            </div></div>
                            description={item.message}
                            />
                        </Card>

                    ))}
                </>
          </div>
            ):(
                <div>
            <div className="winshell-stack">
                <div className='winshell-stack-top sa-flex'>
                <div>
                    <Button 
                        color="danger" variant="solid"
                        onClick={()=>{setActiveChat(null)}}
                    icon={<LeftSquareOutlined />}></Button>
                </div>
                <div>
                    <Search ></Search>

                </div>
                </div>
                { chatMessages.map((item)=>(
                    <div className={`chat-message ${item.user_id === currentUserId ? 'msg-self' : 'msg-other'}`}>
                        <div className='chat-m-card'>
                            <div></div>
                            <div><p>{item.message}</p></div>
                            <div>{new Date(item.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                        </div>
                    ))}
               
                </div>
                    <div className='winshell-message-area'>
                        <TextArea 
                            onChange={handleTexting}
                            value={messageText}
                            onKeyDown={handleKeying}
                            placeholder={`Дорогой ${contrName},...`}
                        >

                        </TextArea>
                    </div>
                </div>
            )}
          
        </WinShell>
            )}
        </>
  );
};

export default WinShellMessanger;