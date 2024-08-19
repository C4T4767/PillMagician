import 'package:flutter/material.dart';
import 'package:pill_magician/API/APIService.dart';
import 'package:pill_magician/Storage/SessionManager.dart';

import '../MyPage.dart';

class PasswordChange extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final TextEditingController _currentPasswordController = TextEditingController();
    final TextEditingController _newPasswordController = TextEditingController();
    final TextEditingController _confirmPasswordController = TextEditingController();
    final APIService _apiService = APIService();

        return FutureBuilder<String?>(
      future: SessionManager.getUserNum(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          // 데이터를 아직 가져오는 중인 경우 표시할 위젯
          return CircularProgressIndicator();
        } else {
          // 데이터를 가져온 후에는 위젯을 빌드하고 사용할 수 있습니다.
          final String? userNum = snapshot.data;

    return Scaffold(
      appBar: AppBar(
        title: Text('비밀번호 변경'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextField(
              controller: _currentPasswordController,
              decoration: InputDecoration(labelText: '현재 비밀번호'),
              obscureText: true,
            ),
            SizedBox(height: 10),
            TextField(
              controller: _newPasswordController,
              decoration: InputDecoration(labelText: '새로운 비밀번호'),
              obscureText: true,
            ),
            SizedBox(height: 10),
            TextField(
              controller: _confirmPasswordController,
              decoration: InputDecoration(labelText: '새로운 비밀번호 확인'),
              obscureText: true,
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                if (userNum != null) {
                String currentPassword = _currentPasswordController.text;
                String newPassword = _newPasswordController.text;
                String confirmPassword = _confirmPasswordController.text;

                if (newPassword == confirmPassword) {
                  Map<String, dynamic> userData = {
                    'user_num': userNum,
                    'current_password': currentPassword,
                    'new_password': newPassword,
                  };
                  _apiService.updateUser(userData).then((responseData) {
                    if (responseData['success']) {
                    // API 호출 후 처리할 내용
                    showDialog(
                            context: context,
                            builder: (BuildContext context) {
                              return AlertDialog(
                                title: Text('안내'),
                                content: Text('변경되었습니다'),
                                actions: [
                                  TextButton(
                                    onPressed: () {
                                      Navigator.pop(context); // 다이얼로그 닫기
                                      Navigator.pushReplacement(
                                        context,
                                        MaterialPageRoute(
                                          builder: (context) => MyPage(), // 마이페이지로 이동
                                          ),
                                          );
                                          },
                                    child: Text('확인'),
                                  ),
                                ],
                              );
                            },
                          );
                  } else {
                    // 변경 실패 시 백엔드에서 전달한 메시지를 표시
                    print(responseData['message']);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text(responseData['message'])),
                      );
                      }
                });
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('새로운 비밀번호가 일치하지 않습니다.')),
                  );
                }
                }
              },
              child: Text('변경'),
            ),
                ],
              ),
            ),
          );
        }
      },
    );
  }
}