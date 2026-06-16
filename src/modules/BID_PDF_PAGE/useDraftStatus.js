import { useState, useCallback, useEffect } from 'react'
import { updateDraftStatus } from './api'

// Роли из /api/usda → user.sales_role:
// 1 = Менеджер, 2 = Администратор (оба считаются "менеджерской" группой)
// 4 = Инженер
// 3 = Бухгалтер — временно тоже считаем инженером для тестирования (нет СКУД-доступа к роли 4)
export const MANAGER_ROLES = [1, 2]
export const ENGINEER_ROLES = [3, 4]

export function getRoleGroup(role) {
  if (MANAGER_ROLES.includes(role))  return 'manager'
  if (ENGINEER_ROLES.includes(role)) return 'engineer'
  return null
}

export const STATUS_META = {
  man_edited:    { label: 'У менеджера',             color: 'blue'    },
  sent_engineer: { label: 'Отправлено инженерам',    color: 'orange'  },
  on_engineer:   { label: 'В работе у инженера',     color: 'gold'    },
  sent_manager:  { label: 'Закончено инженером',     color: 'purple'  },
  man_check:     { label: 'Проверяется менеджером',  color: 'cyan'    },
  man_approved:  { label: 'Принято менеджером',      color: 'green'   },
  man_rejected:  { label: 'Возвращено на доработку', color: 'red'     },
  done:          { label: 'Завершено',               color: 'success' },
  dropped:       { label: 'Снято',                   color: 'default' },
}

// Переходы: { текущий: { 'manager' | 'engineer': [доступные следующие статусы] } }
const TRANSITIONS = {
  man_edited:    { manager: ['sent_engineer', 'done', 'dropped'],     engineer: [] },
  sent_engineer: { manager: ['done', 'dropped'],              engineer: ['on_engineer'] },
  on_engineer:   { manager: [],                               engineer: ['sent_manager'] },
  sent_manager:  { manager: ['man_check'],                    engineer: [] },
  man_check:     { manager: ['man_approved', 'man_rejected'], engineer: [] },
  man_approved:  { manager: ['done'],                         engineer: [] },
  man_rejected:  { manager: [],                               engineer: ['on_engineer'] },
  done:          { manager: ['man_edited'],                   engineer: [] },
  dropped:       { manager: ['man_edited'],                   engineer: [] },
}

export function useDraftStatus(draftId, initialStatus, userRole, onChanged) {
  const [status,  setStatus]  = useState(initialStatus || 'man_edited')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  // initialStatus приходит асинхронно (draft загружается отдельно) —
  // useState инициализирует только при монтировании, поэтому синхронизируем явно
  useEffect(() => {
    if (initialStatus) setStatus(initialStatus)
  }, [initialStatus])

  const roleGroup = getRoleGroup(userRole)
  const available = roleGroup ? (TRANSITIONS[status]?.[roleGroup] ?? []) : []

  const transition = useCallback(async (newStatus) => {
    if (!draftId) return
    setLoading(true)
    setError(null)
    try {
      const res = await updateDraftStatus(draftId, newStatus)
      setStatus(res.status ?? newStatus)
      onChanged?.(res)
    } catch (e) {
      setError(e?.message || 'Не удалось изменить статус')
    } finally {
      setLoading(false)
    }
  }, [draftId, onChanged])

  return { status, available, transition, loading, error, setStatus }
}
