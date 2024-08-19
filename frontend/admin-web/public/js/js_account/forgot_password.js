$(document).ready(function() {
    $('#forgotPasswordForm').submit(function(event) {
        // 폼의 기본 동작을 막음 (페이지 새로고침 방지)
        event.preventDefault();
        
        // form 데이터를 가져옴
        var formData = $(this).serialize();
        
        // AJAX 요청을 보냄
        $.ajax({
            type: 'POST',
            url: '/admin/forgotPassword',
            data: formData,
            success: function(response) {
                // 성공 시 경고창 표시
                alert("이메일이 성공적으로 전송되었습니다.");
                res.redirect('/admin/login');
            },
            error: function(xhr, status, error) {
                // 오류 시 경고창 표시
                alert("오류가 발생했습니다: " + error);
            }
        });
    });
});
