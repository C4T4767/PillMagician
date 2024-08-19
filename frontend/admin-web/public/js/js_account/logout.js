$('#logout').click(function() {
    console.log("logout")
    // 서버로 로그아웃 요청을 보냅니다.
    $.ajax({
        url: '/admin/logout',
        type: 'GET',
        xhrFields: {
            withCredentials: true // 크로스 도메인 요청에 쿠키를 전송하기 위해 필요합니다.
        },
        success: function(response) {
            // 로그아웃이 성공한 경우
            alert('로그아웃되었습니다.');
            // 로그아웃 성공 시 홈페이지로 리디렉션 또는 다른 동작 수행
            window.location.href = '/admin/login';
        },
        error: function(xhr, status, error) {
            // 로그아웃이 실패한 경우
            console.error('로그아웃 요청 중 오류 발생:', error);
            alert('로그아웃에 실패했습니다.');
        }
    });
});
