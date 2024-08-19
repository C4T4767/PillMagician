import 'package:shared_preferences/shared_preferences.dart';
import 'package:pill_magician/API/APIService.dart';

class SessionManager {
  static final String _keySessionId = 'session_id';
  static final String _keyUserNum = 'user_num';

  // 세션 ID 저장
  static Future<void> saveSessionId(String sessionId) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keySessionId, sessionId);
  }

  // 세션 ID 가져오기
  static Future<String?> getSessionId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keySessionId);
  }

  // 사용자 번호 저장
  static Future<void> saveUserNum(String userNum) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyUserNum, userNum);
  }

  // 사용자 번호 가져오기
  static Future<String?> getUserNum() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyUserNum);
  }

  // 세션 삭제
  static Future<void> clearSession() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keySessionId);
    await prefs.remove(_keyUserNum);
  }
}