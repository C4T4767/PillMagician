import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:pill_magician/API/APIService.dart';

class FindPasswordScreen extends StatefulWidget {
  @override
  _FindPasswordScreenState createState() => _FindPasswordScreenState();
}

class _FindPasswordScreenState extends State<FindPasswordScreen> {
  final _nameController = TextEditingController();
  final _idController = TextEditingController();
  final _emailController = TextEditingController();
  final _apiService = APIService();

  Future<void> _requestNewPassword() async {
    final user_name = _nameController.text;
    final user_id = _idController.text;
    final user_email = _emailController.text;

    try {
      // 사용자의 정보를 서버에 전달하고 새로운 임시 비밀번호를 요청
      await _apiService.requestNewPassword(user_name, user_id, user_email);

      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Text('비밀번호 재설정 요청 성공'),
          content: Text('임시 비밀번호가 해당 이메일로 전송되었습니다.'),
          actions: <Widget>[
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: Text('확인'),
            ),
          ],
        ),
      );
    } catch (e) {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Text('에러'),
          content: Text('비밀번호 재설정 요청에 실패했습니다: $e'),
          actions: <Widget>[
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: Text('확인'),
            ),
          ],
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    double textFieldWidth = MediaQuery.of(context).size.width * 0.8;

    return Scaffold(
      appBar: AppBar(
        title: Text('비밀번호 재설정 요청'),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              SizedBox(height: 20),
              Text(
                '비밀번호를 재설정하기 위해 아래 정보를 입력하세요',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              SizedBox(height: 30),
              Container(
                width: textFieldWidth,
                child: TextFormField(
                  controller: _nameController,
                  decoration: InputDecoration(
                    labelText: '이름: ',
                    hintText: '이름을 입력하세요',
                    prefixIcon: Icon(Icons.person),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10.0),
                    ),
                  ),
                ),
              ),
              SizedBox(height: 15),
              Container(
                width: textFieldWidth,
                child: TextFormField(
                  controller: _idController,
                  decoration: InputDecoration(
                    labelText: 'ID: ',
                    hintText: '아이디를 입력하세요',
                    prefixIcon: Icon(Icons.person),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10.0),
                    ),
                  ),
                ),
              ),
              SizedBox(height: 15),
              Container(
                width: textFieldWidth,
                child: TextFormField(
                  controller: _emailController,
                  decoration: InputDecoration(
                    labelText: '이메일: ',
                    hintText: '이메일을 입력하세요',
                    prefixIcon: Icon(Icons.email),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10.0),
                    ),
                  ),
                ),
              ),
              SizedBox(height: 30),
              ElevatedButton(
                onPressed: _requestNewPassword,
                child: Text('새로운 비밀번호 요청'),
                style: ElevatedButton.styleFrom(
                  foregroundColor: Colors.white,
                  backgroundColor: Color(0xFF226FA9),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(15),
                  ),
                  minimumSize: Size(300, 60),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
