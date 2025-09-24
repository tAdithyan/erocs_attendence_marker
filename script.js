// Fixed company location (latitude, longitude)
const COMPANY_LAT = 10.5276;   // Example: Thrissur
const COMPANY_LNG = 76.2144;
const ALLOWED_DISTANCE = 0.1; // in km (100 meters)

function doGet(e) {
  return HtmlService.createHtmlOutputFromFile("index"); 
}

function recordAttendance(employeeId, lat, lng) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Attendance");
  const now = new Date();

  // Calculate distance
  const distance = getDistanceFromLatLonInKm(lat, lng, COMPANY_LAT, COMPANY_LNG);

  if (distance <= ALLOWED_DISTANCE) {
    sheet.appendRow([employeeId, "", Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd"), 
                    Utilities.formatDate(now, Session.getScriptTimeZone(), "HH:mm:ss"), lat, lng, "Present"]);
    return "✅ Attendance Marked";
  } else {
    return "❌ You are not at company location!";
  }
}

// Distance calculation (Haversine Formula)
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = deg2rad(lat2-lat1);
  const dLon = deg2rad(lon2-lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}
