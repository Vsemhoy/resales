import React, { useRef, useEffect, useState } from 'react';
import { Modal } from 'antd';
import Draggable from 'react-draggable';
import { CloseOutlined } from '@ant-design/icons';
import ChatLayout from './ChatLayout';

export const ChatModal = ({ open, onOk, onCancel, smsData }) => {
	const dragRef = useRef(null);
	const boundsRef = useRef(null);
	const [dragging, setDragging] = useState(false);
	const [position, setPosition] = useState({ x: 0, y: 0 });

	useEffect(() => {
		if (open) {
			// При открытии модалки сбрасываем позицию
			setPosition({ x: 0, y: 0 });

			// Перерасчитываем границы
			if (dragRef.current) {
				const clientWidth = window.innerWidth;
				const clientHeight = window.innerHeight;
				const rect = dragRef.current.getBoundingClientRect();

				boundsRef.current = {
					left: -rect.left + 10,
					top: -rect.top + 10,
					right: clientWidth - rect.right - 10,
					bottom: clientHeight - rect.bottom - 10,
				};
			}
		}
	}, [open]);

	const onStart = () => setDragging(true);
	const onStop = (e, data) => {
		setDragging(false);
		setPosition({ x: data.x, y: data.y }); // сохраняем новую позицию
	};

	return (
		<Modal
			title={
				<h3
					className="ant-modal-title"
					style={{
						cursor: dragging ? 'grabbing' : 'grab',
						userSelect: dragging ? 'none' : 'auto',
					}}
				>
					Чаты
				</h3>
			}
			open={open}
			onOk={onOk}
			onCancel={onCancel}
			footer={null}
			closeIcon={<CloseOutlined />}
			maskClosable={true}
			keyboard={true}
			mask={false}
			bodyStyle={{
				minWidth: 400,
				minHeight: 300,
				maxWidth: '90vw',
				maxHeight: '80vh',
				overflow: 'auto',
			}}
			modalRender={(modal) => (
				<Draggable
					handle=".ant-modal-title"
					bounds={boundsRef.current}
					onStart={onStart}
					onStop={onStop}
					nodeRef={dragRef}
					position={position} // позиция управляется явно
				>
					<div ref={dragRef}>{modal}</div>
				</Draggable>
			)}
		>
			<ChatLayout />
			{smsData?.hasSms && (
				<p style={{ marginTop: 16 }}>
					У вас есть {smsData.messages.length} непрочитанных сообщений
				</p>
			)}

			<style>
				{`
          .ant-modal-title:active {
            cursor: grabbing !important;
          }
        `}
			</style>
		</Modal>
	);
};
