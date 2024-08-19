import 'package:flutter/material.dart';
import 'package:pill_magician/API/APIService.dart';
import 'package:pill_magician/Screens/ETC/FeedbackScreen.dart';

class BookmarkDetailScreen extends StatefulWidget {
  final String itemSeq;

  const BookmarkDetailScreen({Key? key, required this.itemSeq}) : super(key: key);

  @override
  _BookmarkDetailScreenState createState() => _BookmarkDetailScreenState();
}

class _BookmarkDetailScreenState extends State<BookmarkDetailScreen> {
  String? _itemSeq;
  List<Map<String, dynamic>> _results = [];

  @override
  void initState() {
    super.initState();
    _drugDetail();
  }

  void _drugDetail() async {
    try {
      final result = await APIService().drugDetail(widget.itemSeq);
      if (result.isNotEmpty) {
        setState(() {
          _results = result.map((item) => Map<String, dynamic>.from(item)).toList();
          if (_results.isNotEmpty && _results[0]['item_seq'] != null) {
            _itemSeq = _results[0]['item_seq'].toString();
          }
        });
      } else {
        _showErrorDialog('약물을 찾을 수 없습니다.');
      }
    } catch (e) {
      _showErrorDialog('약물을 검색하는 도중 오류가 발생했습니다. $e');
    }
  }

  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text('오류 발생'),
          content: Text(message),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
              },
              child: Text('확인'),
            ),
          ],
        );
      },
    );
  }

  Widget buildInfoRow(IconData icon, String label, String? value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: Colors.blue[700], size: 24),
          SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.blue[900],
                    fontFamily: 'Raleway',
                  ),
                ),
                SizedBox(height: 5),
                Text(
                  value ?? '',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey[700],
                    fontFamily: 'Raleway',
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Bookmark Result',
          style: TextStyle(
            color: Colors.blue[900],
            fontWeight: FontWeight.bold,
            fontFamily: 'Raleway',
          ),
        ),
        backgroundColor: Colors.lightBlue[50],
        iconTheme: IconThemeData(color: Colors.blue[900]),
        elevation: 0,
        actions: [
          IconButton(
            icon: Icon(Icons.feedback),
            tooltip: '해당 알약 정보에 문제가 있나요?',
            onPressed: () {
              if (_itemSeq != null) {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => FeedbackScreen(itemSeq: _itemSeq!)),
                );
              }
            },
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Center(
          child: _results.isNotEmpty
              ? ListView(
            children: _results.map((item) {
              return Card(
                margin: EdgeInsets.symmetric(vertical: 8.0),
                elevation: 4,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20.0),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '상세정보',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Colors.blue[900],
                          fontFamily: 'Raleway',
                        ),
                      ),
                      SizedBox(height: 10),
                      Center(
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(10),
                          child: Image.network(
                            item['item_image'],
                            width: 300,
                            height: 300,
                            fit: BoxFit.cover,
                          ),
                        ),
                      ),
                      SizedBox(height: 20),
                      buildInfoRow(Icons.confirmation_number, '식별 번호', item['item_seq']?.toString()),
                      buildInfoRow(Icons.medication, '약물 이름', item['item_name']),
                      buildInfoRow(Icons.business, '회사명', item['entp_name']),
                      buildInfoRow(Icons.category, '성상', item['chart']),
                      buildInfoRow(Icons.shape_line, '모양', item['drug_shape']),
                      buildInfoRow(Icons.color_lens, '색상1', item['color_class1']),
                      buildInfoRow(Icons.color_lens, '색상2', item['color_class2']),
                      buildInfoRow(Icons.local_hospital, '약효군', item['class_name']),
                      buildInfoRow(Icons.text_fields, '식별문자1', item['print_front']),
                      buildInfoRow(Icons.text_fields, '식별문자2', item['print_back']),
                    ],
                  ),
                ),
              );
            }).toList(),
          )
              : _results.isEmpty
              ? Text(
            '검색 결과가 없습니다.',
            style: TextStyle(
              fontSize: 16,
              color: Colors.grey[700],
              fontFamily: 'Raleway',
            ),
          )
              : CircularProgressIndicator(), // 검색 중일 때 로딩 표시
        ),
      ),
    );
  }
}
