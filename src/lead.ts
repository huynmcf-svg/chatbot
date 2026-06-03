import { WEBHOOK_URL } from './config'

export interface Lead {
  name: string
  phone: string
  email: string
  company: string
  service: string
  submittedAt: string
  source: string
}

const STORAGE_KEY = 'cprint_leads'

/** Lưu lead vào localStorage để không mất dữ liệu khi webhook lỗi. */
function saveLocal(lead: Lead) {
  try {
    const list: Lead[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    list.push(lead)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    /* localStorage không khả dụng – bỏ qua */
  }
}

/**
 * Gửi thông tin lead tới Google Sheets (qua Apps Script Web App).
 * Dùng mode 'no-cors' + Content-Type text/plain để tránh preflight CORS –
 * đây là cách chuẩn khi gọi Apps Script từ trình duyệt.
 * Luôn lưu bản sao cục bộ trước khi gửi.
 */
export async function submitLead(data: Omit<Lead, 'submittedAt' | 'source'>) {
  const lead: Lead = {
    ...data,
    submittedAt: new Date().toISOString(),
    source: typeof location !== 'undefined' ? location.href : 'web',
  }

  saveLocal(lead)

  if (!WEBHOOK_URL) {
    console.info('[C-Print] Chưa cấu hình WEBHOOK_URL – lead chỉ lưu cục bộ.', lead)
    return
  }

  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(lead),
    })
  } catch (err) {
    console.warn('[C-Print] Gửi lead thất bại – đã lưu cục bộ để gửi lại sau.', err)
  }
}
