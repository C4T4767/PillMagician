import 'package:flutter/material.dart';
import 'package:pill_magician/API/APIService.dart';
import 'package:pill_magician/Screens/SearchResult/NameSearchResultScreen.dart';
import 'package:pill_magician/Storage/SessionManager.dart';

class FeatureSearchResultScreen extends StatefulWidget {
  final List<dynamic> itemList;

  const FeatureSearchResultScreen({
    Key? key,
    required this.itemList,
  }) : super(key: key);

  @override
  _FeatureSearchResultScreenState createState() => _FeatureSearchResultScreenState();
}

class _FeatureSearchResultScreenState extends State<FeatureSearchResultScreen> {
  late String? _userNum; // 사용자 번호

  @override
  void initState() {
    super.initState();
    _getUserNum();
  }

  void _getUserNum() async {
    // 사용자 번호 가져오기
    final userNum = await SessionManager.getUserNum();
    setState(() {
      _userNum = userNum;
    });
  }

  void _addBookmark(String? userNum, String? itemSeq) async {
    try {
      if (userNum == null) {
        // 사용자가 로그인하지 않은 경우
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('로그인 후 북마크해주세요.'),
          ),
        );
        return;
      }
      // 북마크 추가
      await APIService().addBookmark(userNum, itemSeq);

      // 북마크 추가 성공 시 메시지 표시
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('북마크 되었습니다.'),
        ),
      );
    } catch (e) {
      print('Failed to add bookmark: $e');
      // 북마크 추가 실패 시 메시지 표시
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('$e'),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Feature Search Result',
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
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Expanded(
                child: ListView.builder(
                  itemCount: widget.itemList.length,
                  itemBuilder: (context, index) {
                    final item = widget.itemList[index];
                    final String _itemSeq = item['item_seq'].toString();
                    return Card(
                      margin: EdgeInsets.symmetric(vertical: 8.0),
                      elevation: 4,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20.0),
                      ),
                      child: ListTile(
                        leading: ClipRRect(
                          borderRadius: BorderRadius.circular(10),
                          child: Image.network(
                            item['item_image'],
                            width: 50,
                            height: 50,
                            fit: BoxFit.cover,
                          ),
                        ),
                        title: Text(
                          item['item_name'],
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.blue[900],
                            fontFamily: 'Raleway',
                          ),
                        ),
                        subtitle: Text(
                          item['entp_name'],
                          style: TextStyle(
                            fontSize: 16,
                            color: Colors.grey[700],
                            fontFamily: 'Raleway',
                          ),
                        ),
                        trailing: IconButton(
                          icon: Icon(Icons.bookmark, color: Colors.lightBlue[700]),
                          onPressed: () {
                            _addBookmark(_userNum, _itemSeq);
                          },
                        ),
                        onTap: () {
                          // 선택한 알약 상세보기
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => NameSearchResultScreen(drugName: item['item_name']),
                            ),
                          );
                        },
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
