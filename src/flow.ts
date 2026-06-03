import { WEBSITE_URL } from './config'

export type Side = 'bot' | 'user'

/** Một bong bóng chat đã được hiển thị trong khung hội thoại. */
export interface ChatItem {
  id: number
  side: Side
  text: string
}

export type Field = 'name' | 'phone' | 'email' | 'company' | 'service'

/** Mỗi bước trong kịch bản hội thoại. */
export type FlowStep =
  | { kind: 'say'; text: string }
  | { kind: 'continue'; label: string }
  | { kind: 'ask'; field: Field; prompt: string; input: 'text' | 'email'; placeholder?: string }
  | { kind: 'phone'; field: 'phone'; prompt: string }
  | { kind: 'choice'; field: 'service'; prompt: string; options: string[] }
  | { kind: 'submit' }
  | { kind: 'link'; label: string; url: string }

/** Các dịch vụ C-Print cung cấp (nút lựa chọn). */
export const SERVICES = [
  'Giải pháp in ấn trọn gói',
  'In ấn bao bì/tem nhãn',
  'In dữ liệu biến đổi VDP',
  'Vật tư tiêu hao ngành in',
  'Dịch vụ bảo trì và sửa chữa',
]

/** Kịch bản hội thoại tuyến tính – chạy từ trên xuống. */
export const flow: FlowStep[] = [
  { kind: 'say', text: 'Chào mừng anh/chị đến với gian hàng của C-Print 👋' },
  {
    kind: 'say',
    text: 'Để nhận catalogue điện tử và tài liệu công nghệ in mới nhất, Anh/Chị vui lòng cho C-Print xin một số thông tin nhé ạ!',
  },
  { kind: 'continue', label: 'Bấm để tiếp tục' },
  { kind: 'ask', field: 'name', prompt: 'Tên Anh/Chị là gì ạ?', input: 'text', placeholder: 'Nhập họ và tên...' },
  { kind: 'say', text: 'Rất vui được gặp {name}!' },
  { kind: 'phone', field: 'phone', prompt: 'Số điện thoại/Zalo của Anh/Chị?' },
  { kind: 'ask', field: 'email', prompt: 'Email của Anh/Chị?', input: 'email', placeholder: 'vd: ten@congty.com' },
  {
    kind: 'ask',
    field: 'company',
    prompt: 'Anh/Chị hiện đang công tác tại công ty nào?',
    input: 'text',
    placeholder: 'Tên công ty...',
  },
  {
    kind: 'choice',
    field: 'service',
    prompt: 'Anh/Chị đang quan tâm đến dịch vụ nào của C-Print?',
    options: SERVICES,
  },
  { kind: 'submit' },
  { kind: 'say', text: 'Done! Cảm ơn Anh/Chị đã dành chút thời gian cho C-Print 🎉' },
  { kind: 'say', text: 'Chúc Anh/Chị có trải nghiệm vui vẻ!' },
  {
    kind: 'say',
    text: 'Vui lòng bấm nút bên dưới để tìm hiểu về các giải pháp và sản phẩm của C-Print.',
  },
  { kind: 'link', label: 'Truy cập trang web C-Print', url: WEBSITE_URL },
]

/** Thay {field} trong câu thoại bằng câu trả lời đã thu thập. */
export const interpolate = (text: string, answers: Record<string, string>) =>
  text.replace(/\{(\w+)\}/g, (_, key: string) => answers[key] ?? '')
