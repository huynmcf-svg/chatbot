/**
 * C-Print – Webhook: ghi lead vào Google Sheets + gửi email cảm ơn tự động.
 *
 * CÀI ĐẶT:
 * 1. Tạo Google Sheet mới (vd tên "Thông tin khách hàng").
 * 2. Upload file "src/assets/Ho-so-nang-luc-C-Print.pdf" lên Google Drive.
 *    Mở file -> Share -> "Anyone with the link" (để khách bấm link xem online được).
 *    Lấy ID trong URL: .../file/d/<ID>/view  ->  dán vào PROFILE.fileId bên dưới.
 * 3. (Tuỳ chọn) Upload logo "src/assets/c-print.png" lên Drive, lấy ID -> BRAND.logoFileId
 *    và "src/assets/konica.png" lên Drive, lấy ID -> BRAND.konicaLogoFileId
 *    để hiển thị 2 logo (C-Print bên trái, Konica bên phải) ở đầu email.
 *    Bỏ trống thì email dùng chữ "C-PRINT" / "KONICA MINOLTA".
 * 4. Extensions ▸ Apps Script: dán toàn bộ file này, Lưu.
 * 5. Deploy ▸ New deployment ▸ Web app:
 *       Execute as: Me   |   Who has access: Anyone (Bất kỳ ai)
 *    -> Cấp quyền (Authorize) cho cả Gmail + Drive khi được hỏi.
 * 6. Copy URL .../exec dán vào VITE_WEBHOOK_URL (.env) của web chatbot.
 *
 * Lưu ý: Gmail giới hạn đính kèm 25MB & quota gửi ~100 mail/ngày (Gmail thường),
 * ~1500/ngày (Google Workspace). PDF hồ sơ đã nén còn ~3.2MB nên đính kèm thoải mái.
 */

// ====================== CẤU HÌNH ======================
var BRAND = {
  name: 'C-Print',
  tagline: 'Giải pháp in ấn kỹ thuật số công nghiệp',
  note: 'Đại diện chính thức Konica Minolta Business Solutions tại Việt Nam',
  website: 'https://c-print.com.vn/',
  facebook: 'https://www.facebook.com/cprintvietnam',
  youtube: 'https://www.youtube.com/@c-print',
  email: 'sales@c-print.com.vn', // email liên hệ hiển thị trong mail
  phone: '+84 941 498 866', // SĐT liên hệ hiển thị trong mail
  address: 'Số 6, ngõ 167 Phương Mai, Đống Đa, Hà Nội', // địa chỉ hiển thị trong mail
  // Thương hiệu phân phối (dải logo cuối email). Upload từng ảnh trong src/assets lên Drive,
  // share "Anyone with the link", rồi dán ID vào fileId tương ứng. Để trống fileId thì bỏ qua logo đó.
  partners: [
    { name: 'Miyakoshi', fileId: '' }, // src/assets/miyakoshi.png (đã cắt viền trắng)
    { name: 'Hanglory', fileId: '' },  // src/assets/hanglory.png
    { name: 'JMD', fileId: '' },       // src/assets/jmd.jpeg
    { name: 'Brotech', fileId: '' },   // src/assets/brotech.png
  ],
  replyTo: 'sales@c-print.com.vn', // email nhận phản hồi khi khách bấm "Trả lời"
  logoFileId: '1UFQ1KeQi0-K7wii6CEv4Q6iU7GkbxZ8t', // ID logo C-Print trên Drive (nửa trái header)
  konicaLogoFileId: '', // ID logo Konica trên Drive (nửa phải header) – upload src/assets/konica.png
  primary: '#2a5688',
  primaryLight: '#3f7cbb',
  navy: '#1d3a5c',
};

var PROFILE = {
  fileId: '1XyQjlpiJ8G6F5aGGYPBM4Y3VeY8HGu5N', // ID file PDF hồ sơ năng lực trên Drive (BẮT BUỘC nếu muốn đính kèm)
  attach: true, // true = đính kèm PDF vào email
  viewUrl: '', // (tuỳ chọn) link xem online; để trống sẽ tự tạo từ fileId
};

var HEADERS = ['Thời gian', 'Họ tên', 'Điện thoại', 'Email', 'Công ty', 'Dịch vụ', 'Nguồn', 'Email gửi'];

// ====================== ENDPOINTS ======================
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var emailStatus = sendThankYouEmail(data); // tự bắt lỗi, trả về chuỗi trạng thái
    appendRow(data, emailStatus);
    return json({ ok: true, email: emailStatus });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doGet() {
  return ContentService.createTextOutput('C-Print lead webhook is running.');
}

