import 'package:flutter/material.dart';
import 'package:pill_magician/API/APIService.dart';
import 'package:pill_magician/Validation/EmailValidator.dart';
import 'package:pill_magician/Storage/SessionManager.dart';

import '../MyPage.dart';

class EmailChange extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final TextEditingController _newEmailController = TextEditingController();
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
        title: Text('이메일 변경'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextField(
              controller: _newEmailController,
              decoration: InputDecoration(labelText: '새로운 이메일'),
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                if (userNum != null) {
                String newEmail = _newEmailController.text;
                final user_emailValidator _user_emailValidator = user_emailValidator();
                if (_user_emailValidator.isValidEmail(newEmail)) {
                  Map<String, dynamic> userData = {
                    'user_num': userNum,
                    'user_email': newEmail,
                  };
                  _apiService.updateUser(userData).then((responseData) {
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
                  });
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('올바른 이메일 주소를 입력해주세요.')),
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