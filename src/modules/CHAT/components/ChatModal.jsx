import React, { useRef, useEffect, useState } from 'react';
import { Modal } from 'antd';
import Draggable from 'react-draggable';
import { CloseOutlined } from '@ant-design/icons';
import ChatLayout from './ChatLayout';
import './style/ChatModal.css';

export const ChatModal = ({ open, onOk, onCancel, smsData }) => {
	const dragRef = useRef(null);
	const boundsRef = useRef(null);
	const [dragging, setDragging] = useState(false);
	const [position, setPosition] = useState({ x: 0, y: 0 });

	// clamp ограничивает позицию в пределах границ
	const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

	useEffect(() => {
		if (open) {
			setPosition({ x: 0, y: 0 }); // сбрасываем позицию при открытии
		}
	}, [open]);

	const onStart = () => {
		setDragging(true);

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
	};

	const onStop = (e, data) => {
		setDragging(false);

		if (boundsRef.current) {
			setPosition({
				x: clamp(data.x, boundsRef.current.left, boundsRef.current.right),
				y: clamp(data.y, boundsRef.current.top, boundsRef.current.bottom),
			});
		} else {
			setPosition({ x: data.x, y: data.y });
		}
	};

	return (
		<Modal
			title={
				<h3
					className="ant-modal-title"
					style={{
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
			className="chat-modal"
			modalRender={(modal) => (
				<Draggable
					handle=".ant-modal-title"
					bounds={boundsRef.current}
					onStart={onStart}
					onStop={onStop}
					nodeRef={dragRef}
					position={position}
				>
					<div ref={dragRef}>{modal}</div>
				</Draggable>
			)}
		>
			<ChatLayout />
		</Modal>
	);
};
