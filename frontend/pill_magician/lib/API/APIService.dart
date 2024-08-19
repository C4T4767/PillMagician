import 'dart:io';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:pill_magician/Storage/SessionManager.dart';
import '../Model/UserModel.dart';
import '../Model/PillModel.dart';
import 'dart:math';
import '../Model/MedicationInfo.dart';

class APIService { //에뮬레이터 http://10.0.2.2:3000 // 로컬 웹 http://127.0.0.1:3000
  final String _baseUrl = 'http://210.102.178.98:60003'; // 학과 서버 http://210.102.178.98:60003

  // 로그인 및 세션 생성
  Future<String?> login(String user_id, String user_password) async {
    final client = http.Client();
    final url = Uri.parse('$_baseUrl/userManagements/login');
    final response = await client.post(
      url,
      body: json.encode({'user_id': user_id, 'user_password': user_password}),
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      final sessionId = data['session_id'];
      final userNum = data['user_num'];
      
      // 세션 매니저를 사용하여 세션 ID와 사용자 번호 저장
    if (sessionId != null && userNum != null) {
      await SessionManager.saveSessionId(sessionId.toString());
      await SessionManager.saveUserNum(userNum.toString());
    }

    return userNum.toString(); // int 형식을 String으로 변환하여 반환
    } else if (response.statusCode == 401) {
      return null;
    } else {
      return null;
    }
  }

  // 로그아웃 및 세션 삭제
  Future<void> logout() async {
  final sessionId = await SessionManager.getSessionId();
  if (sessionId == null) {
    // 세션 ID가 없는 경우 처리
    print('로그아웃 실패: 세션 ID가 없습니다.');
    return;
  }

  final response = await http.post(
    Uri.parse('$_baseUrl/userManagements/logout'),
    headers: {
      'Content-Type': 'application/json',
      'session_id': sessionId, // 세션 ID 전달
    },
  );

  if (response.statusCode == 200) {
    // 세션 삭제 성공
    print('로그아웃 성공');
    // 세션 삭제 후 로컬에 저장된 세션 ID도 제거
    await SessionManager.clearSession();
  } else {
    throw Exception('로그아웃 실패: ${response.statusCode}');
  }
}

  Future<void> signUp(User user) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/userManagements/register'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode(user.toJson()),
    );

    if (response.statusCode == 200) {
      // 회원가입 성공
    } else {
      throw Exception('회원가입 실패: ${response.statusCode}');
    }
  }

  //회원탈퇴 
  Future<void> withdraw(String userNum) async {
    final sessionId = await SessionManager.getSessionId();
    if (sessionId == null) {
    // 세션 ID가 없는 경우 처리
    print('회원 탈퇴 실패: 세션 ID가 없습니다.');
    return;
  }

    final Map<String, dynamic> requestData = {
      'user_num': userNum,
    };

    final response = await http.delete(
      Uri.parse('$_baseUrl/userManagements/userDelete'),
      headers: {
        'Content-Type': 'application/json',
        'session_id': sessionId,
      },
      body: jsonEncode(requestData),
    );

    if (response.statusCode == 200) {
      // 회원 탈퇴 성공
      // 세션 삭제 후 로컬에 저장된 세션 ID도 제거
      await SessionManager.clearSession();
    } else {
      throw Exception('회원 탈퇴 실패: ${response.statusCode}');
    }
  }

  Future<http.Response> checkID(String user_id) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/userManagements/checkId'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'user_id': user_id}),
    );
    return response;
  }

