import { useCallback, useEffect, useRef, useState } from 'react'
import { TYPING } from './config'
import { flow, interpolate, type ChatItem, type FlowStep } from './flow'
import { submitLead } from './lead'

const delayFor = (text: string) =>
  Math.min(TYPING.base + text.length * TYPING.perChar, TYPING.max)

let idSeq = 0
const nextId = () => ++idSeq

export interface ChatState {
  /** Các bong bóng đã hiển thị. */
  items: ChatItem[]
  /** Bot đang "gõ" hay không. */
  typing: boolean
  /** Bước đang chờ người dùng tương tác (null nếu đang chạy tự động). */
  awaiting: FlowStep | null
  /** Đã hoàn tất kịch bản. */
  done: boolean
  /**
   * Ghi nhận câu trả lời của người dùng và chuyển sang bước kế tiếp.
   * @param display Văn bản hiển thị trong bong bóng người dùng.
   * @param field   Khóa lưu vào dữ liệu lead (tuỳ chọn).
   * @param value   Giá trị lưu (mặc định = display).
   */
  answer: (display: string, field?: string, value?: string) => void
}

/** Bộ máy điều khiển hội thoại: tự chạy các câu thoại, dừng chờ ở các bước nhập liệu. */
export function useChatFlow(): ChatState {
  const [items, setItems] = useState<ChatItem[]>([])
  const [typing, setTyping] = useState(false)
  const [awaiting, setAwaiting] = useState<FlowStep | null>(null)
  const [cursor, setCursor] = useState(0)
  const answersRef = useRef<Record<string, string>>({})
  const submittedRef = useRef(false)

  useEffect(() => {
    if (cursor >= flow.length) return
    const step = flow[cursor]
    const timers: number[] = []
    const at = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms))

    switch (step.kind) {
      case 'say':
      case 'ask':
      case 'phone':
      case 'choice': {
        const text = step.kind === 'say' ? interpolate(step.text, answersRef.current) : step.prompt
        at(() => setTyping(true), 0)
        at(() => {
          setTyping(false)
          setItems((prev) => [...prev, { id: nextId(), side: 'bot', text }])
          if (step.kind === 'say') setCursor((c) => c + 1)
          else setAwaiting(step)
        }, delayFor(text))
        break
      }

      case 'continue':
      case 'link': {
        at(() => setAwaiting(step), 0)
        break
      }

      case 'submit': {
        if (!submittedRef.current) {
          submittedRef.current = true
          const a = answersRef.current
          void submitLead({
            name: a.name ?? '',
            phone: a.phone ?? '',
            email: a.email ?? '',
            company: a.company ?? '',
            service: a.service ?? '',
          })
        }
        at(() => setCursor((c) => c + 1), 0)
        break
      }
    }

    return () => timers.forEach(clearTimeout)
  }, [cursor])

  const answer = useCallback((display: string, field?: string, value?: string) => {
    if (field) answersRef.current[field] = value ?? display
    setItems((prev) => [...prev, { id: nextId(), side: 'user', text: display }])
    setAwaiting(null)
    setCursor((c) => c + 1)
  }, [])

  return { items, typing, awaiting, done: cursor >= flow.length, answer }
}
