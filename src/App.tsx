import { useEffect, useRef } from 'react'
import './App.css'
import { BRAND } from './config'
import { useChatFlow } from './useChatFlow'
import { Header } from './components/Header'
import { BotBubble, TypingBubble, UserBubble } from './components/Messages'
import { ControlZone } from './components/Controls'

function App() {
  const { items, typing, awaiting, answer } = useChatFlow()
  const endRef = useRef<HTMLDivElement>(null)

  // Tự cuộn xuống cuối mỗi khi có nội dung mới.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [items, typing, awaiting])

  return (
    <div className="app">
      <div className="backdrop" aria-hidden="true">
        <span className="blob blob-1" />
        <span className="blob blob-2" />
        <span className="blob blob-3" />
      </div>

      <main className="chat" role="log" aria-live="polite">
        <Header />

        <div className="conversation">
          <div className="messages">
            {items.map((item, i) =>
              item.side === 'bot' ? (
                <BotBubble
                  key={item.id}
                  text={item.text}
                  showAvatar={i === 0 || items[i - 1].side !== 'bot'}
                />
              ) : (
                <UserBubble key={item.id} text={item.text} />
              ),
            )}

            {typing && <TypingBubble />}
            {awaiting && <ControlZone step={awaiting} onAnswer={answer} />}

            <div ref={endRef} className="end-anchor" />
          </div>
        </div>

        <footer className="footer">
          <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 1 3 5v6c0 5 3.8 9.4 9 11 5.2-1.6 9-6 9-11V5l-9-4zm0 10.9h7c-.5 4-3.2 7.5-7 8.7V12H5V6.3l7-3.1v8.7z"
            />
          </svg>
          Thông tin của bạn được C-Print bảo mật · {BRAND.tagline}
        </footer>
      </main>
    </div>
  )
}

export default App
