// ===========================================
// ROUTING & TEMPLATING
// ===========================================

function doGet() {
  var template = HtmlService.createTemplateFromFile('Index');
  return template.evaluate()
      .setTitle('Đang tải khóa học...') // Title tạm thời
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ===========================================
// API: LẤY DỮ LIỆU (GET)
// ===========================================

function getSiteData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Helper: Chuyển Sheet thành Array of Objects
  const getSheetData = (sheetName) => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return [];
    const rawData = sheet.getDataRange().getValues();
    const headers = rawData[0];
    const data = rawData.slice(1);
    
    return data.map(row => {
      let obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
  };

  // Helper: Xử lý riêng sheet Cấu Hình (Chuyển thành Object Key-Value)
  const getConfigData = () => {
    const sheet = ss.getSheetByName('CauHinh');
    if (!sheet) return {};
    const data = sheet.getDataRange().getValues();
    let config = {};
    // Bỏ dòng tiêu đề, duyệt từ dòng 1
    for (let i = 1; i < data.length; i++) {
      if(data[i][0]) config[data[i][0]] = data[i][1];
    }
    return config;
  };

  // Trả về gói dữ liệu tổng hợp
  return {
    config: getConfigData(),
    benefits: getSheetData('LoiIch'),
    curriculum: getSheetData('NoiDungKhoaHoc'),
    instructor: getSheetData('GiangVien'),
    reviews: getSheetData('DanhGia')
  };
}

// ===========================================
// API: GỬI DỮ LIỆU (POST)
// ===========================================

function submitRegistration(formData) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('DangKy');
    
    if (!sheet) throw new Error("Không tìm thấy sheet 'DangKy'");

    // Validate cơ bản
    if (!formData.HoTen || !formData.SoDienThoai) {
      return { success: false, message: "Vui lòng điền đầy đủ thông tin!" };
    }

    sheet.appendRow([
      new Date(),
      formData.HoTen,
      formData.SoDienThoai,
      formData.Email || '',
      'Mới'
    ]);

    return { success: true, message: "Đăng ký thành công! Chúng tôi sẽ liên hệ sớm." };
  } catch (e) {
    return { success: false, message: "Lỗi hệ thống: " + e.toString() };
  }
}
