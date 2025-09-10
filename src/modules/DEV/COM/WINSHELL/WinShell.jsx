import React, { useState, useEffect, useRef } from 'react';
import './components/style/winshell.css';
import { Button, Dropdown } from 'antd';
import {
  ArrowDownOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  BorderOuterOutlined,
  BorderOutlined,
  CloseOutlined,
  DashOutlined,
  FullscreenOutlined,
} from '@ant-design/icons';
import StateWarningIcon from '../../../../assets/Comicon/States/StateWarningIcon';

const WinShell = ({ children, title = "Чатик", on_close }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [position, setPosition] = useState({ x: 400, y: 100 });
  const [size, setSize] = useState({ width: 350, height: 500 });
  const [snapSide, setSnapSide] = useState('none'); // 'left', 'right', 'bottom', 'none'
  const [isHoverCollapseEnabled, setIsHoverCollapseEnabled] = useState(true); // по умолчанию сворачивается по ховеру

  const dragRef = useRef(null);
  const resizeRef = useRef(null);
  const windowRef = useRef(null);

  const STORAGE_KEY = 'chatWindow_state';

  // Загрузка состояния из localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const state = JSON.parse(saved);
      setIsCollapsed(state.isCollapsed || false);
      setPosition(state.position || { x: 400, y: 100 });
      setSize(state.size || { width: 350, height: 500 });
      setSnapSide(state.snapSide || 'none');
      setIsHoverCollapseEnabled(state.isHoverCollapseEnabled !== false); // по умолчанию true
    }
  }, []);

  // Сохранение состояния
  useEffect(() => {
    const state = { isCollapsed, position, size, snapSide, isHoverCollapseEnabled };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [isCollapsed, position, size, snapSide, isHoverCollapseEnabled]);

  // Перетаскивание
  const startDrag = (e) => {
    e.preventDefault();
    const startX = e.clientX - position.x;
    const startY = e.clientY - position.y;

    const handleMove = (e) => {
      const newX = e.clientX - startX;
      const newY = e.clientY - startY;
      setPosition({ x: newX, y: newY });
    };

    const stopDrag = () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', stopDrag);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', stopDrag);
  };

  // Ресайз
  const startResize = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = size.width;
    const startHeight = size.height;

    const handleMove = (e) => {
      const newWidth = Math.max(250, Math.min(600, startWidth + (e.clientX - startX)));
      const newHeight = Math.max(300, Math.min(800, startHeight + (e.clientY - startY)));
      setSize({ width: newWidth, height: newHeight });
    };

    const stopResize = () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', stopResize);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', stopResize);
  };

  // Функция прилипания к стороне
  const snapToSide = (side) => {
    if (side === 'none') {
      setSnapSide('none');
      setIsCollapsed(false);
      return;
    }

    setSnapSide(side);
    setIsCollapsed(true); // при выборе стороны — сразу сворачиваем

    // Опционально: можно задать позицию, чтобы при разворачивании окно не "прыгало"
    // Например, запомним текущую позицию как "последнюю свободную"
    // Но для простоты пока не трогаем
  };

  // Переключение режима сворачивания по ховеру
  const toggleHoverCollapse = () => {
    setIsHoverCollapseEnabled(!isHoverCollapseEnabled);
  };

  // Стили для окна — теперь только позиционирование, всё остальное через CSS-классы
  const getWindowStyle = () => {
    let style = {
      width: size.width,

      left: position.x,
      top: position.y,
      position: 'absolute',
      zIndex: 999,
      transition: isCollapsed ? 'none' : 'all 0.2s ease', // плавность только при разворачивании
    };

    if (!isHoverCollapseEnabled ) {
        style.height = size.height;
    };
    // Если прилипший — убираем абсолютные координаты, пусть CSS управляет
    if (snapSide !== 'none') {
      style = {
        ...style,
        left: 'auto',
        top: 'auto',
        right: 'auto',
        bottom: 'auto',
      };
    }

    return style;
  };

  // Меню для прилипания
  const snapMenu = [
    {
      key: 'snap-left',
      label: (
        <div onClick={() => snapToSide('left')}>
          Snap Left
        </div>
      ),
      icon: <ArrowLeftOutlined />,
    },
    {
      key: 'snap-right',
      label: (
        <div onClick={() => snapToSide('right')}>
          Snap Right
        </div>
      ),
      icon: <ArrowRightOutlined />,
    },
    {
      key: 'snap-bottom',
      label: (
        <div onClick={() => snapToSide('bottom')}>
          Snap Bottom
        </div>
      ),
      icon: <ArrowDownOutlined />,
    },
    {
      key: 'snap-off',
      label: (
        <div onClick={() => snapToSide('none')}>
          Snap Off
        </div>
      ),
      icon: <FullscreenOutlined />,
    },
  ];

  return (
    <div
      ref={windowRef}
      className={`win-shell snap-${snapSide} ${isCollapsed ? 'collapsed' : ''} ${isHoverCollapseEnabled ? 'hovercollapsed' : ''}`}
      style={getWindowStyle()}
      onMouseEnter={() => isHoverCollapseEnabled && snapSide !== 'none' && setIsCollapsed(false)}
      onMouseLeave={() => isHoverCollapseEnabled && snapSide !== 'none' && setIsCollapsed(true)}
    >
      {/* Заголовок */}
      <div
        className="win-header"
        ref={dragRef}
        onMouseDown={startDrag}
        style={{ cursor: 'move', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <span title={title}><StateWarningIcon height={'24px'} /></span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <Dropdown menu={{ items: snapMenu }} trigger={['hover']} placement="bottomRight">
            <Button icon={<BorderOuterOutlined />} size="small" />
          </Dropdown>

          <Button
            icon={isHoverCollapseEnabled ? <DashOutlined /> :  <BorderOutlined />}
            size="small"
            title={isHoverCollapseEnabled ? "Disable hover collapse" : "Enable hover collapse"}
            onClick={toggleHoverCollapse}
          />

          <Button
            icon={<CloseOutlined />}
            size="small"
            danger
            onClick={on_close}
            title="Toggle collapse"
          />
        </div>
      </div>

      {/* Контент */}
      {!isCollapsed && (
        <div className="win-content" style={{ height: 'calc(100% - 40px)', overflow: 'auto' }}>
          {children || <div>Тут будет чат...</div>}
        </div>
      )}

      {/* Ресайзер */}
      {!isCollapsed && snapSide === 'none' && (
        <div
          ref={resizeRef}
          className="resizer"
          onMouseDown={startResize}
        />
      )}

      {/* Иконка перетаскивания (дублируем для UX) */}
      <div
        className="drag-handle"
        onMouseDown={startDrag}
      >
        🞌
      </div>
    </div>
  );
};

export default WinShell;