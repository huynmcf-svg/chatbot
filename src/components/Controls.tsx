import { useEffect, useRef, useState } from 'react'
import { COUNTRIES, DEFAULT_COUNTRY, type Country } from '../countries'
import { OTHER_OPTION, type FlowStep } from '../flow'

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="currentColor"
        d="M3.4 20.4 21 12 3.4 3.6 3 10.2l11 1.8-11 1.8z"
      />
    </svg>
  )
}

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

/** Nút "Bấm để tiếp tục" – hiển thị bên phải như một hành động của người dùng. */
function ContinueButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div className="row row-user">
      <button type="button" className="cta cta-continue" onClick={onClick}>
        {label}
      </button>
    </div>
  )
}

/** Ô nhập văn bản / email với nút gửi. */
function TextField({
  type,
  placeholder,
  onSubmit,
}: {
  type: 'text' | 'email'
  placeholder?: string
  onSubmit: (value: string) => void
}) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    ref.current?.focus()
  }, [])

  const submit = () => {
    const v = value.trim()
    if (!v) {
      setError('Vui lòng nhập thông tin')
      return
    }
    if (type === 'email' && !isEmail(v)) {
      setError('Email chưa hợp lệ')
      return
    }
    onSubmit(v)
  }

  return (
    <div className="control">
      <div className={`field${error ? ' field-error' : ''}`}>
        <input
          ref={ref}
          type={type === 'email' ? 'email' : 'text'}
          inputMode={type === 'email' ? 'email' : 'text'}
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            if (error) setError('')
          }}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
        <button type="button" className="send" onClick={submit} aria-label="Gửi">
          <SendIcon />
        </button>
      </div>
      {error && <span className="hint hint-error">{error}</span>}
    </div>
  )
}

/** Ô nhập điện thoại có chọn mã quốc gia. */
function PhoneField({ onSubmit }: { onSubmit: (value: string) => void }) {
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY)
  const [num, setNum] = useState('')
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Đóng dropdown khi bấm ra ngoài.
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const submit = () => {
    const national = num.replace(/\D/g, '').replace(/^0+/, '')
    if (national.length < 6) {
      setError('Số điện thoại chưa hợp lệ')
      return
    }
    onSubmit(`${country.dial}${national}`)
  }

  const filtered = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.dial.includes(query) ||
      c.code.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className="control">
      <div className={`field field-phone${error ? ' field-error' : ''}`} ref={wrapRef}>
        <button
          type="button"
          className="country"
          onClick={() => setOpen((o) => !o)}
          aria-label="Chọn mã quốc gia"
        >
          <span className="flag">{country.flag}</span>
          <span className="dial">{country.dial}</span>
          <span className="caret" aria-hidden="true">▾</span>
        </button>

        <input
          ref={inputRef}
          type="tel"
          inputMode="tel"
          placeholder="Số điện thoại"
          value={num}
          onChange={(e) => {
            setNum(e.target.value)
            if (error) setError('')
          }}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
        <button type="button" className="send" onClick={submit} aria-label="Gửi">
          <SendIcon />
        </button>

        {open && (
          <div className="country-menu" role="listbox">
            <input
              className="country-search"
              placeholder="Tìm quốc gia..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <div className="country-list">
              {filtered.map((c) => (
                <button
                  type="button"
                  key={c.code}
                  className="country-item"
                  onClick={() => {
                    setCountry(c)
                    setOpen(false)
                    setQuery('')
                    inputRef.current?.focus()
                  }}
                >
                  <span className="flag">{c.flag}</span>
                  <span className="country-name">{c.name}</span>
                  <span className="dial">{c.dial}</span>
                </button>
              ))}
              {filtered.length === 0 && <div className="country-empty">Không tìm thấy</div>}
            </div>
          </div>
        )}
      </div>
      {error && <span className="hint hint-error">{error}</span>}
    </div>
  )
}

/** Danh sách nút lựa chọn dịch vụ – riêng "Lựa chọn khác" sẽ mở ô tự nhập. */
function Choices({ options, onSelect }: { options: string[]; onSelect: (v: string) => void }) {
  const [custom, setCustom] = useState(false)

  if (custom) {
    return (
      <TextField
        type="text"
        placeholder="Nhập dịch vụ Anh/Chị quan tâm..."
        onSubmit={onSelect}
      />
    )
  }

  return (
    <div className="choices">
      {options.map((opt) => (
        <button
          type="button"
          key={opt}
          className="choice"
          onClick={() => (opt === OTHER_OPTION ? setCustom(true) : onSelect(opt))}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

/** Nút CTA mở trang web ở cuối hội thoại. */
function LinkButton({ label, url }: { label: string; url: string }) {
  return (
    <div className="row row-user">
      <a className="cta cta-link" href={url} target="_blank" rel="noopener noreferrer">
        {label}
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            fill="currentColor"
            d="M14 3v2h3.6l-9.3 9.3 1.4 1.4L19 6.4V10h2V3h-7zM5 5h5V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5h-2v5H5V5z"
          />
        </svg>
      </a>
    </div>
  )
}

/** Hiển thị đúng loại điều khiển tương ứng bước đang chờ. */
export function ControlZone({
  step,
  onAnswer,
}: {
  step: FlowStep
  onAnswer: (display: string, field?: string, value?: string) => void
}) {
  switch (step.kind) {
    case 'continue':
      return <ContinueButton label={step.label} onClick={() => onAnswer(step.label)} />
    case 'ask':
      return (
        <TextField
          type={step.input}
          placeholder={step.placeholder}
          onSubmit={(v) => onAnswer(v, step.field, v)}
        />
      )
    case 'phone':
      return <PhoneField onSubmit={(v) => onAnswer(v, step.field, v)} />
    case 'choice':
      return <Choices options={step.options} onSelect={(v) => onAnswer(v, step.field, v)} />
    case 'link':
      return <LinkButton label={step.label} url={step.url} />
    default:
      return null
  }
}
