import 'package:flutter/material.dart';
import 'package:pill_magician/API/APIService.dart';
import 'package:pill_magician/Storage/SessionManager.dart';

import '../MyPage.dart';

class NameChange extends StatefulWidget {
  @override
  _NameChangeState createState() => _NameChangeState();
}

class _NameChangeState extends State<NameChange> {
  final TextEditingController _newNameController = TextEditingController();
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
        title: Text('이름 변경'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextField(
              controller: _newNameController,
              decoration: InputDecoration(labelText: '새로운 이름'),
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                String newName = _newNameController.text;
                if (newName.isNotEmpty && _userNum != null) {
                  Map<String, dynamic> userData = {
                    'user_num': _userNum,
                    'user_name': newName,
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
    _newNameController.dispose();
    super.dispose();
  }
}