// 사용자 닉네임이 존재하는지 확인
  Future<http.Response> checkNickname(String user_nickname) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/userManagements/checkNickname'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'user_nickname': user_nickname}),
    );
    return response;
  }

  Future<http.Response> findId(String user_name, String user_email) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/userManagements/findId'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'user_name': user_name, 'user_email': user_email}),
    );

    return response; // 반환 값 변경
  }


  Future<void> requestNewPassword(String userName, String userId, String userEmail) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/userManagements/resetPassword'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'user_name': userName,
          'user_id': userId,
          'user_email': userEmail,
        }),
      );

      // HTTP 응답 코드 확인
      if (response.statusCode == 200) {
        // 서버로부터의 응답을 JSON으로 변환
        Map<String, dynamic> responseData = json.decode(response.body);
        // 결과 처리
        String userPassword = responseData['user_password'];
        int resultCode = responseData['result_code'];
        String resultReq = responseData['result_req'];

        // TODO: 결과를 처리하는 추가적인 작업 수행

      } else {
        // 서버 오류 처리
        throw Exception('Failed to reset password. Error code: ${response.statusCode}');
      }
    } catch (e) {
      // 네트워크 오류 처리
      throw Exception('Network error: $e');
    }
  }


  Future<List<dynamic>> sendImage(String? userNum, File image) async {
    try {
      final uri = Uri.parse('$_baseUrl/users/search/image');
      final request = http.MultipartRequest('POST', uri)
        ..fields['user_num'] = userNum ?? ''
        ..files.add(await http.MultipartFile.fromPath('image', image.path));

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 200) {
        // API 호출이 성공하면 반환된 데이터를 파싱하여 Map으로 반환
        return json.decode(response.body)['itemList'];
      } else {
        // API 호출이 실패한 경우 예외 발생
        throw Exception('Failed to upload image: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Failed to upload image: $e');
    }
  }

  // 약물 검색
  Future<List<dynamic>> searchDrug(String itemName, String? userNum) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/users/search/name'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'item_name': itemName,
        'user_num': userNum}),
    );

    if (response.statusCode == 200) {
      return json.decode(response.body)['itemList'];
    } else {
      throw Exception('Failed to search drug: ${response.statusCode}');
    }
  }

  Future<List<dynamic>> searchByPillFeature(PillFeatures pillFeatures) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/users/search/feature'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(pillFeatures.toJson()),
      );
      // print(pillFeatures);
      if (response.statusCode == 200) {
        return json.decode(response.body)['itemList'];
      } else {
        throw Exception('Failed to search drugs by feature: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Failed to search drugs by feature: $e');
    }
  }

  // 약물 상세보기
  Future<List<dynamic>> drugDetail(String? itemSeq) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/users/search/detail'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'item_seq': itemSeq}),
    );

    if (response.statusCode == 200) {
      return json.decode(response.body)['itemList'];
    } else {
      throw Exception('Failed to search drug: ${response.statusCode}');
    }
  }

  Future<Map<String, dynamic>> sendFeedback(String? userNum, String? itemSeq, String feedbackTitle, String feedbackContents, int feedbackRating, File? image) async {
    try {
      var request = http.MultipartRequest(
        'POST',
        Uri.parse('$_baseUrl/users/feedback'),
      );

      request.fields['user_num'] = userNum ?? '';
      request.fields['feedback_rating'] = feedbackRating.toString();
      request.fields['feedback_title'] = feedbackTitle;
      request.fields['feedback_contents'] = feedbackContents;

      if (itemSeq != null) {
        request.fields['item_seq'] = itemSeq;
      }

      if (image != null) {
        request.files.add(await http.MultipartFile.fromPath('image', image.path));
      }

      var response = await request.send();
      var responseData = await response.stream.toBytes();
      var responseString = String.fromCharCodes(responseData);

      if (response.statusCode == 200) {
        return {'result_code': 200, 'result_req': ''};
      } else {
        return {
          'result_code': response.statusCode,
          'result_req': responseString,
        };
      }
    } catch (e) {
      print('API 오류: $e');
      return {'result_code': 500, 'result_req': '서버 오류'};
    }
  }


  //사용자 정보
Future<Map<String, dynamic>> getUser(String userNum) async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/users/myPage/profile?userNum=$userNum'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        // 요청이 성공하면 파싱된 응답 데이터를 반환합니다.
        return json.decode(response.body)['user'];
      } else {
        // 요청이 실패하면 예외를 발생시킵니다.
        throw Exception('사용자 정보 가져오기 실패: ${response.statusCode}');
      }
    } catch (e) {
      // 네트워크 또는 예기치 않은 오류를 catch하여 처리합니다.
      throw Exception('사용자 정보 가져오기 실패: $e');
    }
  }

