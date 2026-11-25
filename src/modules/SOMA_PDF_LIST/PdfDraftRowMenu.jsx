import React from 'react'
import { DeleteOutlined } from '@ant-design/icons'
import { Dropdown, Modal, message } from 'antd'
import { deleteDraft } from '../BID_PDF_PAGE/api/drafts.api'

export default function PdfDraftRowMenu({ canDelete, draftId, orgName, onDeleted, children }) {
  if (!canDelete) return children

  const confirmDelete = () => {
    Modal.confirm({
      title: 'Удалить черновик?',
      content: `#${draftId} — ${orgName}`,
      okText: 'Удалить',
      okButtonProps: { danger: true },
      cancelText: 'Отмена',
      onOk: async () => {
        try {
          await deleteDraft(draftId)
        } catch (error) {
          message.error('Не удалось удалить черновик')
          throw error
        }
        onDeleted()
      },
    })
  }

  const menu = {
    items: [{
      key: 'delete',
      label: 'Удалить черновик',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation()
        confirmDelete()
      },
    }],
  }

  return <Dropdown menu={menu} trigger={['contextMenu']}>{children}</Dropdown>
}
