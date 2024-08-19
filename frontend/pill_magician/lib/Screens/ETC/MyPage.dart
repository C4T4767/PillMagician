import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import 'Change/BirthChange.dart';
import 'Change/EmailChange.dart';
import 'Change/NameChange.dart';
import 'Change/NickNameChange.dart';
import 'Change/PasswordChange.dart';
import 'Change/PhoneChange.dart';
import 'package:pill_magician/API/APIService.dart';
import 'package:pill_magician/Storage/SessionManager.dart';

class MyPage extends StatefulWidget {
  @override
  _MyPageState createState() => _MyPageState();
}

class _MyPageState extends State<MyPage> {
  late Future<Map<String, dynamic>> _userDataFuture;

  @override
  void initState() {
    super.initState();
    _userDataFuture = _getUserData();
  }

  Future<Map<String, dynamic>> _getUserData() async {
    final userNum = await SessionManager.getUserNum();
    if (userNum == null) {
      await _showLoginAlertDialog();
      return {'name': '', 'nickname': '', 'email': '', 'phone': '', 'birth': '', 'id': ''};
    } else {
      return APIService().getUser(userNum);
    }
  }

  Future<void> _showLoginAlertDialog() async {
    return showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('로그인 필요'),
          content: SingleChildScrollView(
            child: ListBody(
              children: <Widget>[
                Text('로그인 후에 이용 가능합니다.'),
              ],
            ),
          ),
          actions: <Widget>[
            TextButton(
              child: Text('확인'),
              onPressed: () {
                Navigator.of(context).pop();
                Navigator.of(context).pop();
              },
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          '마이페이지',
          style: TextStyle(
            color: Colors.blue[900],
            fontWeight: FontWeight.bold,
            fontFamily: 'Raleway',
          ),
        ),
        backgroundColor: Colors.lightBlue[50],
        iconTheme: IconThemeData(color: Colors.blue[900]),
        elevation: 0,
      ),
      body: FutureBuilder<Map<String, dynamic>>(
        future: _userDataFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text('오류 발생: ${snapshot.error}'));
          } else {
            final userData = snapshot.data!;
            return Padding(
              padding: const EdgeInsets.all(16.0),
              child: ListView(
                children: <Widget>[
                  _buildHeader(userData['nickname']),
                  SizedBox(height: 20),
                  _buildListTile('이름', userData['name'], Icons.person, NameChange()),
                  _buildListTile('닉네임', userData['nickname'], Icons.person, NickNameChange()),
                  _buildListTile('대표 이메일', userData['email'], Icons.email, EmailChange()),
                  _buildListTile('휴대폰 번호', userData['phone'], Icons.phone, PhoneChange()),
                  _buildListTile('생년월일', userData['birth'], Icons.cake, BirthChange()),
                  _buildListTile('아이디', userData['id'], Icons.account_circle, null),
                  _buildListTile('비밀번호 수정', '****', Icons.lock, PasswordChange()),
                ],
              ),
            );
          }
        },
      ),
    );
  }

  Widget _buildHeader(String nickname) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '환영합니다, $nickname!',
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: Colors.blue[900],
            fontFamily: 'Raleway',
          ),
        ),
        SizedBox(height: 10),
        Text(
          '아래 정보를 확인하고 수정할 수 있습니다.',
          style: TextStyle(
            fontSize: 16,
            color: Colors.blue[700],
            fontFamily: 'Raleway',
          ),
        ),
      ],
    );
  }

  Widget _buildListTile(String title, String subtitle, IconData? icon, Widget? page) {
    return Card(
      margin: EdgeInsets.symmetric(vertical: 8.0),
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20.0),
      ),
      child: ListTile(
        leading: icon != null ? Icon(icon, color: Colors.blue[900]) : null,
        title: Text(
          title,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Colors.blue[900],
            fontFamily: 'Raleway',
          ),
        ),
        subtitle: Text(
          subtitle,
          style: TextStyle(
            fontSize: 16,
            color: Colors.grey[700],
            fontFamily: 'Raleway',
          ),
        ),
        trailing: page != null ? Icon(Icons.arrow_forward_ios, color: Colors.blue[900]) : null,
        onTap: page != null
            ? () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => page),
          );
        }
            : null,
      ),
    );
  }
}
