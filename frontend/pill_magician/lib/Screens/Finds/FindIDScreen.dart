import 'package:flutter/material.dart';
import 'package:pill_magician/API/APIService.dart';
import 'dart:convert';


class FindIDScreen extends StatefulWidget {
  @override
  _FindIDScreenState createState() => _FindIDScreenState();
}

class _FindIDScreenState extends State<FindIDScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _apiService = APIService();

  String _userId = '';

  Future<void> _findId() async {
    final user_name = _nameController.text;
    final user_email = _emailController.text;

    try {
      final response = await _apiService.findId(user_name, user_email);

      if (response.statusCode == 200) {
        final responseData = json.decode(response.body);

        // API 응답에서 아이디 추출
        final user_id = responseData['user_id'];

        setState(() {
          _userId = user_id; // 상태 업데이트
        });
      } else {
        throw Exception('아이디 찾기 실패: ${response.statusCode}');
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('아이디 찾기 실패: $e')),
      );
    }
  }




  @override
  Widget build(BuildContext context) {
    double textFieldWidth = MediaQuery.of(context).size.width * 0.7;

    return Scaffold(
      appBar: AppBar(
        title: Text('아이디 찾기'),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(height: 40),
              Container(
                width: MediaQuery.of(context).size.width * 0.9, // 가로 길이의 90%
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
              SizedBox(height: 20),
              Container(
                width: MediaQuery.of(context).size.width * 0.9,
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
              SizedBox(height: 40),
              ElevatedButton(
                onPressed: _findId,
                child: Text('아이디 찾기'),
                style: ElevatedButton.styleFrom(
                  foregroundColor: Colors.white,
                  backgroundColor: Color(0xFF226FA9),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(15),
                  ),
                  minimumSize: Size(300, 60),
                ),
              ),
              SizedBox(height: 20),
              Visibility(
                visible: _userId.isNotEmpty,
                child: Text(
                  '아이디: $_userId',
                  style: TextStyle(fontSize: 18),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
