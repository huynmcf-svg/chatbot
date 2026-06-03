// Cấu hình trung tâm của chatbot C-Print.

/** Trang web chính thức – nút "Truy cập trang web" ở cuối hội thoại. */
export const WEBSITE_URL = 'https://c-print.com.vn/'

/**
 * URL Google Apps Script Web App để ghi lead vào Google Sheets.
 * - Ưu tiên đọc từ biến môi trường VITE_WEBHOOK_URL (.env)
 * - Hoặc dán trực tiếp vào chuỗi mặc định bên dưới.
 * Cách tạo: xem hướng dẫn trong README.md (mục "Kết nối Google Sheets").
 * Để trống => lead chỉ được lưu tạm trong trình duyệt (localStorage).
 */
export const WEBHOOK_URL =
  ((import.meta.env.VITE_WEBHOOK_URL as string | undefined) ?? '').trim() ||
  '' // ví dụ: 'https://script.google.com/macros/s/AKfyc.../exec'

/** Nhận diện thương hiệu hiển thị trên header / footer. */
export const BRAND = {
  name: 'C-Print',
  role: 'Bộ phận Tư vấn',
  tagline: 'Giải pháp in ấn kỹ thuật số công nghiệp',
}

/**
 * Tốc độ hiệu ứng "đang nhập" của bot (mili-giây).
 * Giảm các giá trị này nếu muốn bot phản hồi nhanh hơn nữa.
 */
export const TYPING = { base: 280, perChar: 10, max: 750 }
