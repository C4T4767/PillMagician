$(document).ready(function() {
    $('#login-form').submit(function(event) {
        // 폼 기본 동작 방지
        event.preventDefault();
        
        // 입력된 사용자 이름과 비밀번호 가져오기
        var email = $('#inputEmail').val();
        var password = $('#inputPassword').val();
        
        // 서버로 전송할 데이터 구성
        var data = {
            email: email,
            password: password
        };

        // AJAX 요청을 통해 서버로 데이터 전송
        $.ajax({
            type: 'POST',
            url: '/admin/login', // 로그인 엔드포인트 URL
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function(response) {
                // 로그인 성공 시 처리
                alert("로그인에 성공했습니다.");
                console.log(response);
                window.location.href = '/main'; // 대시보드 페이지 URL로 변경
            },
            error: function(xhr, status, error) {
                if (xhr.status === 401) {
                    alert("로그인에 실패했습니다. 사용자 이름 또는 비밀번호를 확인하세요.");
                    // 로그인 페이지로 이동
                    window.location.href = '/admin/login'; // 로그인 페이지 URL로 변경
                } else if (xhr.status === 500) {
                    //500 오류코드 페이지로 이동
                    window.location.href = '/err_500';
                }
                else if (xhr.status === 404) {
                    //404 오류코드 페이지로 이동
                    window.location.href = '/err_404';
                } else {
                    alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
                }
            }
        });
    });
});
