import 'package:flutter/material.dart';
import 'package:pill_magician/Validation/UsernameChecker.dart';
import 'package:pill_magician/Validation/EmailValidator.dart';
import '../../API/APIService.dart';
import '../Model/UserModel.dart';
import '../Validation/NicknameChecker.dart';

class SignUpScreen extends StatefulWidget {
  @override
  _SignUpScreenState createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen> {
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _apiService = APIService();
  final _nicknameController = TextEditingController();
  final _userbirthController = TextEditingController();
  final _phoneController = TextEditingController();

  late UsernameChecker _usernameChecker; // UsernameChecker 인스턴스를 추가합니다.
  late NicknameChecker _nicknameChecker;


  @override
  void initState() {
    super.initState();
    _usernameChecker = UsernameChecker(_apiService); // UsernameChecker를 초기화합니다.
    _nicknameChecker = NicknameChecker(_apiService); // NicknameChecker를 초기화합니다.
  }


  // SignUpScreen.dart에서 회원가입 성공 후 로그인 페이지로 이동하는 코드

  Future<void> _signUp() async {
    final user_id = _usernameController.text;
    final user_password = _passwordController.text;
    final user_name = _nameController.text;
    final user_email = _emailController.text;
    final user_emailValidator _user_emailValidator = user_emailValidator();
    final user_nickname = _nicknameController.text;
    final user_birth = _userbirthController.text;
    final user_phone = _phoneController.text;

    // 이메일 형식 검증 추가
    if (!_user_emailValidator.isValidEmail(user_email)) {
      // 이메일 주소의 형식이 올바르지 않으면 사용자에게 알림
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('올바른 이메일 주소를 입력해주세요.')),
      );
      return;
    }

    final user = User(
        user_name: user_name,
        user_nickname: user_nickname,
        user_id: user_id,
        user_password: user_password,
        user_birth: user_birth,
        user_email: user_email,
        user_phone: user_phone
    );

    try {
      await _apiService.signUp(user);
      // 회원가입 성공 시 로그인 페이지로 이동
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('성공했습니다. 로그인 페이지로 이동합니다.')),
      );
      Navigator.of(context).pushReplacementNamed('/LoginScreen'); // 로그인 페이지로 이동
    } catch (e) {
      // 회원가입 실패 시 에러 메시지 표시
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('회원가입 실패: $e')),
      );
    }
  }


  @override
  Widget build(BuildContext context) {
    double textFieldWidth = MediaQuery
        .of(context)
        .size
        .width * 0.7;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          '회원가입',
          style: TextStyle(color: Colors.black),
        ),
        backgroundColor: Color(0xFFFFFFFF),
        iconTheme: IconThemeData(color: Colors.black),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start, // 이 부분을 추가하여 왼쪽 정렬
            children: [
              SizedBox(height: 40),
              Row(
                mainAxisAlignment: MainAxisAlignment.start,
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _usernameController,
                      decoration: InputDecoration(
                        labelText: '아이디: ',
                        hintText: '아이디를 입력하세요',
                        prefixIcon: Icon(Icons.person_4),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10.0),
                        ),
                      ),
                    ),
                  ),
                  SizedBox(width: 10),
                  ElevatedButton(
                    onPressed: () =>
                        _usernameChecker.checkUsername(_usernameController.text, context),
                    child: Text('중복 체크'),
                    style: ElevatedButton.styleFrom(
                      foregroundColor: Colors.white,
                      backgroundColor: Color(0xFF226FA9),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(5),
                      ),
                      minimumSize: Size(60, 60), // 버튼의 최소 크기를 설정
                    ),
                  ),
                ],
              ),
              SizedBox(height: 20),
              Container(
                width: textFieldWidth,
                child: TextFormField(
                  controller: _passwordController,
                  decoration: InputDecoration(
                    labelText: '비밀번호: ',
                    hintText: '비밀번호를 입력하세요',
                    prefixIcon: Icon(Icons.lock),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10.0),
                    ),
                  ),
                  obscureText: true,
                ),
              ),
              SizedBox(height: 20),
              Container(
                width: textFieldWidth,
                child: TextFormField(
                  controller: _nameController,
                  decoration: InputDecoration(
                    labelText: '이름: ',
                    hintText: '이름을 입력하세요',
                    prefixIcon: Icon(Icons.person_2),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10.0),
                    ),
                  ),
                ),
              ),
              SizedBox(height: 20),
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
              SizedBox(height: 40),
              Row(
                mainAxisAlignment: MainAxisAlignment.start,
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _nicknameController,
                      decoration: InputDecoration(
                        labelText: '닉네임: ',
                        hintText: '닉네임을 입력하세요',
                        prefixIcon: Icon(Icons.person_4),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10.0),
                        ),
                      ),
                    ),
                  ),
                  SizedBox(width: 10),
                  ElevatedButton(
                    onPressed: () =>
                        _nicknameChecker.checkNickname(_nicknameController.text, context),
                    child: Text('중복 체크'),
                    style: ElevatedButton.styleFrom(
                      foregroundColor: Colors.white,
                      backgroundColor: Color(0xFF226FA9),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(5),
                      ),
                      minimumSize: Size(60, 60), // 버튼의 최소 크기를 설정
                    ),
                  ),
                ],
              ),
              SizedBox(height: 20),
              Container(
                width: textFieldWidth,
                child: TextFormField(
                  controller: _userbirthController,
                  decoration: InputDecoration(
                    labelText: '생년월일: ',
                    hintText: 'YYYY-MM-DD',
                    prefixIcon: Icon(Icons.calendar_today),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10.0),
                    ),
                  ),
                ),
              ),
              SizedBox(height: 20),
              Container(
                width: textFieldWidth,
                child: TextFormField(
                  controller: _phoneController,
                  decoration: InputDecoration(
                    labelText: '전화번호: ',
                    hintText: '010-xxxx-xxxx',
                    prefixIcon: Icon(Icons.phone),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10.0),
                    ),
                  ),
                ),
              ),
              SizedBox(height: 80),
              Row(
                mainAxisAlignment: MainAxisAlignment.center, // 가운데 정렬
                children: [
                  Container(
                    width: MediaQuery.of(context).size.width * 0.7, // 원하는 너비로 설정
                    child: ElevatedButton(
                      onPressed: _signUp,
                      child: Text('가입하기'),
                      style: ElevatedButton.styleFrom(
                        foregroundColor: Colors.white,
                        backgroundColor: Color(0xFF226FA9),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(15),
                        ),
                        elevation: 5.0,
                        minimumSize: Size(double.infinity, 50), // 최소 크기를 설정
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}