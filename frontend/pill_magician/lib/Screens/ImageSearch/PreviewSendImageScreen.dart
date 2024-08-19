import 'dart:io';
import 'package:flutter/material.dart';
import 'package:pill_magician/Screens/SearchResult/ImageSearchResultScreen.dart';
import 'package:path/path.dart' as path;
import 'package:pill_magician/API/APIService.dart';
import 'package:pill_magician/Storage/SessionManager.dart';

class PreviewSendImageScreen extends StatefulWidget {
  final File image;

  const PreviewSendImageScreen({Key? key, required this.image}) : super(key: key);

  @override
  _PreviewSendImageScreenState createState() => _PreviewSendImageScreenState();
}

class _PreviewSendImageScreenState extends State<PreviewSendImageScreen> {
  final TextEditingController _userNumController = TextEditingController();

  @override
  void dispose() {
    _userNumController.dispose();
    super.dispose();
  }

  Future<void> _sendImage(BuildContext context) async {
    try {
      APIService apiService = APIService(); // APIService 인스턴스 생성

      // 이미 로그인한 사용자의 식별번호를 가져옴
      String? userNum = await SessionManager.getUserNum();

      // 이미지 파일을 서버로 전송하고 응답을 받습니다.
      List<dynamic> response = await apiService.sendImage(userNum, widget.image);

      // 응답이 성공인 경우 SearchResultScreen으로 이동합니다.
      if (response != null) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ImageSearchResultScreen(
              itemList: response,
            ),
          ),
        );
      } else {
        // 실패한 경우 오류 메시지를 보여줍니다.
        showDialog(
          context: context,
          builder: (BuildContext context) {
            return AlertDialog(
              title: Text('이미지 전송 실패'),
              content: Text('서버로부터의 응답을 처리할 수 없습니다.'),
              actions: <Widget>[
                TextButton(
                  onPressed: () {
                    Navigator.of(context).pop();
                  },
                  child: Text('확인'),
                ),
              ],
            );
          },
        );
      }
    } catch (e) {
      print('이미지 전송 에러: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          '미리 보기',
          style: TextStyle(
            color: Colors.blue[900], // 텍스트 색상 변경
            fontWeight: FontWeight.bold, // 텍스트 굵게
            fontFamily: 'Raleway', // 글꼴 설정
          ),
        ),
        backgroundColor: Colors.lightBlue[50], // 배경색 변경
        iconTheme: IconThemeData(color: Colors.blue[900]),
        elevation: 0, // 그림자 효과 제거
      ),
      body: SingleChildScrollView(
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                margin: EdgeInsets.all(20),
                padding: EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.grey.withOpacity(0.5),
                      spreadRadius: 5,
                      blurRadius: 7,
                      offset: Offset(0, 3),
                    ),
                  ],
                ),
                child: Container(
                  padding: EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.blue[300]!, width: 4), // 파란색 테두리를 두껍게 변경
                    borderRadius: BorderRadius.circular(15),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: Image.file(
                      widget.image,
                      height: 300,
                      width: 300,
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
              ),
              SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  ElevatedButton(
                    onPressed: () {
                      _sendImage(context); // 이미지를 서버로 전송합니다.
                    },
                    child: Text(
                      '이미지 전송',
                      style: TextStyle(
                        color: Colors.white,
                        fontFamily: 'Raleway',
                      ),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue[700], // 버튼 배경색 변경
                      padding: EdgeInsets.symmetric(vertical: 16.0, horizontal: 24.0),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20.0),
                      ),
                    ),
                  ),
                  SizedBox(width: 20),
                  ElevatedButton(
                    onPressed: () {
                      Navigator.pop(context);
                    },
                    child: Text(
                      '취소',
                      style: TextStyle(
                        color: Colors.white,
                        fontFamily: 'Raleway',
                      ),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.grey[700], // 버튼 배경색 변경
                      padding: EdgeInsets.symmetric(vertical: 16.0, horizontal: 24.0),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20.0),
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
