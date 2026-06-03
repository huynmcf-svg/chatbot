/** Avatar tròn của bot (chữ C thương hiệu). */
export function Avatar({ hidden = false }: { hidden?: boolean }) {
  return (
    <div className={`avatar${hidden ? ' avatar-hidden' : ''}`} aria-hidden="true">
      C
    </div>
  )
}

export function BotBubble({ text, showAvatar }: { text: string; showAvatar: boolean }) {
  return (
    <div className="row row-bot">
      <Avatar hidden={!showAvatar} />
      <div className="bubble bubble-bot">{text}</div>
    </div>
  )
}

export function UserBubble({ text }: { text: string }) {
  return (
    <div className="row row-user">
      <div className="bubble bubble-user">{text}</div>
    </div>
  )
}

/** Bong bóng "đang gõ" với 3 chấm động. */
export function TypingBubble() {
  return (
    <div className="row row-bot">
      <Avatar />
      <div className="bubble bubble-bot bubble-typing" aria-label="Đang soạn tin">
        <span className="dot-typing" />
        <span className="dot-typing" />
        <span className="dot-typing" />
      </div>
    </div>
  )
}