//사용자 설정 변경
Future<Map<String, dynamic>> updateUser(Map<String, dynamic> userData) async {
    try {
      final response = await http.put(
        Uri.parse('$_baseUrl/userManagements/userEdit'),
        body: json.encode(userData),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        // 요청이 성공하면 파싱된 응답 데이터를 반환합니다.
        return json.decode(response.body);
      } 
      if (response.statusCode == 401) {
        // 요청이 성공하면 파싱된 응답 데이터를 반환합니다.
        return json.decode(response.body);
      } else {
        // 요청이 실패하면 예외를 발생시킵니다.
        throw Exception('사용자 업데이트 실패: ${response.statusCode}');
      }
    } catch (e) {
      // 네트워크 또는 예기치 않은 오류를 catch하여 처리합니다.
      throw Exception('사용자 업데이트 실패: $e');
    }
  }

  Future<List<dynamic>> loadBookmarks(String? userNum) async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/users/myPage/bookmark?userNum=$userNum'),
        headers: {'Content-Type': 'application/json'},
        );
      if (response.statusCode == 200) {
        return json.decode(response.body)['bookmarkList'];
      } else {
        throw Exception('북마크 가져오기 실패');
      }
    } catch (e) {
      throw Exception('북마크 가져오기 실패: $e');
    }
  }

  Future<void> addBookmark(String? userNum, String? itemSeq) async {
    try {
      final response = await http.put(
        Uri.parse('$_baseUrl/users/myPage/bookmark'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'user_num': userNum, 'item_seq': itemSeq}),
      );
      if (response.statusCode == 200) {
        // 성공적으로 북마크 추가
        return;
      } else if (response.statusCode == 400) {
      // 이미 북마크된 알약인 경우
      throw Exception('이미 북마크한 알약입니다.');
      } else {
        throw Exception('북마크 추가 실패');
      }
    } catch (e) {
      throw Exception('북마크 추가 실패: $e');
    }
  }

  Future<void> deleteBookmark(String? userNum, String? itemSeq) async {
    try {
      final response = await http.delete(
        Uri.parse('$_baseUrl/users/myPage/bookmark?userNum=$userNum&itemSeq=$itemSeq'),
        headers: {'Content-Type': 'application/json'},
      );
      if (response.statusCode == 200) {
        // 성공적으로 북마크 삭제
        return;
      } else {
        throw Exception('북마크 삭제 실패');
      }
    } catch (e) {
      throw Exception('북마크 삭제 실패: $e');
    }
  }

  // 알람 저장
  Future<void> saveAlarm(MedicationInfo medicationInfo) async {
    final userNum = await SessionManager.getUserNum();
    if (userNum == null) {
      throw Exception('로그인이 필요합니다.');
    }

    final url = Uri.parse('$_baseUrl/users/alarm');
    final response = await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
        'user_num': userNum,
      },
      body: jsonEncode(medicationInfo.toJson()),
    );

    if (response.statusCode != 200) {
      throw Exception('알람 저장 실패: ${response.statusCode}');
    }
  }

  // 알람 불러오기
  Future<List<MedicationInfo>> fetchAlarms() async {
    final userNum = await SessionManager.getUserNum();
    if (userNum == null) {
      throw Exception('로그인이 필요합니다.');
    }

    final url = Uri.parse('$_baseUrl/users/alarm');
    final response = await http.get(
      url,
      headers: {
        'Content-Type': 'application/json',
        'user_num':userNum,
      },
    );

    if (response.statusCode == 200) {
      List<dynamic> data = jsonDecode(response.body)['alarmList'];
      return data.map((alarm) => MedicationInfo.fromJson(alarm)).toList();
    } else if (response.statusCode == 400) {
      throw Exception('알람이 없습니다.');
    } else {
      throw Exception('알람 불러오기 실패: ${response.statusCode}');
    }
  }

  //알람 수정
  Future<void> updateAlarm(MedicationInfo updatedMedicationInfo) async {
  try {
    final userNum = await SessionManager.getUserNum();
    if (userNum == null) {
      throw Exception('로그인이 필요합니다.');
    }

    final url = Uri.parse('$_baseUrl/users/alarm');
    final response = await http.put(
      url,
      headers: {
        'Content-Type': 'application/json',
        'user_num': userNum,
      },
      body: jsonEncode(updatedMedicationInfo.toJson()),
    );

    if (response.statusCode != 200) {
      throw Exception('알람 수정 실패: ${response.statusCode}');
    }
  } catch (error) {
    print('알람 수정 중 오류 발생: $error');
    rethrow; // 상위 레벨로 예외를 전파합니다.
  }
}

//알람 삭제
Future<void> deleteAlarm(int alarmNum) async {
  try {
    final userNum = await SessionManager.getUserNum();
    if (userNum == null) {
      throw Exception('로그인이 필요합니다.');
    }

    final url = Uri.parse('$_baseUrl/users/alarm/alarmDelete');
    final response = await http.delete(
      url,
      headers: {
        'Content-Type': 'application/json',
        'user_num': userNum,
      },
      body: json.encode({'alarmNum': alarmNum}),
    );

    if (response.statusCode != 200) {
      throw Exception('알람 삭제 실패: ${response.statusCode}');
    }
  } catch (error) {
    print('알람 삭제 중 오류 발생: $error');
    rethrow; // 상위 레벨로 예외를 전파합니다.
  }
}

}