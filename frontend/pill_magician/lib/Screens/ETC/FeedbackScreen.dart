import 'package:flutter/material.dart';
import 'package:pill_magician/API/APIService.dart';
import 'package:pill_magician/Storage/SessionManager.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';

class FeedbackScreen extends StatefulWidget {
  final String? itemSeq; // 알약의 식별번호

  FeedbackScreen({Key? key, this.itemSeq}) : super(key: key);

  @override
  _FeedbackScreenState createState() => _FeedbackScreenState();
}

class _FeedbackScreenState extends State<FeedbackScreen> {
  double _rating = 0.0;
  TextEditingController _feedbackTitleController = TextEditingController();
  TextEditingController _feedbackContentsController = TextEditingController();
  String? _userNum; //사용자 번호
  File? _image; // 선택한 이미지 파일

  Future<void> _sendFeedback() async {
    final userNum = await SessionManager.getUserNum();
    // print('userNum: $userNum');
    if (userNum != null) {
      setState(() {
        _userNum = userNum;
      });
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('로그인 후 피드백을 작성해주세요.'),
        ),
      );
      return;
    }

    // 사용자가 입력한 피드백을 가져옵니다.
    String feedbackTitle = _feedbackTitleController.text;
    String feedbackContents = _feedbackContentsController.text;

    // 사용자가 선택한 별점을 가져옵니다.
    int feedbackRating = _rating.toInt();

    // APIService를 사용하여 피드백을 서버로 전송합니다.
    var result = await APIService().sendFeedback(
      _userNum,
      widget.itemSeq,
      feedbackTitle,
      feedbackContents,
      feedbackRating,
      _image,
    );
    // 결과에 따라 알림을 표시합니다.
    if (result['result_code'] == 200) {
      // 성공적으로 전송된 경우
      showDialog(
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            title: Text('전송 성공'),
            content: Text('피드백이 성공적으로 전송되었습니다.'),
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
    } else {
      // 전송에 실패한 경우
      showDialog(
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            title: Text('전송 실패'),
            content:
                Text('피드백을 전송하는 중 오류가 발생했습니다. 오류 코드: ${result['result_code']}'),
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
  }

  Future<void> _pickImage() async {
    final pickedFile =
        await ImagePicker().pickImage(source: ImageSource.gallery);

    setState(() {
      if (pickedFile != null) {
        _image = File(pickedFile.path);
      } else {
        print('No image selected.');
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          '피드백',
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
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            if (widget.itemSeq != null)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 8.0),
                child: Text(
                  '알약 식별번호: ${widget.itemSeq}',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.blue[900],
                    fontFamily: 'Raleway',
                  ),
                ),
              ),
            SizedBox(height: 10),
            TextField(
              controller: _feedbackTitleController,
              decoration: InputDecoration(
                hintText: '피드백 제목',
                hintStyle: TextStyle(color: Colors.grey[600], fontFamily: 'Raleway'),
                focusedBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.blue[900]!),
                  borderRadius: BorderRadius.circular(10.0),
                ),
                enabledBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.grey[400]!),
                  borderRadius: BorderRadius.circular(10.0),
                ),
                filled: true,
                fillColor: Colors.white,
              ),
              maxLines: 1,
            ),
            SizedBox(height: 10),
            TextField(
              controller: _feedbackContentsController,
              decoration: InputDecoration(
                hintText: '피드백 내용을 입력해주세요...',
                hintStyle: TextStyle(color: Colors.grey[600], fontFamily: 'Raleway'),
                focusedBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.blue[900]!),
                  borderRadius: BorderRadius.circular(10.0),
                ),
                enabledBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.grey[400]!),
                  borderRadius: BorderRadius.circular(10.0),
                ),
                filled: true,
                fillColor: Colors.white,
              ),
              maxLines: 5,
            ),
            SizedBox(height: 20),
            if (_image != null)
              Image.file(
                _image!,
                height: 150,
                width: 150,
              ),
            TextButton(
              onPressed: _pickImage,
              child: Text('이미지 선택'),
            ),
            SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  '별점: ',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.blue[900],
                    fontFamily: 'Raleway',
                  ),
                ),
                SizedBox(width: 10),
                Row(
                  children: List.generate(
                    5,
                        (index) => IconButton(
                      icon: Icon(
                        index < _rating.ceil() ? Icons.star : Icons.star_border,
                        color: Colors.orange,
                        size: 30,
                      ),
                      onPressed: () {
                        setState(() {
                          _rating = index + 1.0;
                        });
                      },
                    ),
                  ),
                ),
              ],
            ),
            SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _sendFeedback,
                child: Text('전송하기', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blue[700], // 버튼 배경색을 진한 파란색으로 설정
                  padding: EdgeInsets.symmetric(vertical: 16.0),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20.0),
                  ),
                  textStyle: TextStyle(fontSize: 18, fontFamily: 'Raleway'),
                  elevation: 5, // 버튼에 그림자 추가
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _feedbackTitleController.dispose();
    _feedbackContentsController.dispose();
    super.dispose();
  }
}
