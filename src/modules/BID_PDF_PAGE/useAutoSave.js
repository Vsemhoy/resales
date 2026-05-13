import { useState, useEffect, useRef } from 'react'
import { saveDraft, saveDraftWithFiles } from './api'
import { extractFiles } from './api/files'

// status: 'idle' | 'pending' | 'saving' | 'saved' | 'error'
export function useAutoSave(draftId, formData, currency, delay = 2000, isReady = false) {
  const [status,  setStatus]  = useState('idle')
  const [errMsg,  setErrMsg]  = useState('')
  const timerRef    = useRef(null)
  const mountedRef  = useRef(true)
  const readyRef    = useRef(false)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  // Становимся ready только после явного сигнала снаружи
  useEffect(() => {
    if (isReady) readyRef.current = true
  }, [isReady])

  useEffect(() => {
    if (!draftId || !formData) return
    if (!readyRef.current) return  // данные ещё не загружены — не сохраняем

    setStatus('pending')
    setErrMsg('')
    clearTimeout(timerRef.current)

    timerRef.current = setTimeout(async () => {
      if (!mountedRef.current) return
      setStatus('saving')
      try {
        const { cleanData, files } = extractFiles(formData)
        const hasFiles = Object.keys(files).length > 0

        if (hasFiles) {
          await saveDraftWithFiles(draftId, cleanData, currency, files)
        } else {
          await saveDraft(draftId, cleanData, currency)
        }

        if (!mountedRef.current) return
        setStatus('saved')
        setTimeout(() => { if (mountedRef.current) setStatus('idle') }, 3000)
      } catch (e) {
        if (!mountedRef.current) return
        const msg = e?.response?.data?.message || e?.message || 'Ошибка сохранения'
        setErrMsg(msg)
        setStatus('error')
      }
    }, delay)

    return () => clearTimeout(timerRef.current)
  }, [draftId, formData, currency, delay])

  return { status, errMsg }
}
