import { Tooltip } from "antd";
import dayjs from "dayjs";
import React from "react";


 export const DS_YEARMONTHS_SELECT = [
    {
        key: 'yearmonth00',
        value: 0,
        label: 'Все месяцы'
    },
    {
        key: 'yearmonth01',
        value: 1,
        label: 'Январь'
    },
    {
        key: 'yearmonth02',
        value: 2,
        label: 'Февраль'
    },
    {
        key: 'yearmonth03',
        value: 3,
        label: 'Март'
    },
    {
        key: 'yearmonth04',
        value: 4,
        label: 'Апрель'
    },
    {
        key: 'yearmonth05',
        value: 5,
        label: 'Май'
    },
    {
        key: 'yearmonth06',
        value: 6,
        label: 'Июнь'
    },
    {
        key: 'yearmonth07',
        value: 7,
        label: 'Июль'
    },
    {
        key: 'yearmonth08',
        value: 8,
        label: 'Август'
    },
    {
        key: 'yearmonth09',
        value: 9,
        label: 'Сентябрь'
    },
    {
        key: 'yearmonth10',
        value: 10,
        label: 'Октябрь'
    },
    {
        key: 'yearmonth11',
        value: 11,
        label: 'Ноябрь'
    },
    {
        key: 'yearmonth12',
        value: 12,
        label: 'Декабрь'
    }
];


/**
 * Укорачиваем полное имя до инициалов с фамилией
 * @param {*} surname 
 * @param {*} name 
 * @param {*} patronymic 
 * @returns 
 */
export const ShortName = (surname, name, patronymic) => {
    if (surname == null && patronymic == null){
        return name;
    }
    // Начинаем с фамилии
    let shortName = surname ? surname.trim() : '';
    // Добавляем первую букву имени, если оно есть
    if (name) {
        shortName += ` ${name.charAt(0)}.`; // Добавляем первую букву имени с точкой
    }
    // Добавляем первую букву отчества, если оно есть
    if (patronymic) {
        shortName += ` ${patronymic.charAt(0)}.`; // Добавляем первую букву отчества с точкой
    }

    return shortName;
};


export const FullNameWithOccupy = (user) => {
    if (!user){
        return <span></span>;
    };

    let ocName = "";


    if (user.surname){
        ocName += user.surname + " ";
    };
        if (user.name){
        ocName += user.name + " ";
    };
    if (user.secondname){
        ocName += user.secondname;
    };

        if (ocName.length && (user.surname || user.name)){
        ocName += ", ";
    };
    if (user.occupy){
        ocName += user.occupy;
    };

    let shortNameText = ShortName(user.surname, user.name, user.secondname);

    return <Tooltip title={ocName}>
        {shortNameText}
    </Tooltip>
        
}

export const generateYearOptions = () => {
    const startYear = 2014;
    let endYear = dayjs().year(); // Текущий год + 1

    if (dayjs().month() > 9){
        endYear = dayjs().year() + 1;
    }

    const yearsArray = [];
    for (let year = startYear; year <= endYear; year++) {
        yearsArray.push({
            key: 'yearkey_' + year.toString(),
            value: year,
            label: year.toString() // Преобразуем номер года в строку для label
        });
    }

    return yearsArray;
};

export const getMonthName = (number) => {
    let month = DS_YEARMONTHS_SELECT.find((el) => el.value === parseInt(number));
    return month.label;
};

export const secondsValueToGlobalTime = (seconds) => {
    const currentDate = dayjs();
    const startOfDay = currentDate.startOf('day');
    // return currentDate.diff(startOfDay, 'second');
    const timeForPicker = startOfDay.add(seconds, 'second');
    // console.log('SVGT', seconds, timeForPicker);
    return timeForPicker;
}

export const globalTimeToDaySeconds = (daytime) => {
    let seconds = daytime.unix();
    let start = daytime.startOf('day').unix();
    return seconds - start;
}

export const formatUnixToStringTime = (time)=>{
    let timeObj = dayjs.unix(time);
    return timeObj.format("HH:mm");
}


export const generateGradientBackground = (colors) => {
    // Проверяем, что массив не пустой
    if (!colors || colors.length === 0) {
        return '';
    }
    let steps = 100 / colors.length;

    let result = `linear-gradient(111deg, `;
    result += colors[0] + " 0%, ";
    for (let i = 1; i < colors.length; i++) {
        const prev = colors[i - 1];
        const current = colors[i];
        result += prev + " " + (steps * i - 0.1) + "%, ";
        result += current + " " + (steps * i) + "%, ";
    }
    result += colors[colors.length - 1] + " " + " 100%";
    result += ")";
    console.log(result);
    return result;
};


export const WordDayNumerate = (value) => {
    if (value % 10 === 1 && value % 100 !== 11) {
        return "день";
    } else if (value % 10 >= 2 && value % 10 <= 4 && (value % 100 < 10 || value % 100 >= 20)) {
        return "дня";
    } else {
        return "дней";
    }
}

export const secondsToTime = (seconds) => {
    // Рассчитываем часы и минуты
   
    if (seconds > 86400){
        seconds = seconds % 86400;
    }
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
  
    // Форматируем в строку HH:MM
    const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    
    return formattedTime;
  }

  export const getWeekDayString = (day) => {
    switch (day) {
      case 0: return "воскресенье";
      case 1: return "понедельник";
      case 2: return "вторник";
      case 3: return "среда";
      case 4: return "четверг";
      case 5: return "пятница";
      case 6: return "суббота";
      default: return "неизвестный день";
    }
    };




      export const TextWithLineBreaks = ({ text }) => {
        if (text === undefined || text === null){ return "";};
        return (
            <div>
            {text.split('\n').map((line, index) => (
                <React.Fragment key={index}>
                {line}
                <br />
                </React.Fragment>
            ))}
            </div>
        );
    }