/**
 * CHẠY HÀM NÀY 1 LẦN trong trình chỉnh sửa (nút Run ▸ authorizeOnce) để:
 *  - Bật hộp cấp quyền -> chấp nhận quyền Gmail + Drive.
 *  - Gửi 1 email test cho chính tài khoản đang chạy, kèm PDF + logo.
 * Xem kết quả ở phần Execution log (Logger).
 */
function authorizeOnce() {
  var me = Session.getActiveUser().getEmail();
  var status = sendThankYouEmail({
    name: 'Test nội bộ C-Print',
    phone: '+84988315225',
    email: me,
    company: 'C-Print',
    service: 'In dữ liệu biến đổi VDP',
  });
  Logger.log('Gửi tới: ' + me + ' | Trạng thái: ' + status);
}

// ====================== GHI SHEET ======================
function appendRow(data, emailStatus) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  sheet.appendRow([
    data.submittedAt ? new Date(data.submittedAt) : new Date(),
    data.name || '',
    "'" + (data.phone || ''), // giữ nguyên dạng +84.../số 0 đầu
    data.email || '',
    data.company || '',
    data.service || '',
    data.source || '',
    emailStatus || '',
  ]);
}

// ====================== GỬI EMAIL ======================
function sendThankYouEmail(data) {
  try {
    var to = (data.email || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return 'Bỏ qua (email trống/không hợp lệ)';

    var options = { name: BRAND.name };
    if (BRAND.replyTo) options.replyTo = BRAND.replyTo;
    var warn = '';

    // Logo inline (nếu có & lấy được từ Drive)
    var inline = {};
    var logoOk = false;
    var konicaOk = false;
    if (BRAND.logoFileId) {
      try {
        inline.cprintLogo = DriveApp.getFileById(BRAND.logoFileId).getBlob();
        logoOk = true;
      } catch (e) {
        warn += ' | logo C-Print lỗi: ' + e;
      }
    }
    if (BRAND.konicaLogoFileId) {
      try {
        inline.konicaLogo = DriveApp.getFileById(BRAND.konicaLogoFileId).getBlob();
        konicaOk = true;
      } catch (e) {
        warn += ' | logo Konica lỗi: ' + e;
      }
    }
    // Logo đối tác (mỗi cái là 1 inline image riêng)
    var partnerCids = [];
    // Konica cũng là đối tác – tái dùng logo đã nạp ở header (không cần dán ID lần 2).
    if (konicaOk) partnerCids.push({ name: 'Konica Minolta', cid: 'konicaLogo' });
    (BRAND.partners || []).forEach(function (p, i) {
      if (!p.fileId) return;
      try {
        var cid = 'partner' + i;
        inline[cid] = DriveApp.getFileById(p.fileId).getBlob();
        partnerCids.push({ name: p.name, cid: cid });
      } catch (e) {
        warn += ' | logo ' + p.name + ' lỗi: ' + e;
      }
    });

    if (logoOk || konicaOk || partnerCids.length) options.inlineImages = inline;

    // Đính kèm hồ sơ PDF (lỗi thì BỎ QUA attachment nhưng VẪN gửi email)
    if (PROFILE.attach && PROFILE.fileId) {
      try {
        var blob = DriveApp.getFileById(PROFILE.fileId).getBlob();
        blob.setName('Ho so nang luc C-Print.pdf');
        options.attachments = [blob];
      } catch (e) {
        warn += ' | PDF lỗi: ' + e;
      }
    }

    // Build HTML sau khi biết logo có lấy được không (tránh ảnh vỡ)
    options.htmlBody = buildEmailHtml(data, logoOk, konicaOk, partnerCids);

    GmailApp.sendEmail(to, 'Cảm ơn Anh/Chị đã ghé thăm gian hàng C-Print', plainText(data), options);
    return warn ? ('OK (đã gửi, nhưng:' + warn + ')') : 'OK';
  } catch (err) {
    return 'Lỗi: ' + err;
  }
}

function plainText(data) {
  return [
    'Xin chào ' + (data.name || 'Anh/Chị') + ',',
    '',
    'Cảm ơn Quý Anh/Chị đã dành thời gian ghé thăm gian hàng C-Print & Konica Minolta.',
    '',
    'C-Print ghi nhận thông tin của Quý Anh/Chị:',
    '- Công ty: ' + (data.company || '-'),
    '- Lĩnh vực quan tâm: ' + (data.service || '-'),
    '',
    'Liên hệ:',
    '- Email: ' + BRAND.email,
    '- Điện thoại: ' + BRAND.phone,
    '- Địa chỉ: ' + BRAND.address,
    '',
    'Website: ' + BRAND.website,
    'Facebook: ' + BRAND.facebook,
    'YouTube: ' + BRAND.youtube,
    '',
    'Hồ sơ năng lực C-Print được đính kèm trong email này.',
    'Chúng tôi sẽ liên hệ với Quý Anh/Chị trong thời gian sớm nhất.',
    '',
    'Trân trọng,',
    'C-Print',
  ].join('\n');
}

// ====================== TEMPLATE HTML ======================
function buildEmailHtml(data, logoOk, konicaOk, partners) {
  var name = esc(data.name || 'Anh/Chị');
  var company = esc(data.company || '—');
  var service = esc(data.service || '—');
  var profileView = PROFILE.viewUrl || (PROFILE.fileId ? 'https://drive.google.com/file/d/' + PROFILE.fileId + '/view' : BRAND.website);

  // Logo C-Print (nửa trái) và Konica (nửa phải) – đặt trong ô nền trắng để nổi trên header xanh.
  var cprintLogo = logoOk
    ? '<img src="cid:cprintLogo" width="84" height="84" alt="C-Print" style="display:block;margin:0 auto;width:84px;height:84px;" />'
    : '<div style="font:700 22px/1 Arial,sans-serif;letter-spacing:2px;color:' + BRAND.primary + ';">C-PRINT</div>';
  var konicaLogo = konicaOk
    ? '<img src="cid:konicaLogo" width="146" alt="Konica Minolta" style="display:block;margin:0 auto;width:146px;height:auto;" />'
    : '<div style="font:700 16px/1.2 Arial,sans-serif;color:#007ec5;">KONICA<br>MINOLTA</div>';

  var logoBox = function (inner) {
    return '<div style="background:#ffffff;border-radius:14px;padding:14px 12px;text-align:center;">' + inner + '</div>';
  };

  // Dải logo thương hiệu phân phối – mỗi logo trong ô trắng bo góc, cao đồng đều.
  var partnersRow = (partners || []).map(function (p) {
    return '<td valign="middle" align="center" style="padding:5px;">' +
      '<div style="background:#ffffff;border:1px solid #e6edf4;border-radius:8px;padding:9px 8px;">' +
        '<img src="cid:' + p.cid + '" alt="' + esc(p.name) + '" height="30" style="height:30px;width:auto;max-width:118px;display:block;margin:0 auto;" />' +
      '</div></td>';
  }).join('');

  return '' +
'<!doctype html><html><body style="margin:0;padding:0;background:#eef3f8;">' +
'<div style="display:none;max-height:0;overflow:hidden;opacity:0;">Cảm ơn Anh/Chị đã ghé thăm gian hàng C-Print — hồ sơ năng lực đính kèm bên trong.</div>' +
'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef3f8;padding:24px 12px;">' +
'<tr><td align="center">' +
  '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(21,41,63,.12);font-family:Arial,Helvetica,sans-serif;">' +

    // Header: 2 cột — C-Print (trái) | Konica (phải)
    '<tr><td style="background:' + BRAND.primary + ';background:linear-gradient(135deg,' + BRAND.primaryLight + ',' + BRAND.primary + ');padding:28px 24px;">' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>' +
        '<td width="50%" valign="middle" style="padding:0 8px;">' + logoBox(cprintLogo) + '</td>' +
        '<td width="50%" valign="middle" style="padding:0 8px;">' + logoBox(konicaLogo) + '</td>' +
      '</tr></table>' +
      '<div style="color:rgba(255,255,255,.92);font:600 14px Arial,sans-serif;letter-spacing:.3px;text-align:center;margin-top:16px;">' + esc(BRAND.tagline) + '</div>' +
    '</td></tr>' +

    // Body
    '<tr><td style="padding:32px 32px 28px;color:#27313b;font-size:15px;line-height:1.6;">' +
      '<p style="margin:0 0 14px;">Xin chào <b style="color:' + BRAND.navy + ';">' + name + '</b>,</p>' +
      '<p style="margin:0 0 14px;">Cảm ơn Quý Anh/Chị đã dành thời gian ghé thăm gian hàng <b>C-Print &amp; Konica Minolta</b>.</p>' +
      '<p style="margin:0 0 14px;color:#5b6b7a;">C-Print ghi nhận thông tin của Quý Anh/Chị:</p>' +

      // Info card
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f6fb;border-left:4px solid ' + BRAND.primary + ';border-radius:10px;margin:0 0 22px;">' +
        '<tr><td style="padding:16px 18px;font-size:14px;line-height:1.7;color:#27313b;">' +
          '<span style="color:#7a8a9a;">Công ty:</span> <b>' + company + '</b><br>' +
          '<span style="color:#7a8a9a;">Lĩnh vực quan tâm:</span> <b>' + service + '</b>' +
        '</td></tr>' +
      '</table>' +

      '<p style="margin:0 0 16px;">Để tìm hiểu thêm về C-Print &amp; các giải pháp công nghệ ngành in nhãn, bao bì &amp; tem, Quý Anh/Chị có thể tham khảo:</p>' +

      // Buttons
      '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;"><tr>' +
        '<td style="padding-right:10px;">' + button('Truy cập Website', BRAND.website, true) + '</td>' +
        '<td>' + button('Xem Hồ sơ năng lực', profileView, false) + '</td>' +
      '</tr></table>' +

      ( (PROFILE.attach && PROFILE.fileId)
        ? '<p style="margin:0 0 16px;padding:12px 14px;background:#fff7ec;border:1px solid #ffe2b8;border-radius:10px;font-size:13.5px;color:#7a5a1e;"><b>Hồ sơ năng lực C-Print (PDF)</b> được đính kèm trong email này.</p>'
        : '' ) +

      '<p style="margin:0 0 14px;">Chúng tôi sẽ liên hệ với Quý Anh/Chị trong thời gian sớm nhất.</p>' +
      '<p style="margin:18px 0 4px;">Trân trọng,</p>' +
      '<p style="margin:0 0 18px;font-weight:700;color:' + BRAND.navy + ';">C-Print</p>' +

      // Khối liên hệ: email + SĐT + địa chỉ (đặt dưới chữ ký C-Print)
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f6fb;border-radius:10px;margin:0;">' +
        '<tr><td style="padding:14px 18px;font-size:14px;line-height:1.8;color:#27313b;">' +
          '<span style="color:#7a8a9a;">Email:</span> <a href="mailto:' + BRAND.email + '" style="color:' + BRAND.primary + ';font-weight:700;text-decoration:none;">' + esc(BRAND.email) + '</a><br>' +
          '<span style="color:#7a8a9a;">Điện thoại:</span> <a href="tel:' + BRAND.phone.replace(/\s/g, '') + '" style="color:' + BRAND.primary + ';font-weight:700;text-decoration:none;">' + esc(BRAND.phone) + '</a><br>' +
          '<span style="color:#7a8a9a;">📍 Địa chỉ:</span> ' + esc(BRAND.address) +
        '</td></tr>' +
      '</table>' +
    '</td></tr>' +

    // Footer
    '<tr><td style="background:' + BRAND.navy + ';padding:22px 24px;text-align:center;">' +
      '<table role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>' +
        socialLink('Website', BRAND.website) +
        socialLink('Facebook', BRAND.facebook) +
        socialLink('YouTube', BRAND.youtube) +
      '</tr></table>' +
      '<div style="margin-top:14px;color:#aebfd2;font-size:12px;line-height:1.6;">' +
        '© ' + new Date().getFullYear() + ' C-Print — ' + esc(BRAND.tagline) + '<br>' +
        '<span style="color:#8fa3bb;">' + esc(BRAND.note) + '</span>' +
      '</div>' +
    '</td></tr>' +

    // Dải logo đối tác (dưới cùng)
    ( partnersRow
      ? '<tr><td style="padding:20px 18px;background:#fafcfe;border-top:1px solid #eef2f6;">' +
          '<div style="color:#7a8a9a;font-size:11.5px;letter-spacing:.6px;text-transform:uppercase;margin-bottom:12px;text-align:center;">Đối tác</div>' +
          '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>' + partnersRow + '</tr></table>' +
        '</td></tr>'
      : '' ) +

  '</table>' +
'</td></tr></table>' +
'</body></html>';
}

function button(label, url, primary) {
  var bg = primary ? BRAND.primary : '#ffffff';
  var color = primary ? '#ffffff' : BRAND.primary;
  var border = primary ? BRAND.primary : '#cfdcea';
  return '<a href="' + url + '" target="_blank" style="display:inline-block;background:' + bg + ';color:' + color +
    ';border:1.5px solid ' + border + ';text-decoration:none;font:600 14px Arial,sans-serif;padding:11px 18px;border-radius:10px;">' +
    label + '</a>';
}

function socialLink(label, url) {
  return '<td style="padding:0 8px;"><a href="' + url + '" target="_blank" style="color:#dce8f5;text-decoration:none;font:600 13px Arial,sans-serif;">' + label + '</a></td>';
}

// ====================== TIỆN ÍCH ======================
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
