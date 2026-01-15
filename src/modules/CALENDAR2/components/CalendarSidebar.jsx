/**
 * CalendarSidebar.jsx
 * 
 * Боковая панель для просмотра события
 * 
 * Содержит:
 * - Заголовок с типом и датой
 * - Детали события
 * - Комментарии
 * - Форма добавления комментария
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Drawer, Button, Input, List, Avatar, Tag, 
  Spin, Empty, Divider, message 
} from 'antd';
import {
  CloseOutlined,
  SendOutlined,
  CommentOutlined,
  UserOutlined,
  CalendarOutlined,
  BankOutlined,
  ClockCircleOutlined, PhoneOutlined, WechatWorkOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { 
  getEventTypeById, 
  getEventTypeColor,
  fetchEventComments,
  addEventComment,
} from './mock/CALENDARMOCK';
import { ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/react/24/outline';
import HighlightText from "../../../components/helpers/HighlightText";
import {NavLink} from "react-router-dom";


dayjs.extend(relativeTime);

const { TextArea } = Input;

const CalendarSidebar = ({
  visible,
  event,
  onClose,
  onCommentAdd,
  currentUserId,
  userdata,
}) => {
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Загрузка комментариев при открытии
  useEffect(() => {
    if (visible && event?.id) {
      loadComments();
    } else {
      setComments([]);
    }
  }, [visible, event?.id]);

  console.log(event);

  const loadComments = async () => {
    setCommentsLoading(true);
    try {
      const data = await fetchEventComments(event.id);
      setComments(data);
    } catch (error) {
      console.error('Ошибка загрузки комментариев:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      return;
    }

    setSubmitting(true);
    try {
      const userName = `${userdata?.user?.surname || ''} ${(userdata?.user?.name || '')[0] || ''}.${(userdata?.user?.secondname || '')[0] || ''}.`.trim();
      
      const comment = await addEventComment(
        event.id,
        currentUserId,
        userName,
        userdata?.user?.id_company,
        newComment.trim()
      );
      
      setComments(prev => [...prev, comment]);
      setNewComment('');
      onCommentAdd?.(event.id, newComment.trim());
      message.success('Комментарий добавлен');
    } catch (error) {
      console.error('Ошибка добавления комментария:', error);
      message.error('Не удалось добавить комментарий');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmitComment();
    }
  };

  if (!event) {
    return null;
  }

  const eventType = getEventTypeById(event.type);
  const typeColor = getEventTypeColor(event.type);

  return (
    <Drawer
      open={visible}
      onClose={onClose}
      width={400}
      placement="right"
      title={null}
      closable={false}
      className="calendar-sidebar"
      mask={false}
      styles={{
        body: { padding: 0 },
        header: { display: 'none' },
      }}
    >
      <div className="sidebar-container">
        {/* Заголовок */}
        <div 
          className="sidebar-header"
          style={{ borderLeftColor: typeColor }}
        >
          <div className="sidebar-header-top">
            <div style={{display: 'flex',gridGap: '12px'}}>
              <Tag 
                color={typeColor}
                className="sidebar-type-tag"
              >
                {eventType?.name}
              </Tag>
              <Tag color={'#d9d9d9'}> {event.id}</Tag>
            </div>
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={onClose}
                className="sidebar-close-btn"
              />
          </div>
          
          <h3 className="sidebar-title">
            {event.event_theme || eventType?.title}
          </h3>
          
          <div className="sidebar-meta">
            <span className="sidebar-meta-item">
              <CalendarOutlined />
              {dayjs(event.event_date).format('D MMMM YYYY')}
            </span>
            {event.event_time && (
              <span className="sidebar-meta-item">
                <ClockCircleOutlined />
                {event.event_time.slice(0, 5)}
              </span>
            )}
          </div>
        </div>

        {/* Детали */}
        <div className="sidebar-details">
          {/* Организация */}
          {event.org_name && (
            <div className="sidebar-detail-row">
              <BankOutlined className="sidebar-detail-icon" />
              <div className="sidebar-detail-content">
                <div className="sidebar-detail-label">Организация</div>
                <div className="sidebar-detail-value">
                  <NavLink to={'/orgs/' + event.org_id} target="_blank">
                    <HighlightText text={event.org_name}/>
                  </NavLink>
                </div>
              </div>
              {/*{event.is_curator === 1 && (*/}
              {/*  <Tag color="blue" className="sidebar-curator-tag">Куратор</Tag>*/}
              {/*)}*/}
            </div>
          )}

          {/* Контактное лицо */}
          <div className="sidebar-detail-row">
            <UserOutlined className="sidebar-detail-icon" />
            <div className="sidebar-detail-content">
              <div className="sidebar-detail-label">Контактное лицо</div>
              <div className="sidebar-detail-value">{event.user_name} {event.event_post}</div>
            </div>
          </div>

          {/* Телефон для связи */}
          {event.event_phone && (
            <div className="sidebar-detail-row">
              <PhoneOutlined className="sidebar-detail-icon" />
              <div className="sidebar-detail-content">
                <div className="sidebar-detail-label">Телефон для связи</div>
                <div className="sidebar-detail-value sidebar-phone">
                  {event.event_phone}
                </div>
              </div>
            </div>
          )}

          {/* Запись */}
          {event.event_note && (
              <div className="sidebar-detail-row">
                <CommentOutlined className="sidebar-detail-icon" />
                <div className="sidebar-detail-content">
                  <div className="sidebar-detail-label">О чем говорили в прошлый раз</div>
                  <div className="sidebar-detail-value sidebar-note">
                    {event.event_note}
                  </div>
                </div>
              </div>
          )}

          {/* Результат */}
          {event.event_result && (
              <div className="sidebar-detail-row">
                <WechatWorkOutlined className="sidebar-detail-icon" />
                <div className="sidebar-detail-content">
                  <div className="sidebar-detail-label">Результат</div>
                  <div className="sidebar-detail-value sidebar-note">
                    {event.event_result}
                  </div>
                </div>
              </div>
          )}

          {/* Сумма (для КП/счетов) */}
          {/*{event.amount && (*/}
          {/*  <div className="sidebar-detail-row">*/}
          {/*    <span className="sidebar-detail-icon">💰</span>*/}
          {/*    <div className="sidebar-detail-content">*/}
          {/*      <div className="sidebar-detail-label">Сумма</div>*/}
          {/*      <div className="sidebar-detail-value sidebar-amount">*/}
          {/*        {new Intl.NumberFormat('ru-RU', {*/}
          {/*          style: 'currency',*/}
          {/*          currency: 'RUB',*/}
          {/*          maximumFractionDigits: 0,*/}
          {/*        }).format(event.amount)}*/}
          {/*      </div>*/}
          {/*    </div>*/}
          {/*  </div>*/}
          {/*)}*/}

          {/* Статус */}
          {/*{event.status && (*/}
          {/*  <div className="sidebar-detail-row">*/}
          {/*    <span className="sidebar-detail-icon">📋</span>*/}
          {/*    <div className="sidebar-detail-content">*/}
          {/*      <div className="sidebar-detail-label">Статус</div>*/}
          {/*      <div className="sidebar-detail-value">*/}
          {/*        <StatusTag status={event.status} />*/}
          {/*      </div>*/}
          {/*    </div>*/}
          {/*  </div>*/}
          {/*)}*/}
        </div>

        {/*<Divider style={{ margin: '12px 0' }} />*/}

      </div>
    </Drawer>
  );
};

