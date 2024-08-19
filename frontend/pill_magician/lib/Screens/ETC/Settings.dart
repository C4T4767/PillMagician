import 'package:flutter/material.dart';
import 'package:pill_magician/API/APIService.dart';
import 'package:pill_magician/Screens/LoginScreen.dart';
import 'package:pill_magician/Storage/SessionManager.dart';

class SettingsPage extends StatefulWidget {
  final String sessionId;

  SettingsPage({required this.sessionId});

  @override
  _SettingsPageState createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  bool smsNotification = false;
  bool emailNotification = false;
  bool pushNotification = false;

  final APIService _apiService = APIService();

  void _logout() async {
  try {
    final sessionId = await SessionManager.getSessionId();
    if (sessionId != null) {
      await _apiService.logout();
      await SessionManager.clearSession(); // 세션 관리자를 통해 세션 정보 삭제
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (context) => LoginScreen()),
      );

      // 스낵바 표시
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('로그아웃 되었습니다.'),
          duration: Duration(seconds: 2), // Snackbar가 표시될 시간 설정
        ),
      );
    } else {
      // 세션 ID가 없는 경우에 대한 처리
      print('로그아웃 실패: 세션 ID가 없습니다.');
    }
  } catch (e) {
    // 오류 처리
    print('로그아웃 실패: $e');
  }
}

  void _withdraw() async {
  try {
    final userNum = await SessionManager.getUserNum();
    if (userNum != null) {
      await _apiService.withdraw(userNum);
      // 회원 탈퇴 성공 시 세션 정보 삭제 후 로그인 화면으로 이동
      await SessionManager.clearSession();
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (context) => LoginScreen()),
      );

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('회원 탈퇴 되었습니다.'),
          duration: Duration(seconds: 2), // Snackbar가 표시될 시간 설정
        ),
      );
    } else {
      // 세션 ID가 없는 경우에 대한 처리
      print('회원 탈퇴 실패: 사용자 번호가 없습니다.');
    }
  } catch (e) {
    // 오류 처리
    print('회원 탈퇴 실패: $e');
  }
}


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('설정'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
      ),
      body: Padding(
        padding: const EdgeInsets.all(10.0),
        child: Column(
          children: <Widget>[
            ListTile(
              title: Text('SMS 알림', style: TextStyle(fontSize: 18)),
              trailing: Switch(
                value: smsNotification,
                onChanged: (bool value) {
                  setState(() {
                    smsNotification = value;
                  });
                },
              ),
            ),
            Divider(),
            ListTile(
              title: Text('이메일 알림', style: TextStyle(fontSize: 18)),
              trailing: Switch(
                value: emailNotification,
                onChanged: (bool value) {
                  setState(() {
                    emailNotification = value;
                  });
                },
              ),
            ),
            Divider(),
            ListTile(
              title: Text('푸시 알림', style: TextStyle(fontSize: 18)),
              trailing: Switch(
                value: pushNotification,
                onChanged: (bool value) {
                  setState(() {
                    pushNotification = value;
                  });
                },
              ),
            ),
            Divider(),
            SizedBox(height: 20),
            Container(
              width: MediaQuery.of(context).size.width * 0.8,
              child: ElevatedButton(
                onPressed: _logout,
                child: Text('로그아웃', style: TextStyle(fontSize: 18, color: Colors.white)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.pink[300],
                  minimumSize: Size(double.infinity, 50),
                ),
              ),
            ),
            SizedBox(height: 12),
            Container(
              width: MediaQuery.of(context).size.width * 0.8,
              child: ElevatedButton(
                onPressed: _withdraw,
                child: Text('회원탈퇴', style: TextStyle(fontSize: 18, color: Colors.white)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.orange[700],
                  minimumSize: Size(double.infinity, 50),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
