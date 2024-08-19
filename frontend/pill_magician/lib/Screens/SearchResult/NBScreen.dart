import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';
import 'dart:convert';

class NBScreen extends StatefulWidget {
  final int itemSeq;

  NBScreen({required this.itemSeq});

  @override
  _NBScreenState createState() => _NBScreenState();
}

class _NBScreenState extends State<NBScreen> {
  String _htmlContent = '';

  @override
  void initState() {
    super.initState();
    // 아래 함수를 호출하여 HTML 내용을 가져옵니다.
    _fetchHtmlContent();
  }

  Future<void> _fetchHtmlContent() async {
    try {
      // Assets에 있는 HTML 파일의 경로를 지정합니다.
      String filePath = '../../../assets/html/${widget.itemSeq}/NB.html';
      // Assets에서 HTML 파일을 읽어옵니다.
      String htmlContent = await DefaultAssetBundle.of(context).loadString(filePath);
      setState(() {
        _htmlContent = htmlContent;
      });
    } catch (error) {
      print('Error fetching HTML content: $error');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('사용상의주의사항'),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: EdgeInsets.all(16.0),
          child: Html(data: _htmlContent), // 가져온 HTML 내용을 표시합니다.
        ),
      ),
    );
  }
}