// Компонент комментария
const CommentItem = ({ comment, isOwn }) => {
  return (
    <div className={`sidebar-comment ${isOwn ? 'own' : ''}`}>
      <Avatar 
        size="small" 
        icon={<UserOutlined />}
        className="sidebar-comment-avatar"
      />
      <div className="sidebar-comment-body">
        <div className="sidebar-comment-header">
          <span className="sidebar-comment-author">
            {comment.user_name}
            {isOwn && <span color="gray" title='Мой комментарий' style={{ marginLeft: 6 }}><ChatBubbleOvalLeftEllipsisIcon height={'18px'} /></span>}
          </span>
          <span className="sidebar-comment-time">
            {dayjs(comment.created_at).fromNow()}
          </span>
        </div>
        <div className="sidebar-comment-content">
          {comment.content}
        </div>
      </div>
    </div>
  );
};

// Тег статуса
const StatusTag = ({ status }) => {
  const statusConfig = {
    draft: { color: 'default', text: 'Черновик' },
    sent: { color: 'processing', text: 'Отправлен' },
    approved: { color: 'success', text: 'Согласован' },
    paid: { color: 'green', text: 'Оплачен' },
    rejected: { color: 'error', text: 'Отклонён' },
  };

  const config = statusConfig[status] || { color: 'default', text: status };

  return <Tag color={config.color}>{config.text}</Tag>;
};

export default CalendarSidebar;
