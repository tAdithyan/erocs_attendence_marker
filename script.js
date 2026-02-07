// Fixed company location (latitude, longitude)
const COMPANY_LAT = 10.5276;   // Example: Thrissur
const COMPANY_LNG = 76.2144;
const ALLOWED_DISTANCE = 0.1; // in km (100 meters)

function doGet() {
  return HtmlService.createHtmlOutputFromFile("index");
}

function doPost(e) {
  try {
    const { name, id, userType, course, latitude, longitude } = e.parameter;

    // Ensure userType is defined before checking location or attendance
    if (!name || !id || !userType) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: "error", message: "Missing required fields" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    // Location verification only for employees
    if (userType === 'employee') {
      if (!latitude || !longitude) {
        return ContentService
          .createTextOutput(JSON.stringify({ status: "error", message: "Location data required for employees" }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      // Calculate distance from company location
      const distance = getDistanceFromLatLonInKm(lat, lng, COMPANY_LAT, COMPANY_LNG);

      if (distance > ALLOWED_DISTANCE) {
        return ContentService
          .createTextOutput(JSON.stringify({
            status: "error",
            message: `You are ${distance.toFixed(2)}km away from the allowed location!`
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }

    // Record attendance based on user type
    const result = recordAttendance(name, id, userType, course, lat, lng);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", message: result }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function recordAttendance(name, id, userType, course, lat, lng) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const now = new Date();
  const date = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd");
  const time = Utilities.formatDate(now, Session.getScriptTimeZone(), "HH:mm:ss");

  if (userType === 'employee') {
    // Get or create Employee Attendance sheet
    let sheet = spreadsheet.getSheetByName("Employee_Attendance");
    if (!sheet) {
      sheet = spreadsheet.insertSheet("Employee_Attendance");
      sheet.getRange(1, 1, 1, 7).setValues([["Name", "Employee ID", "Date", "Time", "Latitude", "Longitude", "Status"]]);
    }

    sheet.appendRow([name, id, date, time, lat, lng, "Present"]);
    return "Employee attendance marked successfully!";

  } else if (userType === 'student') {
    // Get or create Student Attendance sheet
    let sheet = spreadsheet.getSheetByName("Student_Attendance");
    if (!sheet) {
      sheet = spreadsheet.insertSheet("Student_Attendance");
      sheet.getRange(1, 1, 1, 6).setValues([["Name", "Student ID", "Course", "Date", "Time", "Status"]]);
    }

    // For students, no location data is stored
    sheet.appendRow([name, id, course, date, time, "Present"]);
    return "Student attendance marked successfully!";
  }

  throw new Error("Invalid user type");
}

// Distance calculation (Haversine Formula)
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
