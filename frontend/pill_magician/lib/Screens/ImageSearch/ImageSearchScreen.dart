import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../../NavigationBar/BottomNavigationBar.dart';
import 'PreviewSendImageScreen.dart';

// XFile을 File로 변환하는 함수
File xFileToFile(XFile xFile) {
  return File(xFile.path);
}

class ImageSearchScreen extends StatefulWidget {
  @override
  _ImageSearchScreenState createState() => _ImageSearchScreenState();
}

class _ImageSearchScreenState extends State<ImageSearchScreen> {
  final ImagePicker _picker = ImagePicker();
  XFile? image;

  Future<void> _pickImageFromCamera() async {
    final pickedImage = await _picker.pickImage(source: ImageSource.camera);
    if (pickedImage != null) {
      File imageFile = xFileToFile(pickedImage);
      setState(() {
        image = pickedImage;
      });
      Navigator.push(
        context,
        MaterialPageRoute(builder: (context) => PreviewSendImageScreen(image: imageFile)),
      );
    }
  }

  Future<void> _pickImageFromGallery() async {
    final pickedImage = await _picker.pickImage(source: ImageSource.gallery);
    if (pickedImage != null) {
      File imageFile = xFileToFile(pickedImage); // XFile을 File로 변환
      setState(() {
        image = pickedImage;
      });
      Navigator.push(
        context,
        MaterialPageRoute(builder: (context) => PreviewSendImageScreen(image: imageFile)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'AI로 사진검색',
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
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Text(
              "AI로 사진검색하기",
              style: TextStyle(
                fontSize: 24.0,
                fontWeight: FontWeight.bold,
                color: Colors.blue[900], // 텍스트 색상 추가
                fontFamily: 'Raleway', // Google Fonts 등에서 가져온 글꼴 사용
              ),
            ),
            SizedBox(height: 30),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                buildSearchButton(
                  onPressed: _pickImageFromCamera,
                  icon: SvgPicture.asset(
                    'assets/imgs/Camera.svg',
                    width: 50,
                    height: 50,
                  ),
                  label: '카메라',
                ),
                SizedBox(width: 20),
                buildSearchButton(
                  onPressed: _pickImageFromGallery,
                  icon: Image.asset(
                    'assets/imgs/Image.png',
                    width: 50,
                    height: 50,
                  ),
                  label: '갤러리',
                ),
              ],
            ),
          ],
        ),
      ),
      bottomNavigationBar: CommonBottomNavigationBar(selectedIndex: 1),
    );
  }

  Widget buildSearchButton({required VoidCallback onPressed, required Widget icon, required String label}) {
    return Container(
      width: 150,
      height: 150,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20.0),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.5),
            spreadRadius: 2,
            blurRadius: 5,
            offset: Offset(0, 3),
          ),
        ],
      ),
      child: TextButton(
        onPressed: onPressed,
        style: ButtonStyle(
          padding: MaterialStateProperty.all<EdgeInsets>(EdgeInsets.all(16.0)),
          shape: MaterialStateProperty.all<RoundedRectangleBorder>(
            RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20.0),
            ),
          ),
          overlayColor: MaterialStateProperty.all<Color>(Colors.blue.withOpacity(0.1)),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            icon,
            SizedBox(height: 10),
            Text(
              label,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Colors.blue[900], // 텍스트 색상 변경
                fontFamily: 'Raleway', // 글꼴 설정
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
