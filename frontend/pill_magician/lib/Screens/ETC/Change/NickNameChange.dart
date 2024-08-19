import 'package:flutter/material.dart';
import 'package:pill_magician/API/APIService.dart';
import 'package:pill_magician/Storage/SessionManager.dart';

import '../MyPage.dart';

class NickNameChange extends StatefulWidget {
  @override
  _NickNameChangeState createState() => _NickNameChangeState();
}

class _NickNameChangeState extends State<NickNameChange> {
  final TextEditingController _newNicknameController = TextEditingController();
  late APIService _apiService;
  String? _userNum;

  @override
  void initState() {
    super.initState();
    _apiService = APIService();
    _getUserNum();
  }

  void _getUserNum() async {
    _userNum = await SessionManager.getUserNum();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('닉네임 변경'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextField(
              controller: _newNicknameController,
              decoration: InputDecoration(labelText: '새로운 닉네임'),
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                String newNickname = _newNicknameController.text;
                if (newNickname.isNotEmpty && _userNum != null) {
                  Map<String, dynamic> userData = {
                    'user_num': _userNum,
                    'user_nickname': newNickname,
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
                    SnackBar(content: Text('새로운 닉네임을 입력해주세요.')),
                  );
                }
              },
              child: Text('변경'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _newNicknameController.dispose();
    super.dispose();
  }
}
