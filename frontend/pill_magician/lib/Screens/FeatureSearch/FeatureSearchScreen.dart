import 'package:flutter/material.dart';
import 'package:pill_magician/API/APIService.dart';
import 'package:pill_magician/Screens/SearchResult/FeatureSearchResultScreen.dart';
import 'package:pill_magician/Storage/SessionManager.dart';
import '../../Model/PillModel.dart';
import '../../NavigationBar/BottomNavigationBar.dart';

class FeatureSearchScreen extends StatefulWidget {
  @override
  _FeatureSearchScreenState createState() => _FeatureSearchScreenState();
}

class _FeatureSearchScreenState extends State<FeatureSearchScreen> {
  final TextEditingController _itemNameController = TextEditingController();
  final TextEditingController _entpNameController = TextEditingController();
  final TextEditingController _drugShapeController = TextEditingController();
  final TextEditingController _colorClass1Controller = TextEditingController();
  final TextEditingController _colorClass2Controller = TextEditingController();
  final TextEditingController _printFrontController = TextEditingController();
  final TextEditingController _printBackController = TextEditingController();

  Future<void> _search() async {
    PillFeatures pillFeatures = PillFeatures(
      item_name: _itemNameController.text,
      entp_name: _entpNameController.text,
      drug_shape: _drugShapeController.text,
      color_class1: _colorClass1Controller.text,
      color_class2: _colorClass2Controller.text,
      print_front: _printFrontController.text,
      print_back: _printBackController.text,
    );

    // API 서비스 인스턴스 생성
    APIService apiService = APIService();

    // 알약 특징으로 검색 요청
    List<dynamic> response = await apiService.searchByPillFeature(pillFeatures);

    // 검색 결과를 받은 후에 FeatureSearchResultScreen으로 이동
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => FeatureSearchResultScreen(
          itemList: response,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          '특징으로 알약검색',
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
        padding: EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildTextField(_itemNameController, '알약 이름'),
            _buildTextField(_entpNameController, '업체명'),
            _buildTextField(_drugShapeController, '알약 모양'),
            _buildTextField(_colorClass1Controller, '색상1'),
            _buildTextField(_colorClass2Controller, '색상2'),
            _buildTextField(_printFrontController, '앞면 인쇄'),
            _buildTextField(_printBackController, '뒷면 인쇄'),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: _search,
              child: Text('검색', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
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
          ],
        ),
      ),
      bottomNavigationBar: CommonBottomNavigationBar(selectedIndex: 1),
    );
  }

  Widget _buildTextField(TextEditingController controller, String labelText) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: TextField(
        controller: controller,
        decoration: InputDecoration(
          labelText: labelText,
          labelStyle: TextStyle(
            color: Colors.blue[900], // 레이블 텍스트 색상 변경
            fontFamily: 'Raleway', // 글꼴 설정
          ),
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
      ),
    );
  }
}
